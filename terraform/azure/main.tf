# Dronacharya Azure Infrastructure
# Production deployment using Azure App Service + PostgreSQL + Redis + Azure OpenAI + ChromaDB

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.50"
    }
  }

  backend "azurerm" {
    resource_group_name  = "dronacharya-tfstate"
    storage_account_name = "dronacharyatfstate"
    container_name       = "tfstate"
    key                  = "appservice.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# ---------------------------------------------------------------------------
# Variables
# ---------------------------------------------------------------------------

variable "location" {
  default = "East US"
}

variable "environment" {
  default = "production"
}

variable "domain_name" {
  description = "Primary domain name for the application"
  default     = "dronacharya.app"
}

variable "postgres_location" {
  description = "Location for PostgreSQL Flexible Server (may differ from main location due to quota restrictions)"
  default     = "North Europe"
}

variable "postgres_admin_password" {
  sensitive = true
}

variable "nextauth_secret" {
  sensitive = true
}

locals {
  prefix = "dronacharya-${var.environment}"
  tags = {
    Project     = "Dronacharya"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ---------------------------------------------------------------------------
# Resource Group
# ---------------------------------------------------------------------------

resource "azurerm_resource_group" "main" {
  name     = "${local.prefix}-rg"
  location = var.location
  tags     = local.tags
}

# ---------------------------------------------------------------------------
# Azure OpenAI
# ---------------------------------------------------------------------------

resource "azurerm_cognitive_account" "openai" {
  name                = "${local.prefix}-openai"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name            = "S0"
  tags                = local.tags
}

resource "azurerm_cognitive_deployment" "gpt4o" {
  name                 = "gpt-4o"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-4o"
    version = "2024-11-20"
  }

  scale {
    type     = "Standard"
    capacity = 10 # 10K tokens-per-minute
  }
}

resource "azurerm_cognitive_deployment" "embeddings" {
  name                 = "text-embedding-3-large"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "text-embedding-3-large"
    version = "1"
  }

  scale {
    type     = "Standard"
    capacity = 10
  }
}

# ---------------------------------------------------------------------------
# ChromaDB — Azure Container Instance with persistent storage
# ---------------------------------------------------------------------------

resource "azurerm_storage_account" "chromadb" {
  name                     = "dronacharyachromastr"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = local.tags
}

resource "azurerm_storage_share" "chromadb" {
  name                 = "chromadb-data"
  storage_account_name = azurerm_storage_account.chromadb.name
  quota                = 10 # 10 GB
}

resource "azurerm_container_group" "chromadb" {
  name                = "${local.prefix}-chromadb"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  ip_address_type     = "Public"
  dns_name_label      = "${local.prefix}-chromadb"
  os_type             = "Linux"

  container {
    name   = "chromadb"
    image  = "ghcr.io/chroma-core/chroma:latest"
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port     = 8000
      protocol = "TCP"
    }

    environment_variables = {
      CHROMA_SERVER_HOST = "0.0.0.0"
    }

    volume {
      name                 = "chromadb-data"
      mount_path           = "/chroma/chroma"
      storage_account_name = azurerm_storage_account.chromadb.name
      storage_account_key  = azurerm_storage_account.chromadb.primary_access_key
      share_name           = azurerm_storage_share.chromadb.name
    }
  }

  tags = local.tags
}

# ---------------------------------------------------------------------------
# App Service Plan
# ---------------------------------------------------------------------------

resource "azurerm_service_plan" "main" {
  name                = "${local.prefix}-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "S1" # Standard tier for custom domains + managed SSL

  tags = local.tags
}

# ---------------------------------------------------------------------------
# App Service
# ---------------------------------------------------------------------------

resource "azurerm_linux_web_app" "main" {
  name                = "${local.prefix}-app"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    WEBSITE_NODE_DEFAULT_VERSION       = "~20"
    NODE_ENV                           = "production"
    DATABASE_URL                       = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}:${var.postgres_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/dronacharya?sslmode=require"
    NEXTAUTH_URL                       = "https://www.${var.domain_name}"
    NEXTAUTH_SECRET                    = var.nextauth_secret
    NEXT_PUBLIC_APP_URL                = "https://www.${var.domain_name}"
    NEXT_PUBLIC_API_URL                = "https://api.${var.domain_name}"
    REDIS_URL                          = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}"
    AZURE_OPENAI_API_KEY               = azurerm_cognitive_account.openai.primary_access_key
    AZURE_OPENAI_ENDPOINT              = azurerm_cognitive_account.openai.endpoint
    AZURE_OPENAI_DEPLOYMENT_NAME       = azurerm_cognitive_deployment.gpt4o.name
    AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT = azurerm_cognitive_deployment.embeddings.name
    AZURE_OPENAI_API_VERSION           = "2024-12-01-preview"
    CHROMADB_URL                       = "http://${azurerm_container_group.chromadb.fqdn}:8000"
    AI_MODEL_PRIMARY                   = "gpt-4o"
    AI_MODEL_FALLBACK                  = "gpt-4o"
  }

  tags = local.tags
}

