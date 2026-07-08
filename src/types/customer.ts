export type LinenCategory = 'linen' | 'towel' | 'uniform'

export interface CustomerAddress {
  siteLabel: string
  fullAddress: string
}

export interface CustomerProfile {
  id: string
  companyLogo: string
  companyName: string
  taxId: string
  contactPerson: string
  phone: string
  email: string
  addresses: CustomerAddress[]
  createdAt: string
  updatedAt: string
}

export interface SLA {
  tatHours: number
  qualityStandards: string
  serviceScope: LinenCategory[]
  penaltyClauses: string
}

export interface PerItemPricing {
  type: 'per_item'
  rates: Record<LinenCategory, number>
}

export interface WeightBasedPricing {
  type: 'weight_based'
  ratePerKg: number
}

export type PricingRule = PerItemPricing | WeightBasedPricing

export interface PricingTemplate {
  id: string
  name: string
  description: string
  rules: PricingRule[]
  createdAt: string
  updatedAt: string
}

export interface Contract {
  id: string
  customerId: string
  pricingTemplateId: string
  contractName: string
  startDate: string
  endDate: string
  sla: SLA
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  category: LinenCategory
  quantity: number
  weightKg?: number
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Order {
  id: string
  customerId: string
  contractId: string
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface InvoiceLineItem {
  category: LinenCategory
  quantity: number
  rate: number
  amount: number
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  orderId: string
  customerId: string
  contractId: string
  lineItems: InvoiceLineItem[]
  totalAmount: number
  status: InvoiceStatus
  dueDate: string
  createdAt: string
  updatedAt: string
}
