#!/usr/bin/env bash
set -euo pipefail

DEFAULT_URL='https://www.dronacharya.app'
BASE_URL="${DEFAULT_URL}"
VERBOSE=false
JSON_OUTPUT=false

usage() {
  cat <<'USAGE'
Usage: smoke-test.sh [--url <url>] [--verbose] [--json]

Options:
  --url      Base URL to test (default: https://www.dronacharya.app)
  --verbose  Enable verbose curl output
  --json     Output results in JSON format
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      if [[ $# -lt 2 ]]; then
        echo "Error: --url requires a value"
        usage
        exit 1
      fi
      BASE_URL="$2"
      shift 2
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown argument '$1'"
      usage
      exit 1
      ;;
  esac
done

BASE_URL="${BASE_URL%/}"

if ! command -v curl >/dev/null 2>&1; then
  echo 'curl is required for this script.'
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo 'openssl is required for certificate validation.'
  exit 1
fi

CURL_OPTS=(--silent --show-error --max-time 15 --connect-timeout 10)
if [[ "${VERBOSE}" == true ]]; then
  CURL_OPTS+=(--verbose)
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT

declare -a CHECK_NAMES=()
declare -a CHECK_RESULTS=()
declare -a CHECK_DETAILS=()

record_check() {
  local name="$1"
  local passed="$2"
  local detail="$3"

  CHECK_NAMES+=("${name}")
  CHECK_RESULTS+=("${passed}")
  CHECK_DETAILS+=("${detail}")
}

run_request() {
  local path="$1"
  local body_file="$2"
  local url="${BASE_URL}${path}"
  local response=""
  local status="000"
  local elapsed="0"

  if [[ "${VERBOSE}" == true ]]; then
    if response="$(curl "${CURL_OPTS[@]}" "${url}" -o "${body_file}" -w '%{http_code}\n%{time_total}')"; then
      read -r status elapsed <<<"${response}"
    else
      status="000"
      elapsed="999"
    fi
  else
    if response="$(curl "${CURL_OPTS[@]}" "${url}" -o "${body_file}" -w '%{http_code}\n%{time_total}' 2>"${tmp_dir}/curl.err")"; then
      read -r status elapsed <<<"${response}"
    else
      status="000"
      elapsed="999"
    fi
  fi

  echo "${status}|${elapsed}"
}

is_status_ok() {
  local value="$1"
  [[ "${value}" == "200" ]]
}

is_redirect() {
  local value="$1"
  case "${value}" in
    3[0-9][0-9]) return 0 ;;
    *) return 1 ;;
  esac
}

valid_xml() {
  local file="$1"

  if command -v python3 >/dev/null 2>&1; then
    if python3 -c 'import sys; import xml.etree.ElementTree as ET; ET.parse(sys.argv[1])' "${file}" >/dev/null 2>&1; then
      return 0
    fi
    return 1
  fi

  if command -v xmllint >/dev/null 2>&1; then
    if xmllint --noout "${file}" >/dev/null 2>&1; then
      return 0
    fi
    return 1
  fi

  return 1
}

json_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//"/\\\"}"
  value="${value//$'\n'/ }"
  printf '%s' "${value}"
}

landing_body="${tmp_dir}/landing.html"
read -r landing_status landing_time <<<"$(run_request '/' "${landing_body}")"
if is_status_ok "${landing_status}" && grep -q 'Dronacharya' "${landing_body}"; then
  record_check 'Landing page loads' true "status=${landing_status} and contains Dronacharya"
else
  record_check 'Landing page loads' false "status=${landing_status}; response does not contain Dronacharya"
fi

login_body="${tmp_dir}/login.html"
read -r login_status _ <<<"$(run_request '/auth/login' "${login_body}")"
if is_status_ok "${login_status}"; then
  record_check 'Login page loads' true "status=${login_status}"
else
  record_check 'Login page loads' false "status=${login_status}"
fi

register_body="${tmp_dir}/register.html"
read -r register_status _ <<<"$(run_request '/auth/register' "${register_body}")"
if is_status_ok "${register_status}"; then
  record_check 'Register page loads' true "status=${register_status}"
else
  record_check 'Register page loads' false "status=${register_status}"
fi

health_body="${tmp_dir}/health.json"
read -r health_status _ <<<"$(run_request '/api/health' "${health_body}")"
if is_status_ok "${health_status}" && grep -qi 'healthy' "${health_body}"; then
  record_check 'Health check' true "status=${health_status} and response contains healthy"
else
  record_check 'Health check' false "status=${health_status}; response did not include healthy"
fi

ready_body="${tmp_dir}/ready.txt"
read -r ready_status _ <<<"$(run_request '/api/ready' "${ready_body}")"
if is_status_ok "${ready_status}"; then
  record_check 'Readiness check' true "status=${ready_status}"
else
  record_check 'Readiness check' false "status=${ready_status}"
fi

metrics_body="${tmp_dir}/metrics.txt"
read -r metrics_status _ <<<"$(run_request '/api/metrics' "${metrics_body}")"
if is_status_ok "${metrics_status}"; then
  record_check 'Metrics endpoint' true "status=${metrics_status}"
else
  record_check 'Metrics endpoint' false "status=${metrics_status}"
fi

sitemap_body="${tmp_dir}/sitemap.xml"
read -r sitemap_status _ <<<"$(run_request '/sitemap.xml' "${sitemap_body}")"
if is_status_ok "${sitemap_status}" && valid_xml "${sitemap_body}"; then
  record_check 'Sitemap' true "status=${sitemap_status} and valid XML"
else
  record_check 'Sitemap' false "status=${sitemap_status}; invalid XML response"
fi

robots_body="${tmp_dir}/robots.txt"
read -r robots_status _ <<<"$(run_request '/robots.txt' "${robots_body}")"
if is_status_ok "${robots_status}" && grep -q 'Sitemap:' "${robots_body}"; then
  record_check 'Robots.txt' true "status=${robots_status} and contains Sitemap:"
else
  record_check 'Robots.txt' false "status=${robots_status}; missing Sitemap:"
fi

dashboard_body="${tmp_dir}/dashboard.txt"
read -r dashboard_status _ <<<"$(run_request '/dashboard' "${dashboard_body}")"
if is_redirect "${dashboard_status}"; then
  record_check 'Dashboard redirect' true "status=${dashboard_status}"
else
  record_check 'Dashboard redirect' false "status=${dashboard_status}; expected 3xx redirect"
fi

if [[ "${BASE_URL}" == https://* ]]; then
  host_and_port="${BASE_URL#https://}"
  host_and_port="${host_and_port%%/*}"
  if [[ "${host_and_port}" == *:* ]]; then
    ssl_host="${host_and_port%%:*}"
    ssl_port="${host_and_port#*:}"
  else
    ssl_host="${host_and_port}"
    ssl_port=443
  fi

  ssl_check="$(printf '' | openssl s_client -connect "${ssl_host}:${ssl_port}" -servername "${ssl_host}" -brief 2>/dev/null || true)"
  if echo "${ssl_check}" | grep -q 'Verify return code: 0'; then
    record_check 'SSL certificate' true 'certificate chain validated'
  else
    record_check 'SSL certificate' false 'openssl validation failed or certificate is invalid'
  fi
else
  record_check 'SSL certificate' false "non-HTTPS URL (${BASE_URL}); cannot validate TLS"
fi

if is_status_ok "${landing_status}" && awk -v time="${landing_time}" 'BEGIN { exit !(time < 3.0); }'; then
  record_check 'Landing page response time' true "${landing_time}s"
else
  record_check 'Landing page response time' false "${landing_time}s (expected < 3s)"
fi

if [[ "${JSON_OUTPUT}" == true ]]; then
  all_passed=true
  for result in "${CHECK_RESULTS[@]}"; do
    if [[ "${result}" == false ]]; then
      all_passed=false
      break
    fi
  done

  printf '{\n'
  printf '  "baseUrl": "%s",\n' "${BASE_URL}"
  printf '  "allPassed": %s,\n' "${all_passed}"
  printf '  "results": [\n'

  i=0
  for ((i = 0; i < ${#CHECK_NAMES[@]}; i += 1)); do
    comma=""
    result_value=""
    detail=""
    result_value="${CHECK_RESULTS[${i}]}"
    detail="$(json_escape "${CHECK_DETAILS[${i}]}")"

    if (( i == ${#CHECK_NAMES[@]} - 1 )); then
      comma=""
    else
      comma="," 
    fi

    printf '    {"name": "%s", "passed": %s, "details": "%s"}%s\n' \
      "${CHECK_NAMES[$i]}" "${result_value}" "${detail}" "${comma}"
  done
  printf '  ]\n'
  printf '}\n'

  if [[ "${all_passed}" == true ]]; then
    exit 0
  else
    exit 1
  fi
fi

printf '\nSmoke test summary for %s\n' "${BASE_URL}"
printf '%-38s %-8s %s\n' 'Check' 'Result' 'Details'
printf '%-38s %-8s %s\n' '-----' '------' '-------'

all_passed=true
for ((i = 0; i < ${#CHECK_NAMES[@]}; i += 1)); do
  status="${CHECK_RESULTS[$i]}"
  display="FAIL"
  if [[ "${status}" == true ]]; then
    display="PASS"
  else
    all_passed=false
  fi
  printf '%-38s %-8s %s\n' "${CHECK_NAMES[$i]}" "${display}" "${CHECK_DETAILS[$i]}"
done

printf '\n'
if [[ "${all_passed}" == true ]]; then
  echo 'All checks passed.'
  exit 0
fi

echo 'One or more checks failed.'
exit 1
