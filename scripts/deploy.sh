#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_DIR="$ROOT_DIR/terraform/azure"
REGISTRY="dronacharyaacr.azurecr.io"
IMAGE_NAME="dronacharya/web"
APP_NAME="dronacharya-production-app"
RG_NAME="dronacharya-production-rg"

log_info()    { echo -e "${BLUE}==>${NC} $1"; }
log_success() { echo -e "${GREEN}✔${NC}  $1"; }
log_warn()    { echo -e "${YELLOW}!${NC}  $1"; }
log_error()   { echo -e "${RED}✖${NC}  $1"; }

usage() {
  cat <<EOF
Usage: $0 [init|plan|apply|deploy|all]

Stages:
  init    Terraform init
  plan    Terraform plan (auto-generates secrets if not set)
  apply   Terraform apply + save outputs
  deploy  Docker build, push to ACR, deploy to App Service
  all     Run all stages in sequence (default)

Environment variables (auto-generated if not set):
  TF_VAR_postgres_admin_password
  TF_VAR_nextauth_secret

Note: Azure OpenAI API key is read from the provisioned resource after apply.
      ChromaDB is provisioned as an Azure Container Instance via Terraform.
EOF
}

check_prereqs() {
  log_info "Checking prerequisites..."
  local missing=0

  if ! command -v az >/dev/null 2>&1; then
    log_error "Azure CLI (az) not found"; missing=1
  elif ! az account show >/dev/null 2>&1; then
    log_error "Not logged in to Azure (run: az login)"; missing=1
  else
    log_success "Azure CLI logged in"
  fi

  if ! command -v terraform >/dev/null 2>&1; then
    log_error "Terraform not found"; missing=1
  else
    log_success "Terraform installed"
  fi

  if ! command -v docker >/dev/null 2>&1; then
    log_warn "Docker not found (needed for deploy stage)"
  fi

  [[ $missing -eq 0 ]] || { log_error "Missing prerequisites"; exit 1; }
}

ensure_secrets() {
  log_info "Checking environment variables..."

  if [[ -z "${TF_VAR_postgres_admin_password:-}" ]]; then
    export TF_VAR_postgres_admin_password="$(openssl rand -base64 24)"
    log_warn "Generated TF_VAR_postgres_admin_password"
  fi

  if [[ -z "${TF_VAR_nextauth_secret:-}" ]]; then
    export TF_VAR_nextauth_secret="$(openssl rand -base64 32)"
    log_warn "Generated TF_VAR_nextauth_secret"
  fi

  log_success "All required variables set"
}

stage_init() {
  log_info "Terraform init"
  cd "$TF_DIR"
  terraform init
  log_success "Terraform initialized"
}

stage_plan() {
  ensure_secrets
  log_info "Terraform plan"
  cd "$TF_DIR"
  terraform plan -out=tfplan
  log_success "Plan saved to terraform/azure/tfplan"
}

stage_apply() {
  log_info "Terraform apply"
  cd "$TF_DIR"

  if [[ ! -f tfplan ]]; then
    log_error "No tfplan found. Run 'plan' stage first."
    exit 1
  fi

  terraform apply tfplan
  log_success "Infrastructure provisioned"

  log_info "Saving outputs..."
  terraform output -json > "$ROOT_DIR/.terraform-outputs.json"
  log_success "Outputs saved to .terraform-outputs.json"

  echo ""
  log_info "DNS Nameservers (configure at your domain registrar):"
  terraform output -json dns_nameservers | jq -r '.[]' 2>/dev/null || terraform output dns_nameservers
  echo ""
  log_warn "Point dronacharya.app NS records to these nameservers"
}

stage_deploy() {
  log_info "Building Docker image..."
  cd "$ROOT_DIR"

  local tag
  tag="$(git rev-parse --short HEAD)"

  docker build -t "$REGISTRY/$IMAGE_NAME:$tag" -t "$REGISTRY/$IMAGE_NAME:latest" .
  log_success "Image built: $REGISTRY/$IMAGE_NAME:$tag"

  log_info "Pushing to ACR..."
  az acr login --name dronacharyaacr 2>/dev/null || {
    log_warn "ACR login via az failed, trying docker login..."
    docker login "$REGISTRY" -u "$ACR_USERNAME" -p "$ACR_PASSWORD"
  }

  docker push "$REGISTRY/$IMAGE_NAME:$tag"
  docker push "$REGISTRY/$IMAGE_NAME:latest"
  log_success "Image pushed to ACR"

  log_info "Deploying to App Service..."
  az webapp config container set \
    --name "$APP_NAME" \
    --resource-group "$RG_NAME" \
    --container-image-name "$REGISTRY/$IMAGE_NAME:$tag" \
    --container-registry-url "https://$REGISTRY"

  az webapp restart --name "$APP_NAME" --resource-group "$RG_NAME"
  log_success "Deployed $tag to $APP_NAME"

  echo ""
  log_info "Verify: https://www.dronacharya.app/api/health"
}

STAGE="${1:-all}"

case "$STAGE" in
  init)
    check_prereqs
    stage_init
    ;;
  plan)
    check_prereqs
    stage_plan
    ;;
  apply)
    check_prereqs
    stage_apply
    ;;
  deploy)
    check_prereqs
    stage_deploy
    ;;
  all)
    check_prereqs
    stage_init
    stage_plan
    stage_apply
    stage_deploy
    ;;
  -h|--help)
    usage
    ;;
  *)
    log_error "Unknown stage: $STAGE"
    usage
    exit 1
    ;;
esac
