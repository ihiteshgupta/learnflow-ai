# Dronacharya Azure Infrastructure
# Production deployment using Azure App Service + PostgreSQL + Redis + Custom Domains

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
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

# Variables
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

variable "postgres_admin_password" {
  sensitive = true
}

variable "anthropic_api_key" {
  sensitive = true
}

variable "openai_api_key" {
  sensitive = true
}

variable "nextauth_secret" {
  sensitive = true
}

variable "qdrant_url" {
  description = "Qdrant vector database URL"
  type        = string
}

variable "qdrant_api_key" {
  description = "Qdrant vector database API key"
  sensitive   = true
}

locals {
  prefix = "dronacharya-${var.environment}"
  tags = {
    Project     = "Dronacharya"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${local.prefix}-rg"
  location = var.location
  tags     = local.tags
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${local.prefix}-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "S1" # Standard tier for custom domains + managed SSL

  tags = local.tags
}

# App Service
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
    WEBSITE_NODE_DEFAULT_VERSION = "~20"
    NODE_ENV                     = "production"
    DATABASE_URL                 = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}:${var.postgres_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/dronacharya?sslmode=require"
    ANTHROPIC_API_KEY            = var.anthropic_api_key
    OPENAI_API_KEY               = var.openai_api_key
    NEXTAUTH_URL                 = "https://www.${var.domain_name}"
    NEXTAUTH_SECRET              = var.nextauth_secret
    NEXT_PUBLIC_APP_URL          = "https://www.${var.domain_name}"
    NEXT_PUBLIC_API_URL          = "https://api.${var.domain_name}"
    REDIS_URL                    = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}"
    QDRANT_URL                   = var.qdrant_url
    QDRANT_API_KEY               = var.qdrant_api_key
  }

  tags = local.tags
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.prefix}-postgres"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "16"
  administrator_login    = "dronacharyaadmin"
  administrator_password = var.postgres_admin_password
  zone                   = "1"

  storage_mb = 32768         # 32 GB
  sku_name   = "B_Standard_B1ms"

  tags = local.tags
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "dronacharya"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Firewall rule to allow Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Azure Cache for Redis
resource "azurerm_redis_cache" "main" {
  name                = "${local.prefix}-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = 0
  family              = "C"
  sku_name            = "Basic" # Basic C0 tier to keep costs low
  enable_non_ssl_port = false
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

# TXT record for custom domain verification (apex)
resource "azurerm_dns_txt_record" "asuid" {
  name                = "asuid"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600

  record {
    value = azurerm_linux_web_app.main.custom_domain_verification_id
  }
}

# TXT record for custom domain verification (www)
resource "azurerm_dns_txt_record" "asuid_www" {
  name                = "asuid.www"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600

  record {
    value = azurerm_linux_web_app.main.custom_domain_verification_id
  }
}

# TXT record for custom domain verification (api)
resource "azurerm_dns_txt_record" "asuid_api" {
  name                = "asuid.api"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600

  record {
    value = azurerm_linux_web_app.main.custom_domain_verification_id
  }
}

# A record for apex domain -> App Service IP
resource "azurerm_dns_a_record" "apex" {
  name                = "@"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600
  target_resource_id  = azurerm_linux_web_app.main.id
}

# CNAME record for www subdomain -> App Service hostname
resource "azurerm_dns_cname_record" "www" {
  name                = "www"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 3600
  record              = azurerm_linux_web_app.main.default_hostname
}

# CNAME record for api subdomain -> App Service hostname
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
# Order: hostname binding -> managed certificate -> certificate binding

# --- www.dronacharya.app ---

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

# --- api.dronacharya.app ---

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

output "dns_nameservers" {
  description = "Nameservers to configure at your domain registrar"
  value       = azurerm_dns_zone.main.name_servers
}

output "resource_group" {
  value = azurerm_resource_group.main.name
}
