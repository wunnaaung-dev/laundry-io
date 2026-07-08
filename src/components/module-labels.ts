import type { ResourceModule } from '../types/auth.ts'

export const MODULE_LABELS: Record<ResourceModule, string> = {
  customer_profile: 'Customer / Company Profile',
  contract_sla: 'Contract & SLA',
  pricing: 'Pricing',
  order_management: 'Order Management',
  linen_tracking: 'Linen Lifecycle Tracking',
  workflow_sop: 'Workflow & SOP Engine',
  warehouse: 'Warehouse Management',
  asset_management: 'Asset Management',
  purchasing: 'Purchasing',
  dispatch_delivery: 'Dispatch & Delivery',
  ai_analytics: 'AI Analytics & Recommendations',
  notification: 'Notification',
  billing_cashflow: 'Billing & Cash Flow',
  access_control: 'Access Control (Roles)',
  reports: 'Reporting / Usage Dashboard',
}

export const MODULE_CATEGORIES: { label: string; modules: ResourceModule[] }[] = [
  {
    label: 'Core Business',
    modules: [
      'customer_profile',
      'contract_sla',
      'pricing',
      'order_management',
      'billing_cashflow',
    ],
  },
  {
    label: 'Operations',
    modules: [
      'linen_tracking',
      'workflow_sop',
      'warehouse',
      'asset_management',
      'purchasing',
      'dispatch_delivery',
    ],
  },
  {
    label: 'Intelligence & Notifications',
    modules: ['ai_analytics', 'notification'],
  },
  {
    label: 'Access & Reporting',
    modules: ['access_control', 'reports'],
  },
]
