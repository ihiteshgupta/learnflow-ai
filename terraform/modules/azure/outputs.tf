# ─── Resource Group ──────────────────────────────────────────────────────────

output "resource_group_name" {
  description = "Name of the Azure resource group"
  value       = azurerm_resource_group.main.name
}

# ─── AKS ─────────────────────────────────────────────────────────────────────

output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.name
}

output "aks_host" {
  description = "AKS cluster API server host"
  value       = azurerm_kubernetes_cluster.main.kube_config[0].host
  sensitive   = true
}

output "aks_client_certificate" {
  description = "Base64-encoded client certificate for AKS authentication"
  value       = azurerm_kubernetes_cluster.main.kube_config[0].client_certificate
  sensitive   = true
}

output "aks_client_key" {
  description = "Base64-encoded client key for AKS authentication"
  value       = azurerm_kubernetes_cluster.main.kube_config[0].client_key
  sensitive   = true
}

output "aks_cluster_ca_certificate" {
  description = "Base64-encoded cluster CA certificate for AKS"
  value       = azurerm_kubernetes_cluster.main.kube_config[0].cluster_ca_certificate
  sensitive   = true
}

output "aks_kube_config_raw" {
  description = "Raw kubeconfig for the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive   = true
}

# ─── Database ────────────────────────────────────────────────────────────────

output "database_host" {
  description = "PostgreSQL Flexible Server FQDN"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_url" {
  description = "Full PostgreSQL connection string"
  value       = "postgresql://dronacharyaadmin:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/dronacharya?sslmode=require"
  sensitive   = true
}

# ─── Redis ───────────────────────────────────────────────────────────────────

output "redis_hostname" {
  description = "Redis cache hostname"
  value       = azurerm_redis_cache.main.hostname
}

output "redis_primary_key" {
  description = "Redis primary access key"
  value       = azurerm_redis_cache.main.primary_access_key
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string (TLS)"
  value       = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}"
  sensitive   = true
}

# ─── ACR ─────────────────────────────────────────────────────────────────────

output "acr_login_server" {
  description = "ACR login server URL"
  value       = azurerm_container_registry.main.login_server
}

output "acr_admin_username" {
  description = "ACR admin username"
  value       = azurerm_container_registry.main.admin_username
}

output "acr_admin_password" {
  description = "ACR admin password"
  value       = azurerm_container_registry.main.admin_password
  sensitive   = true
}

# ─── Key Vault ───────────────────────────────────────────────────────────────

output "keyvault_uri" {
  description = "Azure Key Vault URI"
  value       = azurerm_key_vault.main.vault_uri
}

output "keyvault_id" {
  description = "Azure Key Vault resource ID"
  value       = azurerm_key_vault.main.id
}

# ─── DNS ─────────────────────────────────────────────────────────────────────

output "dns_nameservers" {
  description = "DNS zone nameservers (delegate your domain to these)"
  value       = azurerm_dns_zone.main.name_servers
}

output "ingress_public_ip" {
  description = "Public IP address for the AKS ingress controller"
  value       = azurerm_public_ip.ingress.ip_address
}

# ─── Networking ──────────────────────────────────────────────────────────────

output "vnet_id" {
  description = "Virtual Network ID"
  value       = azurerm_virtual_network.main.id
}

output "aks_subnet_id" {
  description = "AKS subnet ID"
  value       = azurerm_subnet.aks.id
}

output "db_subnet_id" {
  description = "Database subnet ID"
  value       = azurerm_subnet.db.id
}
