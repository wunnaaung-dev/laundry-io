import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_HOTEL_EMAIL, DEFAULT_HOTEL_NAME } from '../constants/index.ts'
import type {
  CustomerProfile,
  PricingTemplate,
  Contract,
  CustomerAddress,
  SLA,
  PricingRule,
} from '../types/customer.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface CustomerState {
  customers: CustomerProfile[]
  pricingTemplates: PricingTemplate[]
  contracts: Contract[]

  createCustomer: (data: {
    companyLogo: string
    companyName: string
    taxId: string
    contactPerson: string
    phone: string
    email: string
    addresses: CustomerAddress[]
  }) => void
  updateCustomer: (
    id: string,
    data: {
      companyLogo: string
      companyName: string
      taxId: string
      contactPerson: string
      phone: string
      email: string
      addresses: CustomerAddress[]
    },
  ) => void
  softDeleteCustomer: (id: string) => void

  createPricingTemplate: (data: {
    name: string
    description: string
    rules: PricingRule[]
  }) => void
  updatePricingTemplate: (
    id: string,
    data: {
      name: string
      description: string
      rules: PricingRule[]
    },
  ) => void
  deletePricingTemplate: (id: string) => void

  createContract: (data: {
    customerId: string
    pricingTemplateId: string
    contractName: string
    startDate: string
    endDate: string
    sla: SLA
  }) => void
  updateContract: (
    id: string,
    data: {
      pricingTemplateId: string
      contractName: string
      startDate: string
      endDate: string
      sla: SLA
    },
  ) => void
  deleteContract: (id: string) => void
}

const DEFAULT_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'sample-hotel-customer',
    companyLogo: '',
    companyName: 'Grand Horizon Hotel',
    taxId: 'TX-12345-6789',
    contactPerson: DEFAULT_HOTEL_NAME,
    phone: '+1-555-0100',
    email: DEFAULT_HOTEL_EMAIL,
    addresses: [
      { siteLabel: 'Main Building', fullAddress: '123 Bay Street, San Francisco, CA 94102' },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
]

const DEFAULT_TEMPLATES: PricingTemplate[] = [
  {
    id: 'per-item-linen-template',
    name: 'Per-Item Linen Rate',
    description: 'Standard per-piece pricing for all linen categories',
    rules: [
      {
        type: 'per_item',
        rates: { linen: 2.5, towel: 1.5, uniform: 3.0 },
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'weight-based-template',
    name: 'Weight-Based Rate',
    description: 'Flat rate per kilogram for bulk laundry',
    rules: [
      {
        type: 'weight_based',
        ratePerKg: 4.0,
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
]

const DEFAULT_CONTRACTS: Contract[] = [
  {
    id: 'sample-contract-1',
    customerId: 'sample-hotel-customer',
    pricingTemplateId: 'per-item-linen-template',
    contractName: 'Standard Laundry Agreement 2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    sla: {
      tatHours: 24,
      qualityStandards: 'ISO 9001 compliance. No stains, no tears, no color fade.',
      serviceScope: ['linen', 'towel'],
      penaltyClauses:
        'Late delivery: 5% deduction per hour. Lost item: 3x item value.',
    },
    createdAt: now(),
    updatedAt: now(),
  },
]

function appendSeed(
  state: CustomerState,
): CustomerState {
  if (state.customers.length === 0) {
    state.customers = DEFAULT_CUSTOMERS
  }
  if (state.pricingTemplates.length === 0) {
    state.pricingTemplates = DEFAULT_TEMPLATES
  }
  if (state.contracts.length === 0) {
    state.contracts = DEFAULT_CONTRACTS
  }
  return state
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers: [],
      pricingTemplates: [],
      contracts: [],

      createCustomer: (data) =>
        set((state) => {
          const customer: CustomerProfile = {
            id: makeId(),
            companyLogo: data.companyLogo,
            companyName: data.companyName,
            taxId: data.taxId,
            contactPerson: data.contactPerson,
            phone: data.phone,
            email: data.email,
            addresses: data.addresses,
            createdAt: now(),
            updatedAt: now(),
          }
          return { customers: [...state.customers, customer] }
        }),

      updateCustomer: (id, data) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  companyLogo: data.companyLogo,
                  companyName: data.companyName,
                  taxId: data.taxId,
                  contactPerson: data.contactPerson,
                  phone: data.phone,
                  email: data.email,
                  addresses: data.addresses,
                  updatedAt: now(),
                }
              : c,
          ),
        })),

      softDeleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),

      createPricingTemplate: (data) =>
        set((state) => {
          const template: PricingTemplate = {
            id: makeId(),
            name: data.name,
            description: data.description,
            rules: data.rules,
            createdAt: now(),
            updatedAt: now(),
          }
          return { pricingTemplates: [...state.pricingTemplates, template] }
        }),

      updatePricingTemplate: (id, data) =>
        set((state) => ({
          pricingTemplates: state.pricingTemplates.map((t) =>
            t.id === id
              ? {
                  ...t,
                  name: data.name,
                  description: data.description,
                  rules: data.rules,
                  updatedAt: now(),
                }
              : t,
          ),
        })),

      deletePricingTemplate: (id) =>
        set((state) => ({
          pricingTemplates: state.pricingTemplates.filter((t) => t.id !== id),
        })),

      createContract: (data) =>
        set((state) => {
          const contract: Contract = {
            id: makeId(),
            customerId: data.customerId,
            pricingTemplateId: data.pricingTemplateId,
            contractName: data.contractName,
            startDate: data.startDate,
            endDate: data.endDate,
            sla: data.sla,
            createdAt: now(),
            updatedAt: now(),
          }
          return { contracts: [...state.contracts, contract] }
        }),

      updateContract: (id, data) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  pricingTemplateId: data.pricingTemplateId,
                  contractName: data.contractName,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  sla: data.sla,
                  updatedAt: now(),
                }
              : c,
          ),
        })),

      deleteContract: (id) =>
        set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'laundry-customer-store',
      version: 1,
      migrate: () => ({
        customers: [],
        pricingTemplates: [],
        contracts: [],
      }),
      merge: (persisted, current) =>
        appendSeed({ ...current, ...(persisted as Partial<CustomerState>) }),
    },
  ),
)
