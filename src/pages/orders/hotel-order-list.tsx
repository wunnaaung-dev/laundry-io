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

export default function HotelOrderListPage() {
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const contracts = useCustomerStore((s) => s.contracts)
  const orders = useOrderStore((s) => s.orders)

  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))
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
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Expected Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => navigate(order.id)}
                >
                  <TableCell>{customerMap.get(order.customerId) ?? 'Unknown'}</TableCell>
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
