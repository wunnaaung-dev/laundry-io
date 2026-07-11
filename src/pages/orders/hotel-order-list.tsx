import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Label } from '@/components/ui/label.tsx'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { useHotelStorageStore } from '@/stores/hotel-storage-store.ts'
import type { OrderStatus, LinenCategory } from '@/types/customer.ts'
import type { LinenMovement } from '@/types/hotel-storage.ts'

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ready_to_deliver: 'Ready to Deliver',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  return_delivered: 'Return Delivered',
  received_at_factory: 'Received at Factory',
  cancelled: 'Cancelled',
}

const STATUS_VARIANTS: Record<OrderStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  draft: 'secondary',
  scheduled: 'outline',
  ready_to_deliver: 'default',
  in_transit: 'default',
  delivered: 'outline',
  return_delivered: 'default',
  received_at_factory: 'default',
  cancelled: 'destructive',
}

const CATEGORY_LABELS: Record<LinenCategory, string> = {
  linen: 'Linens',
  towel: 'Towels',
  uniform: 'Uniforms',
}

const CATEGORY_VARIANTS: Record<LinenCategory, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  linen: 'default',
  towel: 'secondary',
  uniform: 'outline',
}

export default function HotelOrderListPage() {
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const contracts = useCustomerStore((s) => s.contracts)
  const orders = useOrderStore((s) => s.orders)
  const createOrder = useOrderStore((s) => s.createOrder)
  const transitionOrder = useOrderStore((s) => s.transitionOrder)
  const allMovements = useHotelStorageStore((s) => s.movements)
  const pendingMovements = useMemo(
    () => allMovements.filter((m) => m.deliveryStatus === 'pending'),
    [allMovements],
  )
  const confirmDelivery = useHotelStorageStore((s) => s.confirmDelivery)
  const rejectDelivery = useHotelStorageStore((s) => s.rejectDelivery)
  const zones = useHotelStorageStore((s) => s.hotelZones)

  const [selectedMovement, setSelectedMovement] = useState<LinenMovement | null>(null)
  const [confirmCustomerId, setConfirmCustomerId] = useState('')
  const [confirmContractId, setConfirmContractId] = useState('')

  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))
  const contractMap = new Map(contracts.map((c) => [c.id, c.contractName]))
  const zoneMap = new Map(zones.map((z) => [z.id, z.name]))

  const availableContracts = confirmCustomerId
    ? contracts.filter((c) => c.customerId === confirmCustomerId)
    : []

  function handleConfirm() {
    if (!selectedMovement || !confirmCustomerId || !confirmContractId) return

    createOrder({
      customerId: confirmCustomerId,
      contractId: confirmContractId,
      items: [
        {
          category: selectedMovement.category,
          quantity: selectedMovement.quantity,
        },
      ],
      expectedCost: 0,
      notes: `Auto-created from storage movement (${selectedMovement.reason})`,
    })

    const newOrder = useOrderStore.getState().orders.at(-1)
    if (newOrder) {
      transitionOrder(newOrder.id, 'scheduled')
      transitionOrder(newOrder.id, 'ready_to_deliver')
    }

    confirmDelivery(selectedMovement.id)
    setSelectedMovement(null)
    setConfirmCustomerId('')
    setConfirmContractId('')
  }

  function handleReject(movementId: string) {
    rejectDelivery(movementId)
  }

  return (
    <div className="space-y-6">
      {pendingMovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Deliveries</CardTitle>
            <p className="text-sm text-muted-foreground">
              {pendingMovements.length} movement{pendingMovements.length > 1 ? 's' : ''} awaiting confirmation
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMovements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(m.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {zoneMap.get(m.zoneId) ?? 'Unknown Zone'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={CATEGORY_VARIANTS[m.category]}>
                        {CATEGORY_LABELS[m.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.direction === 'incoming' ? 'default' : 'destructive'}>
                        {m.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {m.quantity}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {m.reason.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedMovement(m)
                            setConfirmCustomerId('')
                            setConfirmContractId('')
                          }}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(m.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedMovement} onOpenChange={(open) => { if (!open) setSelectedMovement(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
            <DialogDescription>
              Assign this delivery to a customer and contract to create an order.
              {selectedMovement && (
                <span className="block mt-1 text-muted-foreground">
                  {selectedMovement.quantity}× {CATEGORY_LABELS[selectedMovement.category]} from {zoneMap.get(selectedMovement.zoneId) ?? 'Unknown Zone'}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="confirm-customer">Customer</Label>
              <Select value={confirmCustomerId} onValueChange={(v) => { setConfirmCustomerId(v); setConfirmContractId('') }}>
                <SelectTrigger id="confirm-customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-contract">Contract</Label>
              <Select value={confirmContractId} onValueChange={setConfirmContractId} disabled={!confirmCustomerId}>
                <SelectTrigger id="confirm-contract">
                  <SelectValue placeholder={confirmCustomerId ? 'Select a contract' : 'Select a customer first'} />
                </SelectTrigger>
                <SelectContent>
                  {availableContracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.contractName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMovement(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!confirmCustomerId || !confirmContractId}>
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  )
}
