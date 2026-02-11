# Dronacharya Production Infrastructure
# Azure App Service + PostgreSQL + Redis + Custom Domains

terraform {
  required_version = ">= 1.5.0"

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
    key                  = "production.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}

# Variables
variable "location" {
  default = "East US"
}

variable "db_admin_password" {
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
  sensitive = true
}

variable "qdrant_api_key" {
  sensitive = true
}

locals {
  prefix = "dronacharya-production"
  tags = {
    Project     = "Dronacharya"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${local.prefix}-rg"
  location = var.location
  tags     = local.tags
}

# ---------- App Service ----------

resource "azurerm_service_plan" "main" {
  name                = "${local.prefix}-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "S1" # Standard tier — required for custom domains

  tags = local.tags
}

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
    DATABASE_URL                 = "postgresql://dronacharyaadmin:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/dronacharya?sslmode=require"
    ANTHROPIC_API_KEY            = var.anthropic_api_key
    OPENAI_API_KEY               = var.openai_api_key
    NEXTAUTH_URL                 = "https://www.dronacharya.app"
    NEXTAUTH_SECRET              = var.nextauth_secret
    NEXT_PUBLIC_APP_URL          = "https://www.dronacharya.app"
    NEXT_PUBLIC_API_URL          = "https://api.dronacharya.app"
    REDIS_URL                    = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}"
    QDRANT_URL                   = var.qdrant_url
    QDRANT_API_KEY               = var.qdrant_api_key
  }

  tags = local.tags
}

# ---------- PostgreSQL ----------

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.prefix}-postgres"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "16"
  administrator_login    = "dronacharyaadmin"
  administrator_password = var.db_admin_password
  zone                   = "1"

  storage_mb = 131072 # 128 GB
  sku_name   = "GP_Standard_D2s_v3"

  high_availability {
    mode = "ZoneRedundant"
  }

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

# ---------- Redis ----------

resource "azurerm_redis_cache" "main" {
  name                = "${local.prefix}-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = 1
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {}

  tags = local.tags
}

# ---------- DNS ----------

resource "azurerm_dns_zone" "main" {
  name                = "dronacharya.app"
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

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

# ---------- Custom Domains & SSL ----------

resource "azurerm_app_service_custom_hostname_binding" "www" {
  hostname            = "www.dronacharya.app"
  app_service_name    = azurerm_linux_web_app.main.name
  resource_group_name = azurerm_resource_group.main.name

  depends_on = [azurerm_dns_cname_record.www]
}

resource "azurerm_app_service_custom_hostname_binding" "api" {
  hostname            = "api.dronacharya.app"
  app_service_name    = azurerm_linux_web_app.main.name
  resource_group_name = azurerm_resource_group.main.name

  depends_on = [azurerm_dns_cname_record.api]
}

resource "azurerm_app_service_managed_certificate" "www" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.www.id
}

resource "azurerm_app_service_managed_certificate" "api" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.api.id
}

resource "azurerm_app_service_certificate_binding" "www" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.www.id
  certificate_id      = azurerm_app_service_managed_certificate.www.id
  ssl_state           = "SniEnabled"
}

resource "azurerm_app_service_certificate_binding" "api" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.api.id
  certificate_id      = azurerm_app_service_managed_certificate.api.id
  ssl_state           = "SniEnabled"
}

# ---------- Outputs ----------

output "app_url" {
  description = "App Service URL"
  value       = "https://www.dronacharya.app"
}

output "postgres_host" {
  description = "PostgreSQL Flexible Server hostname"
  value       = azurerm_postgresql_flexible_server.main.fqdn
  sensitive   = true
}

output "redis_host" {
  description = "Azure Cache for Redis hostname"
  value       = azurerm_redis_cache.main.hostname
  sensitive   = true
}

output "dns_nameservers" {
  description = "DNS zone nameservers — configure these at your domain registrar"
  value       = azurerm_dns_zone.main.name_servers
}
