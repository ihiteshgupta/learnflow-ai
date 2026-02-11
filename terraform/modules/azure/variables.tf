# ─── General ─────────────────────────────────────────────────────────────────

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be 'staging' or 'production'."
  }
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "eastus"
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# ─── AKS ─────────────────────────────────────────────────────────────────────

variable "aks_node_count" {
  description = "Initial number of AKS worker nodes"
  type        = number
  default     = 2
}

variable "aks_min_count" {
  description = "Minimum number of AKS worker nodes (auto-scaling)"
  type        = number
  default     = 1
}

variable "aks_max_count" {
  description = "Maximum number of AKS worker nodes (auto-scaling)"
  type        = number
  default     = 5
}

variable "aks_vm_size" {
  description = "VM size for AKS default node pool"
  type        = string
  default     = "Standard_D2s_v3"
}

# ─── Database ────────────────────────────────────────────────────────────────

variable "db_sku_name" {
  description = "PostgreSQL Flexible Server SKU (e.g., B_Standard_B1ms, GP_Standard_D2s_v3)"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "db_storage_mb" {
  description = "PostgreSQL storage in MB (32768 = 32GB, 131072 = 128GB)"
  type        = number
  default     = 32768
}

variable "db_ha_mode" {
  description = "High availability mode: Disabled, SameZone, or ZoneRedundant"
  type        = string
  default     = "Disabled"

  validation {
    condition     = contains(["Disabled", "SameZone", "ZoneRedundant"], var.db_ha_mode)
    error_message = "db_ha_mode must be 'Disabled', 'SameZone', or 'ZoneRedundant'."
  }
}

variable "db_admin_password" {
  description = "Administrator password for PostgreSQL Flexible Server"
  type        = string
  sensitive   = true
}

# ─── Redis ───────────────────────────────────────────────────────────────────

variable "redis_sku_name" {
  description = "Redis SKU: Basic, Standard, or Premium"
  type        = string
  default     = "Basic"
}

variable "redis_capacity" {
  description = "Redis cache capacity (0-6 for Basic/Standard, 1-5 for Premium)"
  type        = number
  default     = 0
}

variable "redis_family" {
  description = "Redis family: C (Basic/Standard) or P (Premium)"
  type        = string
  default     = "C"
}

# ─── ACR ─────────────────────────────────────────────────────────────────────

variable "acr_sku" {
  description = "Azure Container Registry SKU: Basic, Standard, or Premium"
  type        = string
  default     = "Basic"
}
