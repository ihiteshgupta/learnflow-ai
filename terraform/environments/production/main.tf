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

module "azure_infrastructure" {
  source = "../../modules/azure"

  environment = "production"
  location    = var.location

  # AKS - Production-grade configuration
  aks_node_vm_size   = "Standard_D4s_v3"
  aks_node_count     = 3
  aks_min_node_count = 3
  aks_max_node_count = 10

  # Database - Zone redundant HA
  db_sku_name        = "GP_Standard_D2s_v3"
  db_storage_mb      = 131072  # 128GB
  db_ha_mode         = "ZoneRedundant"
  db_admin_password  = var.db_admin_password

  # Redis - Standard
  redis_sku_name   = "Standard"
  redis_family     = "C"
  redis_capacity   = 1

  # ACR
  acr_sku = "Standard"

  tags = {
    Environment = "production"
    Project     = "dronacharya"
    ManagedBy   = "terraform"
  }
}

# Outputs
output "aks_cluster_endpoint" {
  description = "AKS cluster endpoint"
  value       = module.azure_infrastructure.aks_cluster_endpoint
}

output "aks_cluster_name" {
  description = "AKS cluster name"
  value       = module.azure_infrastructure.aks_cluster_name
}

output "db_endpoint" {
  description = "PostgreSQL Flexible Server endpoint"
  value       = module.azure_infrastructure.db_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Azure Cache for Redis endpoint"
  value       = module.azure_infrastructure.redis_endpoint
  sensitive   = true
}

output "acr_login_server" {
  description = "ACR login server"
  value       = module.azure_infrastructure.acr_login_server
}
