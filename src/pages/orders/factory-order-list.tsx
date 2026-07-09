import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import type { OrderStatus } from '@/types/customer.ts'

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ready_to_deliver: 'Ready to Deliver',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_VARIANTS: Record<OrderStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  draft: 'secondary',
  scheduled: 'outline',
  ready_to_deliver: 'default',
  in_transit: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
}

export default function FactoryOrderListPage() {
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  const statuses: OrderStatus[] = [
    'draft',
    'scheduled',
    'ready_to_deliver',
    'cancelled',
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Orders</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Lots</TableHead>
                <TableHead>Expected Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const lotsDone = order.lots.filter(
                  (l) => l.status === 'dispatch',
                ).length
                return (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => navigate(order.id)}
                  >
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {customerMap.get(order.customerId) ?? 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {order.items.reduce((s, i) => s + i.quantity, 0)} pcs
                    </TableCell>
                    <TableCell className="text-xs">
                      {order.lots.length > 0
                        ? `${lotsDone}/${order.lots.length}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {order.expectedCost > 0
                        ? `$${order.expectedCost.toFixed(2)}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
