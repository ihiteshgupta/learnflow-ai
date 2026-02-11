# Azure Database for PostgreSQL Flexible Server

# ─── Private DNS Zone for PostgreSQL ────────────────────────────────────────

resource "azurerm_private_dns_zone" "postgres" {
  name                = "${local.prefix}.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${local.prefix}-pg-dns-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  resource_group_name   = azurerm_resource_group.main.name
  virtual_network_id    = azurerm_virtual_network.main.id

  depends_on = [azurerm_subnet_network_security_group_association.db]
}

# ─── PostgreSQL Flexible Server ─────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.prefix}-pg"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "16"
  administrator_login    = "dronacharyaadmin"
  administrator_password = var.db_admin_password

  delegated_subnet_id = azurerm_subnet.db.id
  private_dns_zone_id = azurerm_private_dns_zone.postgres.id

  storage_mb = var.db_storage_mb
  sku_name   = var.db_sku_name

  zone = "1"

  dynamic "high_availability" {
    for_each = var.db_ha_mode != "Disabled" ? [1] : []
    content {
      mode                      = var.db_ha_mode
      standby_availability_zone = "2"
    }
  }

  backup_retention_days        = var.environment == "production" ? 30 : 7
  geo_redundant_backup_enabled = var.environment == "production" ? true : false

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]

  tags = local.tags
}

# ─── PostgreSQL Database ────────────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "dronacharya"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# ─── PostgreSQL Configuration ───────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server_configuration" "ssl" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_connections" {
  name      = "log_connections"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_disconnections" {
  name      = "log_disconnections"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

resource "azurerm_postgresql_flexible_server_configuration" "connection_throttling" {
  name      = "connection_throttle.enable"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

# ─── Diagnostics ────────────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "postgres" {
  name                       = "${local.prefix}-pg-diag"
  target_resource_id         = azurerm_postgresql_flexible_server.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "PostgreSQLLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
