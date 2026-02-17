#!/usr/bin/env bash
set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUTS_FILE="$ROOT_DIR/.terraform-outputs.json"
DOMAIN="dronacharya.app"

log_info() { echo -e "${BLUE}==>${NC} $1"; }
log_success() { echo -e "${GREEN}✔${NC}  $1"; }
log_warn() { echo -e "${YELLOW}!${NC}  $1"; }

if [[ ! -f "$OUTPUTS_FILE" ]]; then
  echo "No .terraform-outputs.json found. Run: scripts/deploy.sh apply"
  exit 1
fi

echo ""
log_info "DNS Setup for $DOMAIN"
echo "========================================="
echo ""

echo "Step 1: Get nameservers from Terraform output"
echo ""

if command -v jq >/dev/null 2>&1; then
  NS=$(jq -r '.dns_nameservers.value[]' "$OUTPUTS_FILE" 2>/dev/null || echo "")
else
  NS=$(node -e '
    const d = require(fs.readFileSync(process.argv[1],"utf8"));
    const o = JSON.parse(d);
    (o.dns_nameservers?.value || []).forEach(n => console.log(n));
  ' "$OUTPUTS_FILE" 2>/dev/null || echo "")
fi

if [[ -z "$NS" ]]; then
  log_warn "Could not read nameservers from outputs. Run:"
  echo "  cd terraform/azure && terraform output dns_nameservers"
  exit 1
fi

echo "Nameservers to configure at your domain registrar:"
echo ""
echo "$NS" | while read -r ns; do
  echo "  $ns"
done
echo ""

echo "Step 2: Update NS records at your registrar"
echo ""
echo "  Go to your domain registrar (e.g. Namecheap, GoDaddy, Cloudflare)"
echo "  Set the nameservers for $DOMAIN to the values above"
echo "  Remove any existing NS records"
echo ""

echo "Step 3: Verify DNS propagation"
echo ""
echo "  Run these commands to check:"
echo ""
echo "  dig NS $DOMAIN +short"
echo "  dig A $DOMAIN +short"
echo "  dig CNAME www.$DOMAIN +short"
echo "  dig CNAME api.$DOMAIN +short"
echo ""

log_warn "DNS propagation can take up to 48 hours"
echo ""

echo "Step 4: Verify HTTPS"
echo ""
echo "  curl -I https://www.$DOMAIN"
echo "  curl -I https://api.$DOMAIN"
echo ""

log_success "DNS setup instructions complete"
