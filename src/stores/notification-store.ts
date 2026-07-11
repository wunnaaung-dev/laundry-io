import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification, NotificationType } from '../types/notification.ts'

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface NotificationState {
  notifications: AppNotification[]

  addNotification: (data: {
    recipientIds: string[]
    type: NotificationType
    title: string
    body: string
    link?: string
  }) => string[]

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
        const ids: string[] = []
        set((state) => {
          const newNotifications = data.recipientIds.map((recipientId) => {
            const id = makeId()
            ids.push(id)
            return {
              id,
              recipientIds: [recipientId],
              type: data.type,
              title: data.title,
              body: data.body,
              link: data.link,
              read: false,
              createdAt: now(),
            } satisfies AppNotification
          })
          return {
            notifications: [...state.notifications, ...newNotifications],
          }
        })
        return ids
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
            n.recipientIds.includes(userId) ? { ...n, read: true } : n,
          ),
        })),

      getUnreadCount: (userId) =>
        get().notifications.filter((n) => n.recipientIds.includes(userId) && !n.read).length,

      getNotificationsForUser: (userId) =>
        get()
          .notifications.filter((n) => n.recipientIds.includes(userId))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      removeNotification: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== notificationId),
        })),

      clearAll: (userId) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => !n.recipientIds.includes(userId)),
        })),
    }),
    {
      name: 'laundry-notification-store',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const raw = persisted as { notifications?: Array<Record<string, unknown>> }
        const oldNotifications = (raw.notifications ?? []) as Array<{ userId?: string; id: string; type: string; title: string; body: string; link?: string; read: boolean; createdAt: string }>
        if (version < 2 && oldNotifications.length > 0) {
          return {
            notifications: oldNotifications.map((n) => ({
              id: n.id,
              recipientIds: n.userId ? [n.userId] : [],
              type: n.type,
              title: n.title,
              body: n.body,
              link: n.link,
              read: n.read,
              createdAt: n.createdAt,
            })),
          }
        }
        return { notifications: (raw.notifications ?? []) as unknown as AppNotification[] }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<NotificationState>),
      }),
    },
  ),
)
