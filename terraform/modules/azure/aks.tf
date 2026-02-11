# Azure Kubernetes Service (AKS)

resource "azurerm_kubernetes_cluster" "main" {
  name                = "${local.prefix}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = local.prefix
  kubernetes_version  = "1.29"

  default_node_pool {
    name                = "default"
    vm_size             = var.aks_vm_size
    node_count          = var.aks_node_count
    min_count           = var.aks_min_count
    max_count           = var.aks_max_count
    enable_auto_scaling = true
    vnet_subnet_id      = azurerm_subnet.aks.id
    os_disk_size_gb     = 50

    node_labels = {
      environment = var.environment
      project     = "dronacharya"
    }

    tags = local.tags
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "azure"
    load_balancer_sku = "standard"
    service_cidr      = "10.1.0.0/16"
    dns_service_ip    = "10.1.0.10"
  }

  role_based_access_control_enabled = true

  azure_active_directory_role_based_access_control {
    managed                = true
    azure_rbac_enabled     = true
  }

  key_vault_secrets_provider {
    secret_rotation_enabled  = true
    secret_rotation_interval = "2m"
  }

  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  }

  tags = local.tags
}

# ─── AKS Diagnostics ────────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "aks" {
  name                       = "${local.prefix}-aks-diag"
  target_resource_id         = azurerm_kubernetes_cluster.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "kube-apiserver"
  }

  enabled_log {
    category = "kube-audit"
  }

  enabled_log {
    category = "kube-controller-manager"
  }

  enabled_log {
    category = "kube-scheduler"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
