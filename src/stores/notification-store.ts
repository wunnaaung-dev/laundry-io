import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType =
  | 'route_activated'
  | 'route_changed'
  | 'stop_completed'
  | 'order_transition'
  | 'rush_order'
  | 'missed_delivery'
  | 'change_request'
  | 'general'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: string
}

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface NotificationState {
  notifications: AppNotification[]

  addNotification: (data: {
    userId: string
    type: NotificationType
    title: string
    body: string
    link?: string
  }) => string

  markRead: (notificationId: string) => void
  markAllRead: (userId: string) => void
  getUnreadCount: (userId: string) => number
  getNotificationsForUser: (userId: string) => AppNotification[]
  removeNotification: (notificationId: string) => void
  clearAll: (userId: string) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (data) => {
        const id = makeId()
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              id,
              userId: data.userId,
              type: data.type,
              title: data.title,
              body: data.body,
              link: data.link,
              read: false,
              createdAt: now(),
            },
          ],
        }))
        return id
      },

      markRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          ),
        })),

      markAllRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n,
          ),
        })),

      getUnreadCount: (userId) =>
        get().notifications.filter((n) => n.userId === userId && !n.read).length,

      getNotificationsForUser: (userId) =>
        get()
          .notifications.filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      removeNotification: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== notificationId),
        })),

      clearAll: (userId) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.userId !== userId),
        })),
    }),
    {
      name: 'laundry-notification-store',
      version: 1,
      migrate: (persisted: unknown) => {
        const data = persisted as Partial<NotificationState>
        return { notifications: data.notifications ?? [] }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<NotificationState>),
      }),
    },
  ),
)
