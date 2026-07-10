import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import type { ReturnAction } from '@/types/warehouse.ts'
import {
  RETURN_ACTION_LABELS,
  RETURN_ACTION_VARIANTS,
  RETURN_STATUS_LABELS,
} from './constants.ts'

export default function WarehouseReturnsPage() {
  const returns = useWarehouseStore((s) => s.returns)
  const addReturn = useWarehouseStore((s) => s.addReturn)
  const updateReturnStatus = useWarehouseStore((s) => s.updateReturnStatus)

  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [reason, setReason] = useState('')
  const [condition, setCondition] = useState('')
  const [action, setAction] = useState<ReturnAction>('re_wash')
  const [error, setError] = useState('')

  const availableOrders = orders.filter(
    (o) => o.status === 'delivered',
  )

  function getCustomerName(orderId: string): string {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return 'Unknown'
    const customer = customers.find((c) => c.id === order.customerId)
    return customer?.companyName ?? 'Unknown'
  }

  function handleLogReturn() {
    setError('')
    if (!selectedOrder) {
      setError('Please select an order')
      return
    }
    if (!itemDescription.trim()) {
      setError('Item description is required')
      return
    }
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }

    const order = orders.find((o) => o.id === selectedOrder)
    if (!order) return
    const customer = customers.find((c) => c.id === order.customerId)

    addReturn({
      orderId: selectedOrder,
      customerId: order.customerId,
      customerName: customer?.companyName ?? 'Unknown',
      itemDescription: itemDescription.trim(),
      reason: reason.trim(),
      condition: condition.trim(),
      action,
    })

    setDialogOpen(false)
    setSelectedOrder('')
    setItemDescription('')
    setReason('')
    setCondition('')
    setAction('re_wash')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Returns & Damaged Goods</CardTitle>
            <Button onClick={() => setDialogOpen(true)}>Log Return</Button>
          </div>
        </CardHeader>
        <CardContent>
          {returns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No returns recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.slice().reverse().map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.customerName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.itemDescription}
                    </TableCell>
                    <TableCell>{r.reason}</TableCell>
                    <TableCell>{r.condition}</TableCell>
                    <TableCell>
                      <Badge variant={RETURN_ACTION_VARIANTS[r.action]}>
                        {RETURN_ACTION_LABELS[r.action]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={r.status === 'resolved' ? 'secondary' : 'outline'}
                      >
                        {RETURN_STATUS_LABELS[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {r.status === 'pending' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Resolve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Resolve Return?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  updateReturnStatus(r.id, 'resolved')
                                }
                              >
                                Resolve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger id="order">
                  <SelectValue placeholder="Select delivered order" />
                </SelectTrigger>
                <SelectContent>
                  {availableOrders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.id.slice(0, 8)} &mdash; {getCustomerName(o.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemDescription">Item Description</Label>
              <Input
                id="itemDescription"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="e.g. Damaged bedsheet, torn towel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Return</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Torn fabric, stains not removed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition Details</Label>
              <Input
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. 3cm tear on left seam"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={action}
                onValueChange={(v) => setAction(v as ReturnAction)}
              >
                <SelectTrigger id="action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="re_wash">Re-Wash</SelectItem>
                  <SelectItem value="discard">Discard</SelectItem>
                  <SelectItem value="charge">Charge Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogReturn}>Log Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
