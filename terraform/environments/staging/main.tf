# Dronacharya Staging Infrastructure
# Azure App Service + PostgreSQL + Redis (smaller SKUs, no custom domains)

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
    key                  = "staging.terraform.tfstate"
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
  prefix = "dronacharya-staging"
  tags = {
    Project     = "Dronacharya"
    Environment = "staging"
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
  sku_name            = "B2" # Basic tier — no custom domains needed for staging

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
    NODE_ENV                     = "staging"
    DATABASE_URL                 = "postgresql://dronacharyaadmin:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/dronacharya?sslmode=require"
    ANTHROPIC_API_KEY            = var.anthropic_api_key
    OPENAI_API_KEY               = var.openai_api_key
    NEXTAUTH_URL                 = "https://${azurerm_linux_web_app.main.default_hostname}"
    NEXTAUTH_SECRET              = var.nextauth_secret
    NEXT_PUBLIC_APP_URL          = "https://${azurerm_linux_web_app.main.default_hostname}"
    NEXT_PUBLIC_API_URL          = "https://${azurerm_linux_web_app.main.default_hostname}"
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

  storage_mb = 32768 # 32 GB
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

# ---------- Redis ----------

resource "azurerm_redis_cache" "main" {
  name                = "${local.prefix}-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = 0
  family              = "C"
  sku_name            = "Basic"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {}

  tags = local.tags
}

# ---------- Outputs ----------

output "app_url" {
  description = "App Service URL"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
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
