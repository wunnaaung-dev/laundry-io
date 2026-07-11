import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Invoice, InvoiceStatus, LinenCategory } from '../types/customer.ts'
import { useOrderStore } from './order-store.ts'
import { useCustomerStore } from './customer-store.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

interface InvoiceState {
  invoices: Invoice[]

  generateInvoice: (orderId: string, lineItemsOverride?: Array<{ category: LinenCategory; quantity: number; rate: number; amount: number }>, actualQty?: number) => string | null

  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void

  getInvoicesByOrder: (orderId: string) => Invoice[]
  getInvoicesByCustomer: (customerId: string) => Invoice[]
  getInvoiceById: (invoiceId: string) => Invoice | undefined
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],

      generateInvoice: (orderId, lineItemsOverride, actualQty) => {
        const order = useOrderStore.getState().orders.find((o) => o.id === orderId)
        if (!order) return null

        let lineItems: Invoice['lineItems']

        if (lineItemsOverride && lineItemsOverride.length > 0) {
          lineItems = lineItemsOverride
        } else {
          const contract = useCustomerStore
            .getState()
            .contracts.find((c) => c.id === order.contractId)
          const pricingTemplate = contract
            ? useCustomerStore
                .getState()
                .pricingTemplates.find((pt) => pt.id === contract.pricingTemplateId)
            : undefined

          lineItems = order.items.map((item) => {
            const qty = actualQty ?? item.quantity
            let rate = 0
            if (pricingTemplate) {
              for (const rule of pricingTemplate.rules) {
                if (rule.type === 'per_item') {
                  rate = rule.rates[item.category] ?? 0
                }
              }
            }
            return {
              category: item.category,
              quantity: qty,
              rate,
              amount: qty * rate,
            }
          })
        }

        const totalAmount = lineItems.reduce((sum, li) => sum + li.amount, 0)
        const id = makeId()

        set((state) => ({
          invoices: [
            ...state.invoices,
            {
              id,
              orderId,
              customerId: order.customerId,
              contractId: order.contractId,
              lineItems,
              totalAmount,
              status: 'pending',
              dueDate: addDays(now(), 30),
              createdAt: now(),
              updatedAt: now(),
            },
          ],
        }))

        return id
      },

      updateInvoiceStatus: (invoiceId, status) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, status, updatedAt: now() } : inv,
          ),
        })),

      getInvoicesByOrder: (orderId) =>
        get().invoices.filter((inv) => inv.orderId === orderId),

      getInvoicesByCustomer: (customerId) =>
        get().invoices.filter((inv) => inv.customerId === customerId),

      getInvoiceById: (invoiceId) =>
        get().invoices.find((inv) => inv.id === invoiceId),
    }),
    {
      name: 'laundry-invoice-store',
      version: 1,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<InvoiceState>
        return { invoices: data.invoices ?? [] }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<InvoiceState>),
      }),
    },
  ),
)
