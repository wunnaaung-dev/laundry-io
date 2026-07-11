import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { AddStopDialog } from './add-stop-dialog.tsx'
import { Search, Truck, Route } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FactoryDispatchPage() {
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)
  const linenStagingRecords = useWarehouseStore((s) => s.linenStagingRecords)
  const stops = useDeliveryStore((s) => s.stops)
  const [searchQuery, setSearchQuery] = useState('')
  const [addStopOpen, setAddStopOpen] = useState(false)

  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))

  const lotsOnRoute = new Set(stops.map((s) => s.lotId))

  const dispatchedOrders = orders.filter(
    (o) =>
      o.status === 'received_at_factory' &&
      o.lots.some((l) => l.status === 'dispatch'),
  )

  const filtered = dispatchedOrders
    .map((order) => {
      const stagedLotIds = new Set(
        linenStagingRecords
          .filter((r) => r.orderId === order.id)
          .map((r) => r.lotId),
      )
      const readyLots = order.lots.filter(
        (l) =>
          l.status === 'dispatch' &&
          stagedLotIds.has(l.id) &&
          !lotsOnRoute.has(l.id),
      )
      return { order, readyLots }
    })
    .filter(({ order, readyLots }) => {
      if (readyLots.length === 0) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        order.id.toLowerCase().includes(q) ||
        (customerMap.get(order.customerId) ?? '').toLowerCase().includes(q)
      )
    })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dispatch — Load to Truck</CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => navigate('/factory/dispatch/routes')}
              >
                <Route className="size-3.5" />
                Route Planning
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search order or hotel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery.trim()
                ? 'No matching orders ready for dispatch.'
                : 'All lots have been assigned to routes. No lots remaining for dispatch.'}
            </p>
          ) : (
            <div className="space-y-6">
              {filtered.map(({ order, readyLots }) => (
                <Card key={order.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">
                          Order #{order.id.slice(0, 8)} &mdash;{' '}
                          {customerMap.get(order.customerId) ?? 'Unknown'}
                        </CardTitle>
                      </div>
                      <Badge variant="default">
                        {readyLots.length} lot
                        {readyLots.length !== 1 ? 's' : ''} ready
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lot</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Staging Zone</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {readyLots.map((lot) => {
                          const staging = linenStagingRecords.find(
                            (r) => r.lotId === lot.id,
                          )
                          return (
                            <TableRow key={lot.id}>
                              <TableCell className="font-mono text-xs">
                                {lot.lotNumber}
                              </TableCell>
                              <TableCell className="capitalize">
                                {lot.category}
                              </TableCell>
                              <TableCell>{lot.quantity} pcs</TableCell>
                              <TableCell>{lot.estimatedWeightKg} kg</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {staging?.zoneName ?? '—'}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => setAddStopOpen(true)}
                                >
                                  <Truck className="size-3.5" />
                                  Load
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddStopDialog
        open={addStopOpen}
        onOpenChange={setAddStopOpen}
        selectedRouteId=""
      />
    </div>
  )
}
