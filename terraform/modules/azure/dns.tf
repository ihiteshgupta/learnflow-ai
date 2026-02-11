# Azure DNS Zone
# Manages DNS records for dronacharya.app

resource "azurerm_dns_zone" "main" {
  name                = "dronacharya.app"
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

# ─── A Records ───────────────────────────────────────────────────────────────

# Apex domain (dronacharya.app) → AKS ingress public IP
resource "azurerm_dns_a_record" "apex" {
  name                = "@"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  target_resource_id  = azurerm_public_ip.ingress.id

  tags = local.tags
}

# www.dronacharya.app → AKS ingress public IP
resource "azurerm_dns_a_record" "www" {
  name                = "www"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  target_resource_id  = azurerm_public_ip.ingress.id

  tags = local.tags
}

# api.dronacharya.app → AKS ingress public IP
resource "azurerm_dns_a_record" "api" {
  name                = "api"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  target_resource_id  = azurerm_public_ip.ingress.id

  tags = local.tags
}

# ─── Public IP for Ingress ───────────────────────────────────────────────────
# Static IP used by AKS ingress controller (NGINX or Azure Application Gateway)

resource "azurerm_public_ip" "ingress" {
  name                = "${local.prefix}-ingress-pip"
  resource_group_name = azurerm_kubernetes_cluster.main.node_resource_group
  location            = azurerm_resource_group.main.location
  allocation_method   = "Static"
  sku                 = "Standard"

  domain_name_label = local.prefix

  tags = local.tags
}
