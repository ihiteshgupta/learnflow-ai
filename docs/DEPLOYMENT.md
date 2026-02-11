# Dronacharya Production Deployment Guide

This guide covers deploying Dronacharya to Azure AKS with PostgreSQL Flexible Server, Redis, and ACR.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                            │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────────────┐  │
│  │  Test   │───▶│  Build  │───▶│  Push to ACR + Deploy   │  │
│  └─────────┘    └─────────┘    └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Azure                                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Azure DNS (dronacharya.app)                         │    │
│  │  www.dronacharya.app → AKS Ingress                  │    │
│  │  api.dronacharya.app → AKS Ingress                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Azure Kubernetes Service (AKS)                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                 │    │
│  │  │  web (Next.js)│  │  ai (worker) │                 │    │
│  │  │  2 replicas   │  │  2 replicas  │                 │    │
│  │  └──────────────┘  └──────────────┘                 │    │
│  │  Ingress (nginx) + cert-manager (Let's Encrypt)      │    │
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

- Azure CLI installed and configured
- Terraform installed (v1.0+)
- kubectl installed
- GitHub repository access with admin permissions
- Domain: `dronacharya.app` with access to NS records

## Setup Steps

### 1. Azure Login and Subscription Setup

```bash
# Login to Azure
az login

# Set the active subscription
az account set --subscription <SUBSCRIPTION_ID>

# Verify
az account show
```

### 2. Create Terraform State Storage

```bash
# Create resource group for Terraform state
az group create --name dronacharya-tfstate --location eastus

# Create storage account (name must be globally unique)
az storage account create \
  --name dronacharyatfstate \
  --resource-group dronacharya-tfstate \
  --sku Standard_LRS \
  --encryption-services blob

# Create container for state file
az storage container create \
  --name tfstate \
  --account-name dronacharyatfstate
```

### 3. Generate Azure Credentials for GitHub Actions

```bash
# Create service principal with contributor role
az ad sp create-for-rbac \
  --name "dronacharya-github-actions" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth

# Copy the JSON output - this goes in GitHub Secrets as AZURE_CREDENTIALS
```

### 4. Configure GitHub Secrets

Navigate to: `Repository > Settings > Secrets and variables > Actions`

Add these secrets:

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | JSON output from service principal creation |
| `AZURE_CLIENT_ID` | Service principal client ID |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `ACR_LOGIN_SERVER` | `dronacharyaacr.azurecr.io` |
| `NEXT_PUBLIC_APP_URL` | `https://www.dronacharya.app` |
| `NEXTAUTH_SECRET` | Random 32+ char secret |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |

### 5. Configure Terraform Variables

Create a `terraform.tfvars` file (never commit this):

```hcl
postgres_admin_password = "your-secure-password-here"
anthropic_api_key       = "sk-ant-..."
openai_api_key          = "sk-..."
nextauth_secret         = "your-nextauth-secret"
domain_name             = "dronacharya.app"
```

Or use environment variables:

```bash
export TF_VAR_postgres_admin_password="your-secure-password"
export TF_VAR_anthropic_api_key="sk-ant-..."
export TF_VAR_openai_api_key="sk-..."
export TF_VAR_nextauth_secret="$(openssl rand -base64 32)"
export TF_VAR_domain_name="dronacharya.app"
```

### 6. Deploy Infrastructure with Terraform

```bash
cd terraform/environments/production

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure (creates AKS, PostgreSQL, Redis, ACR, DNS zone)
terraform apply

# Note the outputs
terraform output
```

### 7. Connect to AKS Cluster

```bash
# Get AKS credentials
az aks get-credentials \
  --resource-group dronacharya-production-rg \
  --name dronacharya-production-aks

# Verify connection
kubectl get nodes
kubectl get namespaces
```

### 8. Login to ACR and Push Image

```bash
# Login to Azure Container Registry
az acr login --name dronacharyaacr

# Build and push image
docker build -t dronacharyaacr.azurecr.io/dronacharya:latest .
docker push dronacharyaacr.azurecr.io/dronacharya:latest
```

### 9. Deploy to Kubernetes with Kustomize

```bash
# Deploy to production
kubectl apply -k k8s/overlays/production/

# Verify deployment
kubectl get pods -n dronacharya
kubectl get svc -n dronacharya
kubectl get ingress -n dronacharya
```

### 10. Set Up Qdrant Vector Database

**Option A: Qdrant Cloud (Recommended for Production)**

1. Sign up at https://cloud.qdrant.io
2. Create a new cluster (free tier available)
3. Note the cluster URL and API key
4. Add to Kubernetes secrets:

```bash
kubectl create secret generic dronacharya-qdrant \
  --from-literal=qdrant-url='https://xxx-yyy-zzz.qdrant.io:6333' \
  --from-literal=qdrant-api-key='your-qdrant-api-key' \
  --namespace=dronacharya
```

**Option B: Self-Hosted Qdrant (Local/Development)**

For local development, Qdrant is included in `docker-compose.yml`:

```bash
docker-compose up -d
export QDRANT_URL="http://localhost:6333"
```

### 11. DNS Setup

Point `dronacharya.app` NS records to Azure DNS:

```bash
# Get the Azure DNS zone nameservers
az network dns zone show \
  --resource-group dronacharya-production-rg \
  --name dronacharya.app \
  --query nameServers -o tsv

# Update your domain registrar's NS records to point to these nameservers:
# ns1-XX.azure-dns.com
# ns2-XX.azure-dns.net
# ns3-XX.azure-dns.org
# ns4-XX.azure-dns.info
```

Verify DNS propagation:

```bash
dig dronacharya.app NS
dig www.dronacharya.app A
dig api.dronacharya.app A
```

### 12. Run Database Migrations

```bash
# Set DATABASE_URL from Terraform output
export DATABASE_URL="postgresql://dronacharyaadmin:<password>@dronacharya-production-postgres.postgres.database.azure.com:5432/dronacharya?sslmode=require"

# Run migrations
pnpm db:push

# Seed initial content
pnpm db:seed
```

### 13. Trigger CI/CD Deployment

Push to the `main` branch to trigger the GitHub Actions workflow:

```bash
git push origin main
```

## Environment Variables Reference

### Kubernetes ConfigMap / Secrets

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (set by Terraform) |
| `REDIS_URL` | Redis connection string (for rate limiting/caching) |
| `NEXTAUTH_URL` | `https://www.dronacharya.app` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth sessions |
| `NEXT_PUBLIC_APP_URL` | `https://www.dronacharya.app` |
| `NEXT_PUBLIC_API_URL` | `https://api.dronacharya.app` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `QDRANT_URL` | Qdrant vector database URL |
| `QDRANT_API_KEY` | Qdrant API key |

## Monitoring

### View Logs

```bash
# Stream pod logs
kubectl logs -f deployment/dronacharya-web -n dronacharya

# Stream AI worker logs
kubectl logs -f deployment/dronacharya-ai -n dronacharya

# View all pod events
kubectl get events -n dronacharya --sort-by=.metadata.creationTimestamp
```

### Check App Status

```bash
# View pod status
kubectl get pods -n dronacharya -o wide

# View HPA status
kubectl get hpa -n dronacharya

# Check ingress
kubectl get ingress -n dronacharya

# Health check
curl https://www.dronacharya.app/api/health
```

### AKS Cluster Monitoring

```bash
# View node resource usage
kubectl top nodes

# View pod resource usage
kubectl top pods -n dronacharya

# View AKS cluster status
az aks show \
  --resource-group dronacharya-production-rg \
  --name dronacharya-production-aks \
  --query provisioningState
```

## Troubleshooting

### Common Issues

**1. Pods in CrashLoopBackOff**

```bash
# Check pod logs
kubectl logs <pod-name> -n dronacharya --previous

# Describe pod for events
kubectl describe pod <pod-name> -n dronacharya
```

**2. Database Connection Fails**

```bash
# Verify firewall allows AKS VNet
az postgres flexible-server firewall-rule list \
  --resource-group dronacharya-production-rg \
  --name dronacharya-production-postgres

# Test connection from a pod
kubectl run psql-test --rm -it --image=postgres:17-alpine \
  -n dronacharya -- psql "$DATABASE_URL"
```

**3. Ingress Not Routing Traffic**

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress rules
kubectl describe ingress dronacharya-ingress -n dronacharya

# Check cert-manager certificates
kubectl get certificates -n dronacharya
```

**4. Image Pull Errors**

```bash
# Verify ACR access from AKS
az aks check-acr \
  --resource-group dronacharya-production-rg \
  --name dronacharya-production-aks \
  --acr dronacharyaacr.azurecr.io
```

### Useful Commands

```bash
# Restart deployments
kubectl rollout restart deployment/dronacharya-web -n dronacharya
kubectl rollout restart deployment/dronacharya-ai -n dronacharya

# Scale deployments
kubectl scale deployment/dronacharya-web --replicas=3 -n dronacharya

# View rollout status
kubectl rollout status deployment/dronacharya-web -n dronacharya

# Port forward for local debugging
kubectl port-forward svc/dronacharya-web 3000:3000 -n dronacharya
```

## Cost Estimate (Production)

| Resource | SKU | Est. Monthly Cost |
|----------|-----|-------------------|
| AKS (2 nodes) | Standard_D2s_v3 | ~$140 |
| PostgreSQL Flexible Server | B_Standard_B1ms | ~$25 |
| Redis Cache | Basic C0 | ~$16 |
| Azure Container Registry | Basic | ~$5 |
| Azure DNS Zone | Standard | ~$1 |
| Storage (Terraform State) | Standard LRS | ~$1 |
| **Total** | | **~$188/month** |

## Security Checklist

- [ ] All secrets stored in Azure Key Vault or Kubernetes secrets
- [ ] PostgreSQL firewall restricts access to AKS VNet only
- [ ] HTTPS enforced via ingress with cert-manager
- [ ] NextAuth secret is randomly generated (32+ chars)
- [ ] API keys are not logged or exposed
- [ ] Network policies restrict pod-to-pod traffic
- [ ] RBAC enabled on AKS cluster
- [ ] ACR has admin access disabled (use managed identity)

## Next Steps

1. Configure Azure Application Insights for monitoring
2. Set up Grafana dashboards for AKS metrics
3. Configure alerting for errors, latency, and resource usage
4. Implement automated database backup strategy
5. Set up staging environment (`staging.dronacharya.app`)
