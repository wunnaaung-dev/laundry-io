import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { DriverBottomNav } from '@/components/driver-bottom-nav.tsx'
import { useDriverStore } from '@/stores/driver-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'

const statusLabels: Record<string, string> = {
  idle: 'Standing By',
  in_transit: 'In Transit',
  arrived: 'Arrived',
  delivered: 'Delivered',
}

export default function DriverLayout() {
  const user = useAuthStore((s) => s.user)
  const tripStatus = useDriverStore((s) => s.tripStatus)
  const syncReadyOrders = useDriverStore((s) => s.syncReadyOrders)

  useEffect(() => {
    const sync = () => {
      const orders = useOrderStore.getState().orders
      const customers = useCustomerStore.getState().customers
      syncReadyOrders(orders, customers)
    }

    sync()

    const unsubOrders = useOrderStore.subscribe(() => sync())
    const unsubCustomers = useCustomerStore.subscribe(() => sync())

    return () => {
      unsubOrders()
      unsubCustomers()
    }
  }, [syncReadyOrders])

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-background shadow-lg">
        <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
          <span className="text-sm font-semibold truncate">{user?.name}</span>
          <Badge
            variant={tripStatus === 'in_transit' ? 'default' : 'secondary'}
          >
            {statusLabels[tripStatus] ?? 'Standing By'}
          </Badge>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <DriverBottomNav />
      </div>
    </div>
  )
}
