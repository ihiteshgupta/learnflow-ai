# Dronacharya Production Deployment Guide

Deploy Dronacharya to Azure App Service with PostgreSQL Flexible Server, Redis, and ACR.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                            │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────────────┐  │
│  │  Test   │───>│  Build  │───>│  Push to ACR + Deploy   │  │
│  └─────────┘    └─────────┘    └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           v
┌─────────────────────────────────────────────────────────────┐
│                        Azure                                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Azure DNS (dronacharya.app)                         │    │
│  │  www.dronacharya.app  -> App Service                 │    │
│  │  api.dronacharya.app  -> App Service                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Azure App Service (Linux, Docker container)         │    │
│  │  Custom domains + Azure Managed Certificates (SSL)   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ PostgreSQL      │  │ Redis Cache    │  │ ACR           │  │
│  │ Flexible Server │  │ (rate limiting)│  │ Container     │  │
│  │ B_Standard_B1ms │  │ Basic C0       │  │ Registry      │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Azure CLI** installed and logged in (`az login`)
- **Terraform** v1.0+
- **Docker** for building container images
- Domain `dronacharya.app` with access to NS records

## Deploy

### 1. Provision Infrastructure

```bash
cd terraform/azure

# Set required variables
export TF_VAR_postgres_admin_password="<secure-password>"
export TF_VAR_anthropic_api_key="sk-ant-..."
export TF_VAR_openai_api_key="sk-..."
export TF_VAR_nextauth_secret="$(openssl rand -base64 32)"

terraform init
terraform apply
```

This creates: App Service, PostgreSQL Flexible Server, Redis, ACR, DNS zone, and all networking.

### 2. DNS Setup

Point `dronacharya.app` nameservers to Azure DNS at your domain registrar:

```bash
# Get the nameservers
az network dns zone show \
  --resource-group dronacharya-production-rg \
  --name dronacharya.app \
  --query nameServers -o tsv
```

Update your registrar's NS records to the returned values. Verify:

```bash
dig dronacharya.app NS
dig www.dronacharya.app A
```

### 3. Build and Push Docker Image

```bash
# Login to ACR
az acr login --name dronacharyaacr

# Build and push
docker build -t dronacharyaacr.azurecr.io/dronacharya:latest .
docker push dronacharyaacr.azurecr.io/dronacharya:latest
```

### 4. Deploy Container to App Service

```bash
az webapp config container set \
  --name dronacharya-production \
  --resource-group dronacharya-production-rg \
  --container-image-name dronacharyaacr.azurecr.io/dronacharya:latest \
  --container-registry-url https://dronacharyaacr.azurecr.io
```

### 5. Run Database Migrations

```bash
# Get DATABASE_URL from Terraform output
export DATABASE_URL="$(terraform -chdir=terraform/azure output -raw database_url)"

pnpm db:push
pnpm db:seed
```

## Environment Variables

Managed via Terraform `app_settings` block. No manual configuration needed after `terraform apply`.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `NEXTAUTH_URL` | `https://www.dronacharya.app` |
| `NEXTAUTH_SECRET` | Random secret for sessions |
| `NEXT_PUBLIC_APP_URL` | `https://www.dronacharya.app` |
| `NEXT_PUBLIC_API_URL` | `https://api.dronacharya.app` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `QDRANT_URL` | Qdrant vector database URL |
| `QDRANT_API_KEY` | Qdrant API key |

## Custom Domains & SSL

Both custom domains are managed via Terraform:

- `www.dronacharya.app`
- `api.dronacharya.app`

SSL uses **Azure Managed Certificates** -- free and auto-renewed. No manual certificate management required.

## CI/CD

GitHub Actions auto-deploys on push to `main`:

1. Runs tests
2. Builds Docker image
3. Pushes to ACR
4. Updates App Service container image

Required GitHub Secrets:

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | Service principal JSON |
| `ACR_LOGIN_SERVER` | `dronacharyaacr.azurecr.io` |
| `NEXTAUTH_SECRET` | Session secret |
| `ANTHROPIC_API_KEY` | Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |

## Database

**PostgreSQL Flexible Server** (B_Standard_B1ms), managed via Terraform.

- Firewall rules allow App Service VNet integration
- Connection string injected as app setting
- Backups: Azure-managed with 7-day retention

## Redis

**Azure Cache for Redis** (Basic C0), managed via Terraform.

- Used for rate limiting and session caching
- Connection string injected as app setting

## Monitoring

### App Service Logs

```bash
# Stream live logs
az webapp log tail \
  --name dronacharya-production \
  --resource-group dronacharya-production-rg

# Download logs
az webapp log download \
  --name dronacharya-production \
  --resource-group dronacharya-production-rg
```

### Health Check

```bash
curl https://www.dronacharya.app/api/health
```

### Application Insights (Optional)

Enable in Terraform for request tracing, error tracking, and performance metrics. Add the instrumentation key as an app setting.

## Troubleshooting

**Container fails to start:**
```bash
az webapp log tail --name dronacharya-production --resource-group dronacharya-production-rg
```

**Database connection fails:**
```bash
# Check VNet integration and firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group dronacharya-production-rg \
  --name dronacharya-production-postgres
```

**Restart the app:**
```bash
az webapp restart \
  --name dronacharya-production \
  --resource-group dronacharya-production-rg
```

## Cost Estimate

| Resource | SKU | Est. Monthly Cost |
|----------|-----|-------------------|
| App Service | B1 (Linux) | ~$13 |
| PostgreSQL Flexible Server | B_Standard_B1ms | ~$25 |
| Redis Cache | Basic C0 | ~$16 |
| Azure Container Registry | Basic | ~$5 |
| Azure DNS Zone | Standard | ~$1 |
| **Total** | | **~$60/month** |

## Security Checklist

- [ ] All secrets managed via Terraform app_settings (not committed)
- [ ] PostgreSQL firewall restricts access to App Service VNet
- [ ] HTTPS enforced (Azure Managed Certificates)
- [ ] NextAuth secret is randomly generated (32+ chars)
- [ ] API keys are not logged or exposed
- [ ] ACR uses managed identity for App Service pulls
