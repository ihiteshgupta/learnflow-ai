#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUTS_FILE="$ROOT_DIR/.terraform-outputs.json"
SEED_FILE="$ROOT_DIR/scripts/seed-beta-content.ts"

STAGE="all"
DATABASE_URL_ARG=""

log_info() {
  echo -e "${BLUE}==>${NC} $1"
}

log_success() {
  echo -e "${GREEN}✔${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}!${NC} $1"
}

log_error() {
  echo -e "${RED}✖${NC} $1"
}

usage() {
  cat <<EOF
Usage: $0 [--url <DATABASE_URL>] [migrate|seed|verify|all]

Environment:
  DATABASE_URL      Database URL to use

Stages:
  migrate           Run: DATABASE_URL=$URL pnpm db:push
  seed              Run: DATABASE_URL=$URL pnpm tsx scripts/seed-beta-content.ts
  verify            Verify key tables and row counts
  all               Run migrate, seed, verify (default)

If no URL is provided, the script reads .terraform-outputs.json and uses the
postgres_host output to build the URL.
EOF
}

pick_terraform_output() {
  local key="$1"
  if [[ ! -f "$OUTPUTS_FILE" ]]; then
    return 1
  fi

  local value=""
  if command -v jq >/dev/null 2>&1; then
    value=$(jq -r "(.${key}.value // .${key} // .value.${key}.value // .value.${key} // empty)" "$OUTPUTS_FILE" || true)
  else
    value=$(node -e 'const fs = require("fs");
      const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      const key = process.argv[2];
      const walk = (obj) => {
        if (!obj || typeof obj !== "object") return "";
        if (typeof obj[key] === "string") return obj[key];
        if (obj[key] && typeof obj[key] === "object" && typeof obj[key].value === "string") return obj[key].value;
        if (obj.value && typeof obj.value === "object") {
          const nested = walk(obj.value);
          if (nested) return nested;
        }
        for (const v of Object.values(obj)) {
          if (v && typeof v === "object") {
            const nested = walk(v);
            if (nested) return nested;
          }
        }
        return "";
      };
      const result = walk(data);
      process.stdout.write(result || "");' "$OUTPUTS_FILE" "$key")
  fi

  if [[ -z "$value" || "$value" == "null" ]]; then
    return 1
  fi

  echo "$value"
}

resolve_database_url() {
  if [[ -n "${DATABASE_URL_ENV:-}" ]]; then
    echo "$DATABASE_URL_ENV"
    return 0
  fi

  local host=""
  host=$(pick_terraform_output "postgres_host" || true)
  if [[ -z "$host" ]]; then
    return 1
  fi

  if [[ "$host" == postgres*"://"* ]]; then
    echo "$host"
    return 0
  fi

  local port="${PGPORT:-${POSTGRES_PORT:-5432}}"
  local user="${PGUSER:-${POSTGRES_USER:-postgres}}"
  local password="${PGPASSWORD:-${POSTGRES_PASSWORD:-}}"
  local database="${PGDATABASE:-${POSTGRES_DB:-postgres}}"

  if [[ "$host" == *:* ]]; then
    if [[ -n "$password" ]]; then
      echo "postgresql://$user:$password@$host/$database"
    else
      echo "postgresql://$user@$host/$database"
    fi
  else
    if [[ -n "$password" ]]; then
      echo "postgresql://$user:$password@$host:$port/$database"
    else
      echo "postgresql://$user@$host:$port/$database"
    fi
  fi
}

run_command() {
  local label="$1"
  shift
  if "$@"; then
    log_success "$label"
  else
    log_error "$label"
    return 1
  fi
}

run_migrate() {
  log_info "Running migrate (pnpm db:push)"
  run_command "Migrate completed" env DATABASE_URL="$DATABASE_URL" pnpm db:push
}

run_seed() {
  if [[ ! -f "$SEED_FILE" ]]; then
    log_error "Seed file not found: $SEED_FILE"
    return 1
  fi

  log_info "Running seed"
  run_command "Seed completed" env DATABASE_URL="$DATABASE_URL" pnpm tsx "$SEED_FILE"
}

print_summary() {
  local output="$1"

  printf "\n%s\n" "Table           | Rows"
  printf "%s\n" "----------------+------"

  if [[ -z "$output" ]]; then
    log_warn "No rows returned from verification query"
    return
  fi

  while IFS='|' read -r table count; do
    if [[ -z "$table" ]]; then
      continue
    fi
    printf "%-15s | %s\n" "$table" "$count"
  done <<< "$output"
}

run_verify_psql() {
  local output
  if ! output=$(DATABASE_URL="$DATABASE_URL" psql "$DATABASE_URL" \
    -v ON_ERROR_STOP=1 \
    -A -F '|' -P pager=off -P footer=off -q <<'SQL'
WITH counts AS (
  SELECT
    'users' AS table_name,
    CASE
      WHEN to_regclass('public.users') IS NOT NULL THEN (SELECT COUNT(*) FROM public.users)
      ELSE NULL
    END AS row_count
  UNION ALL
  SELECT
    'domains',
    CASE
      WHEN to_regclass('public.domains') IS NOT NULL THEN (SELECT COUNT(*) FROM public.domains)
      ELSE NULL
    END
  UNION ALL
  SELECT
    'courses',
    CASE
      WHEN to_regclass('public.courses') IS NOT NULL THEN (SELECT COUNT(*) FROM public.courses)
      ELSE NULL
    END
  UNION ALL
  SELECT
    'achievements',
    CASE
      WHEN to_regclass('public.achievements') IS NOT NULL THEN (SELECT COUNT(*) FROM public.achievements)
      ELSE NULL
    END
)
SELECT table_name, COALESCE(row_count::text, 'MISSING')
FROM counts
ORDER BY table_name;
SQL
  ); then
    log_error "Verify failed (psql query)"
    return 1
  fi
  print_summary "$output"
}

run_verify_node() {
  local output
  if ! output=$(DATABASE_URL="$DATABASE_URL" node -e '
    const { Client } = require("pg");
    const tables = ["users", "domains", "courses", "achievements"];
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error("DATABASE_URL is required");
      process.exit(1);
    }

    (async () => {
      const client = new Client({ connectionString: url });
      try {
        await client.connect();
        const rows = [];
        for (const table of tables) {
          const existsRes = await client.query(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) AS exists",
            [table],
          );
          const exists = existsRes.rows[0]?.exists;
          if (!exists) {
            rows.push({ table, count: "MISSING" });
            continue;
          }

          const countRes = await client.query(`SELECT COUNT(*)::text AS count FROM "${table.replace(/"/g, "\"")}"`);
          rows.push({ table, count: countRes.rows[0].count });
        }

        console.log("Table           | Rows");
        console.log("----------------+------");
        for (const row of rows) {
          console.log(`${row.table.padEnd(15, " ")} | ${row.count}`);
        }
      } catch (err) {
        console.error(err.message || err);
        process.exit(1);
      } finally {
        await client.end();
      }
    })();
  '); then
    log_error "Verify failed (Node.js)"
    return 1
  fi
  echo "$output"
  return 0
}

