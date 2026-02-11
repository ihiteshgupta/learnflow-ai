# Azure Key Vault

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                        = "${local.prefix}-kv"
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  soft_delete_retention_days  = 90
  purge_protection_enabled    = var.environment == "production" ? true : false
  enabled_for_disk_encryption = true

  tags = local.tags
}

# ─── Access Policy: Current Terraform User ───────────────────────────────────

resource "azurerm_key_vault_access_policy" "terraform" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete",
    "Purge",
    "Recover",
  ]

  key_permissions = [
    "Get",
    "List",
    "Create",
  ]
}

# ─── Access Policy: AKS Managed Identity ────────────────────────────────────

resource "azurerm_key_vault_access_policy" "aks" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_kubernetes_cluster.main.key_vault_secrets_provider[0].secret_identity[0].object_id

  secret_permissions = [
    "Get",
    "List",
  ]
}

# ─── Secrets ─────────────────────────────────────────────────────────────────

resource "azurerm_key_vault_secret" "database_url" {
  name         = "database-url"
  value        = "postgresql://dronacharyaadmin:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/dronacharya?sslmode=require"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.terraform]

  tags = local.tags
}

resource "azurerm_key_vault_secret" "redis_url" {
  name         = "redis-url"
  value        = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.terraform]

  tags = local.tags
}

resource "azurerm_key_vault_secret" "anthropic_api_key" {
  name         = "anthropic-api-key"
  value        = "PLACEHOLDER-UPDATE-MANUALLY"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.terraform]

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.tags
}

resource "azurerm_key_vault_secret" "nextauth_secret" {
  name         = "nextauth-secret"
  value        = "PLACEHOLDER-UPDATE-MANUALLY"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.terraform]

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.tags
}

resource "azurerm_key_vault_secret" "qdrant_url" {
  name         = "qdrant-url"
  value        = "PLACEHOLDER-UPDATE-MANUALLY"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.terraform]

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.tags
}

resource "azurerm_key_vault_secret" "qdrant_api_key" {
  name         = "qdrant-api-key"
  value        = "PLACEHOLDER-UPDATE-MANUALLY"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.terraform]

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.tags
}
