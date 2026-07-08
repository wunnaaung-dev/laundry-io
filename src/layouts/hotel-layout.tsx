import { Outlet } from 'react-router-dom'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar.tsx'
import { HotelSidebar } from '@/components/hotel-sidebar.tsx'
import { Separator } from '@/components/ui/separator.tsx'

export default function HotelLayout() {
  return (
    <SidebarProvider>
      <HotelSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-sm font-semibold">Hotel Dashboard</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
