import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
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
import { useAuthStore } from '@/stores/auth-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import type { OrderStatus } from '@/types/customer.ts'

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ready_to_deliver: 'Ready to Deliver',
  cancelled: 'Cancelled',
}

const STATUS_VARIANTS: Record<OrderStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  draft: 'secondary',
  scheduled: 'outline',
  ready_to_deliver: 'default',
  cancelled: 'destructive',
}

export default function HotelOrderListPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const contracts = useCustomerStore((s) => s.contracts)
  const orders = useOrderStore((s) => s.orders)

  const profile = customers.find(
    (c) => c.email === user?.email || c.contactPerson === user?.name,
  )

  const myOrders = profile
    ? orders.filter((o) => o.customerId === profile.id)
    : []

  const contractMap = new Map(contracts.map((c) => [c.id, c.contractName]))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Orders</CardTitle>
          <Button onClick={() => navigate('new')}>New Order</Button>
        </div>
      </CardHeader>
      <CardContent>
        {!profile ? (
          <p className="text-sm text-muted-foreground">
            No company profile found. Contact your factory administrator.
          </p>
        ) : myOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Expected Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => navigate(order.id)}
                >
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{contractMap.get(order.contractId) ?? 'Unknown'}</TableCell>
                  <TableCell>{order.items.reduce((s, i) => s + i.quantity, 0)} pcs</TableCell>
                  <TableCell>
                    {order.expectedCost > 0 ? `$${order.expectedCost.toFixed(2)}` : '—'}
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