run_verify() {
  log_info "Verifying schema and counts"

  if command -v psql >/dev/null 2>&1; then
    run_verify_psql
    log_success "Verify completed"
    return
  fi

  if ! command -v node >/dev/null 2>&1; then
    log_error "Neither psql nor node is available for verification"
    return 1
  fi

  log_warn "psql not found; falling back to Node.js verification with pg"
  run_verify_node
  log_success "Verify completed"
}

run_stage() {
  case "$1" in
    migrate)
      run_migrate
      ;;
    seed)
      run_seed
      ;;
    verify)
      run_verify
      ;;
    all)
      run_migrate
      run_seed
      run_verify
      ;;
  esac
}

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --url)
      if [[ "$#" -lt 2 ]]; then
        log_error "--url requires a value"
        usage
        exit 1
      fi
      DATABASE_URL_ARG="$2"
      shift 2
      ;;
    migrate|seed|verify|all)
      STAGE="$1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      log_error "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

DATABASE_URL_ENV="${DATABASE_URL:-}"
if [[ -n "${DATABASE_URL_ARG}" ]]; then
  DATABASE_URL="$DATABASE_URL_ARG"
elif [[ -n "${DATABASE_URL_ENV}" ]]; then
  DATABASE_URL="$DATABASE_URL_ENV"
else
  DATABASE_URL="$(resolve_database_url || true)"
fi

if [[ -z "${DATABASE_URL}" ]]; then
  log_error "DATABASE_URL is required and could not be resolved."
  log_info "Provide --url or set DATABASE_URL, or create .terraform-outputs.json with postgres_host."
  exit 1
fi

log_info "Using DATABASE_URL: ${DATABASE_URL//:*@/*:***@}"
run_stage "$STAGE"