# ---------------------------------------------------------------------------
# PostgreSQL Flexible Server
# ---------------------------------------------------------------------------

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "drona-db-prod"
  resource_group_name    = azurerm_resource_group.main.name
  location               = var.postgres_location
  version                = "16"
  administrator_login    = "dronacharyaadmin"
  administrator_password = var.postgres_admin_password
  zone                   = "1"

  storage_mb = 32768       # 32 GB
  sku_name   = "B_Standard_B1ms"

  tags = local.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "dronacharya"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ---------------------------------------------------------------------------
# Azure Cache for Redis
# ---------------------------------------------------------------------------

resource "azurerm_redis_cache" "main" {
  name                = "${local.prefix}-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = 0
  family              = "C"
  sku_name            = "Basic" # Basic C0 tier to keep costs low
  non_ssl_port_enabled = false
  minimum_tls_version = "1.2"

  redis_configuration {}

  tags = local.tags
}

# ---------------------------------------------------------------------------
# DNS Zone & Records
# ---------------------------------------------------------------------------

resource "azurerm_dns_zone" "main" {
  name                = var.domain_name
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

resource "azurerm_dns_txt_record" "asuid" {
  name                = "asuid"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600
  record {
    value = azurerm_linux_web_app.main.custom_domain_verification_id
  }
}

resource "azurerm_dns_txt_record" "asuid_www" {
  name                = "asuid.www"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600
  record {
    value = azurerm_linux_web_app.main.custom_domain_verification_id
  }
}

resource "azurerm_dns_txt_record" "asuid_api" {
  name                = "asuid.api"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600
  record {
    value = azurerm_linux_web_app.main.custom_domain_verification_id
  }
}

# Apex A record requires the App Service outbound IP (see: az webapp show --query outboundIpAddresses)
# The alias-to-App-Service feature is not available on all subscription tiers.
# Primary domain is www.dronacharya.app via CNAME below.

resource "azurerm_dns_cname_record" "www" {
  name                = "www"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600
  record              = azurerm_linux_web_app.main.default_hostname
}

resource "azurerm_dns_cname_record" "api" {
  name                = "api"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600
  record              = azurerm_linux_web_app.main.default_hostname
}

# ---------------------------------------------------------------------------
# Custom Domain Bindings + Managed SSL Certificates
# ---------------------------------------------------------------------------

resource "azurerm_app_service_custom_hostname_binding" "www" {
  hostname            = "www.${var.domain_name}"
  app_service_name    = azurerm_linux_web_app.main.name
  resource_group_name = azurerm_resource_group.main.name
  depends_on = [
    azurerm_dns_cname_record.www,
    azurerm_dns_txt_record.asuid_www,
  ]
}

resource "azurerm_app_service_managed_certificate" "www" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.www.id
}

resource "azurerm_app_service_certificate_binding" "www" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.www.id
  certificate_id      = azurerm_app_service_managed_certificate.www.id
  ssl_state           = "SniEnabled"
}

resource "azurerm_app_service_custom_hostname_binding" "api" {
  hostname            = "api.${var.domain_name}"
  app_service_name    = azurerm_linux_web_app.main.name
  resource_group_name = azurerm_resource_group.main.name
  depends_on = [
    azurerm_dns_cname_record.api,
    azurerm_dns_txt_record.asuid_api,
  ]
}

resource "azurerm_app_service_managed_certificate" "api" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.api.id
}

resource "azurerm_app_service_certificate_binding" "api" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.api.id
  certificate_id      = azurerm_app_service_managed_certificate.api.id
  ssl_state           = "SniEnabled"
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

output "app_url" {
  description = "Primary application URL (custom domain)"
  value       = "https://www.${var.domain_name}"
}

output "app_default_hostname" {
  description = "Azure default hostname"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "postgres_host" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "redis_host" {
  description = "Redis cache hostname"
  value       = azurerm_redis_cache.main.hostname
}

output "openai_endpoint" {
  description = "Azure OpenAI endpoint (also set in App Service app_settings)"
  value       = azurerm_cognitive_account.openai.endpoint
}

output "openai_api_key" {
  description = "Azure OpenAI primary access key"
  value       = azurerm_cognitive_account.openai.primary_access_key
  sensitive   = true
}

output "chromadb_url" {
  description = "ChromaDB URL (also set in App Service app_settings)"
  value       = "http://${azurerm_container_group.chromadb.fqdn}:8000"
}

output "dns_nameservers" {
  description = "Nameservers to configure at your domain registrar"
  value       = azurerm_dns_zone.main.name_servers
}

output "resource_group" {
  value = azurerm_resource_group.main.name
}
