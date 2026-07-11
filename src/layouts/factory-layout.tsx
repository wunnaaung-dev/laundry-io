import { Outlet } from 'react-router-dom'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar.tsx'
import { FactorySidebar } from '@/components/factory-sidebar.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { NotificationBell } from '@/components/notification-bell.tsx'

export default function FactoryLayout() {
  return (
    <SidebarProvider>
      <FactorySidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-sm font-semibold">Factory Dashboard</h1>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
