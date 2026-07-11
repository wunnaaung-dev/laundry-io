import type { OrderStatus } from '../types/customer.ts'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ready_to_deliver: 'Ready for Dispatch',
  in_transit: 'In Transit to Hotel',
  delivered: 'Delivered to Hotel',
  return_delivered: 'Return Delivered',
  received_at_factory: 'Received at Factory',
  cancelled: 'Cancelled',
}
