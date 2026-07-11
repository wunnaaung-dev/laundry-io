import { useMemo } from 'react'
import { useOrderStore } from '@/stores/order-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import { useDriverStore } from '@/stores/driver-store.ts'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Warehouse, CheckCircle2, Truck } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/lib/order-labels.ts'
import type { Order, Lot } from '@/types/customer.ts'
import type { DriverTask } from '@/stores/driver-store.ts'

const SEED_READY = [
  {
    order: {
      id: 'seed-order-1',
      customerId: 'seed-cust-1',
      status: 'received_at_factory',
      lots: [],
      createdAt: '2026-07-10T08:00:00.000Z',
      updatedAt: '2026-07-10T14:00:00.000Z',
    } as unknown as Order,
    dispatchLots: [
      { id: 'seed-lot-1', lotNumber: 'LOT-2407-001', category: 'towel', quantity: 500, status: 'dispatch' } as unknown as Lot,
      { id: 'seed-lot-2', lotNumber: 'LOT-2407-002', category: 'sheet', quantity: 300, status: 'dispatch' } as unknown as Lot,
    ],
  },
  {
    order: {
      id: 'seed-order-2',
      customerId: 'seed-cust-2',
      status: 'received_at_factory',
      lots: [],
      createdAt: '2026-07-10T09:00:00.000Z',
      updatedAt: '2026-07-10T13:30:00.000Z',
    } as unknown as Order,
    dispatchLots: [
      { id: 'seed-lot-3', lotNumber: 'LOT-2407-003', category: 'uniform', quantity: 150, status: 'dispatch' } as unknown as Lot,
    ],
  },
] satisfies { order: Order; dispatchLots: Lot[] }[]

export default function DriverReadyOrders() {
  const orders = useOrderStore((s) => s.orders)
  const customers = useCustomerStore((s) => s.customers)
  const linenStagingRecords = useWarehouseStore((s) => s.linenStagingRecords)
  const tasks = useDriverStore((s) => s.tasks)

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c.companyName])),
    [customers],
  )

  const existingTaskOrderIds = useMemo(
    () => new Set(tasks.map((t) => t.orderId)),
    [tasks],
  )

  const { finishedOrders, stagedZoneMap } = useMemo(() => {
    const stagedLotIds = new Set(linenStagingRecords.map((r) => r.lotId))
    const zoneMap = new Map(
      linenStagingRecords.map((r) => [r.lotId, r.zoneName]),
    )
    const items = orders
      .filter((o) => o.status === 'received_at_factory')
      .map((o) => {
        const dispatchLots = o.lots.filter(
          (l) => l.status === 'dispatch' && stagedLotIds.has(l.id),
        )
        return { order: o, dispatchLots }
      })
      .filter((entry) => entry.dispatchLots.length > 0)
      .sort(
        (a, b) =>
          new Date(b.order.updatedAt).getTime() -
          new Date(a.order.updatedAt).getTime(),
      )
    return { finishedOrders: items, stagedZoneMap: zoneMap }
  }, [orders, linenStagingRecords])

  const displayOrders = finishedOrders.length === 0 ? SEED_READY : finishedOrders

  const totalReady = displayOrders.reduce(
    (sum, entry) => sum + entry.dispatchLots.length,
    0,
  )

  const SEED_CUSTOMER_NAMES: Record<string, string> = {
    'seed-cust-1': 'Hilton Bangkok',
    'seed-cust-2': 'Marriott Resort',
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ready at Factory</h2>
        <Badge variant="default" className="text-xs">
          {totalReady} lot{totalReady !== 1 ? 's' : ''}
        </Badge>
      </div>

      {displayOrders.map(({ order, dispatchLots }) => {
        const customerName =
          customerMap.get(order.customerId) ??
          SEED_CUSTOMER_NAMES[order.customerId] ??
          'Unknown'
        const alreadyTasked = existingTaskOrderIds.has(order.id)

        return (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm">{customerName}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {order.id.slice(0, 8)} &middot;{' '}
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge className="text-[10px] gap-1 whitespace-nowrap">
                    <Truck className="size-3" />
                    {ORDER_STATUS_LABELS.ready_to_deliver}
                  </Badge>
                  {alreadyTasked && (
                    <Badge variant="secondary" className="text-[10px]">
                      In Tasks
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {dispatchLots.map((lot) => {
                const zone = stagedZoneMap.get(lot.id)
                return (
                  <div
                    key={lot.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-medium">
                        {lot.lotNumber}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {lot.category} &middot; {lot.quantity} pcs
                      </p>
                      {zone && (
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <Warehouse className="size-3" />
                          {zone}
                        </p>
                      )}
                    </div>
                    {alreadyTasked && (
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    )}
                  </div>
                )
              })}
              {!alreadyTasked && (
                <Button
                  size="sm"
                  className="w-full gap-1"
                  onClick={() => {
                    useOrderStore.getState().transitionOrder(order.id, 'in_transit')
                    const newTask: DriverTask = {
                      id: crypto.randomUUID(),
                      orderId: order.id,
                      clientName: customerName,
                      lotDescription: dispatchLots
                        .map((l) => `${l.quantity} ${l.category}`)
                        .join(', '),
                      scheduledTime: new Date().toLocaleDateString(),
                      type: 'delivery',
                      status: 'pending',
                      scannedItems: [],
                    }
                    useDriverStore.getState().setTasks([
                      ...useDriverStore.getState().tasks,
                      newTask,
                    ])
                  }}
                >
                  <CheckCircle2 className="size-4" />
                  Done
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
