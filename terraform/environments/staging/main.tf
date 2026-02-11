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

module "azure_infrastructure" {
  source = "../../modules/azure"

  environment = "staging"
  location    = var.location

  # AKS - Smaller staging configuration
  aks_node_vm_size   = "Standard_D2s_v3"
  aks_node_count     = 2
  aks_min_node_count = 1
  aks_max_node_count = 4

  # Database - No HA for staging
  db_sku_name        = "B_Standard_B1ms"
  db_storage_mb      = 32768  # 32GB
  db_ha_mode         = "Disabled"
  db_admin_password  = var.db_admin_password

  # Redis - Basic
  redis_sku_name   = "Basic"
  redis_family     = "C"
  redis_capacity   = 0

  # ACR
  acr_sku = "Basic"

  tags = {
    Environment = "staging"
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
