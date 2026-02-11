variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "db_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}
