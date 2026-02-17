#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUTS_FILE="$ROOT_DIR/.terraform-outputs.json"

COUNT="10"
STAGE_URL=""

log_info() {
  echo -e "${BLUE}==>${NC} $1"
}

log_success() {
  echo -e "${GREEN}✔${NC} $1"
}

log_error() {
  echo -e "${RED}✖${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}!${NC} $1"
}

usage() {
  cat <<EOF
Usage: $0 [count] [--url DATABASE_URL]

Arguments:
  count            Number of invite codes to generate (default: 10)
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

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --url)
      if [[ "$#" -lt 2 ]]; then
        log_error "--url requires a value"
        usage
        exit 1
      fi
      STAGE_URL="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --*)
      log_error "Unknown option: $1"
      usage
      exit 1
      ;;
    *)
      if [[ "$COUNT" == "10" ]]; then
        COUNT="$1"
      else
        log_error "Only one positional argument (count) is supported."
        exit 1
      fi
      shift
      ;;
  esac
done

if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || (( COUNT <= 0 )); then
  log_error "Count must be a positive integer."
  exit 1
fi

DATABASE_URL_ENV="${DATABASE_URL:-}"
if [[ -n "${STAGE_URL}" ]]; then
  DATABASE_URL="${STAGE_URL}"
elif [[ -n "${DATABASE_URL_ENV}" ]]; then
  DATABASE_URL="${DATABASE_URL_ENV}"
else
  DATABASE_URL="$(resolve_database_url || true)"
fi

if [[ -z "${DATABASE_URL}" ]]; then
  log_error "DATABASE_URL is required and could not be resolved."
  log_info "Provide --url or set DATABASE_URL, or create .terraform-outputs.json with postgres_host."
  exit 1
fi

log_info "Using DATABASE_URL: ${DATABASE_URL//:*@/*:***@}"
log_info "Generating $COUNT invite code(s)"

if ! DATABASE_URL="$DATABASE_URL" node -e '
    const { Client } = require("pg");
    const count = Number(process.argv[2]);
    const url = process.env.DATABASE_URL;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    if (!url) {
      console.error("DATABASE_URL is required");
      process.exit(1);
    }
    if (!Number.isInteger(count) || count <= 0) {
      console.error("Count must be a positive integer");
      process.exit(1);
    }

    const randomCode = () =>
      Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    (async () => {
      const client = new Client({ connectionString: url });
      try {
        await client.connect();

        const tableExists = await client.query(
          "SELECT to_regclass('public.beta_invites') IS NOT NULL AS exists"
        );
        if (!tableExists.rows[0]?.exists) {
          console.error("Missing table: beta_invites");
          process.exit(1);
        }

        const codes = new Set();
        while (codes.size < count) {
          const need = count - codes.size;
          const batch = [];
          while (batch.length < need) {
            batch.push(randomCode());
          }

          const uniqueBatch = [...new Set(batch)];
          const placeholders = uniqueBatch.map((_, idx) => `($${idx + 1})`).join(", ");
          const query = `INSERT INTO beta_invites (code) VALUES ${placeholders} ON CONFLICT (code) DO NOTHING RETURNING code`;
          const res = await client.query(query, uniqueBatch);
          for (const row of res.rows) {
            codes.add(row.code);
          }
        }

        if (codes.size === 0) {
          console.log("No invite codes were inserted.");
          return;
        }

        console.log(`Generated ${codes.size} code(s):`);
        for (const code of codes) {
          console.log(code);
        }
      } catch (err) {
        console.error(err.message || err);
        process.exit(1);
      } finally {
        await client.end();
      }
    })();
  ' "$COUNT"
then
  log_error "Invite generation failed."
  exit 1
fi

log_success "Invite generation completed."
