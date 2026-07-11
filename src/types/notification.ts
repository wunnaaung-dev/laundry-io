export type NotificationType =
  | 'route_activated'
  | 'route_changed'
  | 'stop_completed'
  | 'order_transition'
  | 'rush_order'
  | 'missed_delivery'
  | 'change_request'
  | 'count_mismatch'
  | 'order_dispatched'
  | 'driver_arrived'
  | 'tat_breach'
  | 'general'

export interface AppNotification {
  id: string
  recipientIds: string[]
  type: NotificationType
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: string
}
