# Azure Cache for Redis

resource "azurerm_redis_cache" "main" {
  name                = "${local.prefix}-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = var.redis_capacity
  family              = var.redis_family
  sku_name            = var.redis_sku_name

  minimum_tls_version   = "1.2"
  enable_non_ssl_port   = false
  redis_version         = "6"
  public_network_access_enabled = false

  redis_configuration {
    maxmemory_policy = "allkeys-lru"
  }

  subnet_id = azurerm_subnet.redis.id

  tags = local.tags
}

# ─── Private Endpoint for Redis ─────────────────────────────────────────────

resource "azurerm_private_dns_zone" "redis" {
  name                = "privatelink.redis.cache.windows.net"
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "redis" {
  name                  = "${local.prefix}-redis-dns-link"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.redis.name
  virtual_network_id    = azurerm_virtual_network.main.id
}

# ─── Diagnostics ────────────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "redis" {
  name                       = "${local.prefix}-redis-diag"
  target_resource_id         = azurerm_redis_cache.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "ConnectedClientList"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
