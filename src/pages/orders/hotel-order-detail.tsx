import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
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
import type { OrderStatus, LotStatus } from '@/types/customer.ts'

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ready_to_deliver: 'Ready to Deliver',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const LOT_STATUS_LABELS: Record<LotStatus, string> = {
  tagging: 'Tagging',
  sorting: 'Sorting',
  washing: 'Washing',
  drying: 'Drying',
  ironing: 'Ironing',
  folding: 'Folding',
  qc: 'QC',
  dispatch: 'Dispatch',
  cancelled: 'Cancelled',
}

const LOT_STATUS_VARIANTS: Record<LotStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  tagging: 'secondary',
  sorting: 'secondary',
  washing: 'default',
  drying: 'default',
  ironing: 'default',
  folding: 'default',
  qc: 'outline',
  dispatch: 'default',
  cancelled: 'destructive',
}

export default function HotelOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const contracts = useCustomerStore((s) => s.contracts)
  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)
  const transitionOrder = useOrderStore((s) => s.transitionOrder)

  const order = orders.find((o) => o.id === id)
  if (!order) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Order not found.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/hotel/orders')}>
            Back to Orders
          </Button>
        </CardContent>
      </Card>
    )
  }

  const contract = contracts.find((c) => c.id === order.contractId)
  const customer = customers.find((c) => c.id === order.customerId)

  function handleTransition(to: OrderStatus) {
    if (id) transitionOrder(id, to)
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/hotel/orders')}>
        &larr; Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {customer?.companyName ?? 'Unknown'} &middot;{' '}
                {contract?.contractName ?? 'Unknown'}
              </p>
            </div>
            <Badge variant={order.status === 'cancelled' ? 'destructive' : 'default'}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Expected Cost</span>
              <p className="font-medium">
                {order.expectedCost > 0 ? `$${order.expectedCost.toFixed(2)}` : '—'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Pickup Date</span>
              <p className="font-medium">{order.pickupDate ?? 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes</span>
              <p className="mt-1">{order.notes}</p>
            </div>
          )}

          {order.status === 'draft' && (
            <div className="flex gap-2">
              <Button onClick={() => handleTransition('scheduled')}>Submit Order</Button>
              <Button
                variant="destructive"
                onClick={() => handleTransition('cancelled')}
              >
                Cancel Order
              </Button>
            </div>
          )}

          {order.status === 'scheduled' && (
            <div className="flex gap-2">
              <Button onClick={() => handleTransition('ready_to_deliver')}>
                Mark Ready to Deliver
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleTransition('cancelled')}
              >
                Cancel Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Weight (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="capitalize">{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.weightKg ? item.weightKg : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.lots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Lots</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lot</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.lots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-mono text-xs">{lot.lotNumber}</TableCell>
                    <TableCell className="capitalize">{lot.category}</TableCell>
                    <TableCell>{lot.quantity}</TableCell>
                    <TableCell>{lot.estimatedWeightKg}</TableCell>
                    <TableCell className="text-xs">{lot.route || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={LOT_STATUS_VARIANTS[lot.status]}>
                        {LOT_STATUS_LABELS[lot.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lot.status === 'dispatch' || lot.status === 'qc' ? (
                        <Badge variant={lot.qcCheckPassed ? 'default' : 'destructive'}>
                          {lot.qcCheckPassed ? 'Pass' : 'Fail'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {order.statusHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <div className="space-y-3">
              {order.statusHistory.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="size-2 rounded-full bg-primary mt-1.5" />
                    {i < order.statusHistory.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">{STATUS_LABELS[entry.from]}</span>
                      {entry.from !== entry.to && (
                        <> &rarr; <span className="font-medium">{STATUS_LABELS[entry.to]}</span></>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
