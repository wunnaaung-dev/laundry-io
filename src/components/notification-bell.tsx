import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useNotificationStore } from '@/stores/notification-store.ts'
import type { AppNotification } from '@/types/notification.ts'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Bell, CheckCheck, Clock } from 'lucide-react'

export function NotificationBell() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const notifications = useNotificationStore((s) => s.notifications)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const [open, setOpen] = useState(false)

  if (!user) return null

  const userNotifications = notifications
    .filter((n: AppNotification) => n.recipientIds.includes(user.id))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  const unreadCount = userNotifications.filter((n) => !n.read).length

  const handleNotificationClick = (notificationId: string, link?: string) => {
    markRead(notificationId)
    setOpen(false)
    if (link) navigate(link)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px] leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => markAllRead(user.id)}
            >
              <CheckCheck className="size-3" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {userNotifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Bell className="size-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            userNotifications.map((n) => (
              <button
                key={n.id}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                  !n.read ? 'bg-muted/30' : ''
                }`}
                onClick={() => handleNotificationClick(n.id, n.link)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  {!n.read && (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {n.body}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="size-3" />
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
