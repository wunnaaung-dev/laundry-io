import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import type { OrderStatus, LotStatus } from '@/types/customer.ts'

const ORDER_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ready_to_deliver: 'Ready to Deliver',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const LOT_LABELS: Record<LotStatus, string> = {
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

const LOT_VARIANTS: Record<LotStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
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

interface LotTransition {
  label: string
  next: LotStatus
  variant?: 'default' | 'outline' | 'destructive'
}

const LOT_ACTIONS: Record<LotStatus, LotTransition[]> = {
  tagging: [{ label: 'Mark Sorted', next: 'sorting' }],
  sorting: [{ label: 'Start Wash', next: 'washing' }],
  washing: [{ label: 'Mark Dry', next: 'drying' }],
  drying: [{ label: 'Mark Iron', next: 'ironing' }],
  ironing: [{ label: 'Mark Fold', next: 'folding' }],
  folding: [{ label: 'Send to QC', next: 'qc' }],
  qc: [
    { label: 'Pass QC', next: 'dispatch', variant: 'default' },
  ],
  dispatch: [],
  cancelled: [],
}

export default function FactoryOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const contracts = useCustomerStore((s) => s.contracts)
  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)
  const transitionOrder = useOrderStore((s) => s.transitionOrder)
  const checkInOrder = useOrderStore((s) => s.checkInOrder)
  const transitionLot = useOrderStore((s) => s.transitionLot)
  const setLotQcResult = useOrderStore((s) => s.setLotQcResult)
  const updateLot = useOrderStore((s) => s.updateLot)

  const [editingLotId, setEditingLotId] = useState<string | null>(null)
  const [editRoute, setEditRoute] = useState('')

  const order = orders.find((o) => o.id === id)
  if (!order) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Order not found.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/factory/orders')}>
            Back to Orders
          </Button>
        </CardContent>
      </Card>
    )
  }

  const contract = contracts.find((c) => c.id === order.contractId)
  const customer = customers.find((c) => c.id === order.customerId)

  function handleOrderTransition(to: OrderStatus) {
    if (id) transitionOrder(id, to)
  }

  function handleCheckIn() {
    if (id) checkInOrder(id)
  }

  function handleLotTransition(lotId: string, to: LotStatus) {
    if (id) transitionLot(id, lotId, to)
  }

  function toggleQcPass(lotId: string, current: boolean) {
    if (id) setLotQcResult(id, lotId, !current)
  }

  function startEditRoute(lotId: string, currentRoute: string) {
    setEditingLotId(lotId)
    setEditRoute(currentRoute)
  }

  function saveRoute() {
    if (id && editingLotId) {
      updateLot(id, editingLotId, { route: editRoute })
      setEditingLotId(null)
      setEditRoute('')
    }
  }

  const allDispatched = order.lots.length > 0 && order.lots.every(
    (l) => l.status === 'dispatch' && l.qcCheckPassed,
  )

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/factory/orders')}>
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
              {ORDER_LABELS[order.status]}
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

          {order.status === 'ready_to_deliver' && order.lots.length === 0 && (
            <div className="flex gap-2">
              <Button onClick={handleCheckIn}>Check In &amp; Generate Lots</Button>
              <Button
                variant="destructive"
                onClick={() => handleOrderTransition('cancelled')}
              >
                Cancel Order
              </Button>
            </div>
          )}

          {allDispatched && (
            <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 text-sm">
              All lots have passed QC and are ready for dispatch.
              (Dispatch workflow coming in a future update.)
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
            <div className="flex items-center justify-between">
              <CardTitle>Processing Lots</CardTitle>
              {order.lots.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {order.lots.filter((l) => l.status === 'dispatch').length}/
                  {order.lots.length} dispatched
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {order.lots.map((lot) => (
                <div key={lot.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold">
                        {lot.lotNumber}
                      </span>
                      <Badge className="capitalize" variant="secondary">
                        {lot.category}
                      </Badge>
                      <Badge variant={LOT_VARIANTS[lot.status]}>
                        {LOT_LABELS[lot.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingLotId === lot.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            className="w-40 h-8 text-xs"
                            value={editRoute}
                            onChange={(e) => setEditRoute(e.target.value)}
                            placeholder="e.g. Washer 1 → Flatwork"
                          />
                          <Button size="sm" onClick={saveRoute}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingLotId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditRoute(lot.id, lot.route)}
                        >
                          Route: {lot.route || 'Set'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Qty</span>
                      <p className="font-medium">{lot.quantity} pcs</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Weight</span>
                      <p className="font-medium">{lot.estimatedWeightKg} kg</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(lot.status === 'qc' || lot.status === 'dispatch') && (
                        <>
                          <Checkbox
                            id={`qc-${lot.id}`}
                            checked={lot.qcCheckPassed}
                            onCheckedChange={() => toggleQcPass(lot.id, lot.qcCheckPassed)}
                          />
                          <Label htmlFor={`qc-${lot.id}`} className="text-sm">
                            QC {lot.qcCheckPassed ? 'Passed' : 'Failed'}
                          </Label>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {LOT_ACTIONS[lot.status].map((action) => (
                      <Button
                        key={action.next}
                        size="sm"
                        variant={action.variant ?? 'outline'}
                        onClick={() => handleLotTransition(lot.id, action.next)}
                      >
                        {action.label}
                      </Button>
                    ))}
                    {lot.status !== 'dispatch' && lot.status !== 'qc' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">Cancel Lot</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel {lot.lotNumber}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel this lot. Other lots in the order are unaffected.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleLotTransition(lot.id, 'cancelled')}
                            >
                              Cancel Lot
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">
                      Status History ({lot.statusHistory.length})
                    </summary>
                    <div className="mt-2 space-y-1 pl-2 border-l-2 border-border">
                      {lot.statusHistory.map((entry, i) => (
                        <div key={i}>
                          <span className="font-medium capitalize">{entry.from}</span>
                          {entry.from !== entry.to && (
                            <> &rarr; <span className="font-medium capitalize">{entry.to}</span></>
                          )}
                          <span className="ml-2">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
