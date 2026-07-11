import { useState } from 'react'
import { useChangeRequestStore } from '@/stores/change-request-store.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card.tsx'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { useOrderStore } from '@/stores/order-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { Plus, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ChangeRequestsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const requests = useChangeRequestStore((s) => s.requests)
  const createRequest = useChangeRequestStore((s) => s.createRequest)
  const resolveRequest = useChangeRequestStore((s) => s.resolveRequest)
  const orders = useOrderStore((s) => s.orders)
  const customers = useCustomerStore((s) => s.customers)

  const [showCreate, setShowCreate] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [changeType, setChangeType] = useState<
    'quantity' | 'schedule' | 'address' | 'other'
  >('quantity')
  const [requestedChanges, setRequestedChanges] = useState('')
  const [reason, setReason] = useState('')

  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const resolvedRequests = requests.filter((r) => r.status !== 'pending')

  function handleCreate() {
    if (!selectedOrderId || !requestedChanges.trim() || !reason.trim()) return
    const order = orders.find((o) => o.id === selectedOrderId)
    if (!order) return
    createRequest({
      orderId: selectedOrderId,
      customerId: order.customerId,
      customerName: customerMap.get(order.customerId) ?? 'Unknown',
      type: changeType,
      requestedChanges: requestedChanges.trim(),
      reason: reason.trim(),
    })
    setShowCreate(false)
    setSelectedOrderId('')
    setRequestedChanges('')
    setReason('')
  }

  function handleResolve(
    id: string,
    status: 'approved' | 'rejected',
  ) {
    const notes =
      status === 'approved'
        ? 'Approved by admin'
        : 'Rejected by admin'
    resolveRequest(id, status, user?.name ?? 'Admin', notes)
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/factory/dispatch')}
        className="gap-1"
      >
        <ArrowLeft className="size-4" />
        Back to Dispatch
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Change Requests</h2>
          <p className="text-sm text-muted-foreground">
            Manage order change requests from customers
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="size-3.5" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-4" />
            Pending Requests
          </CardTitle>
          {pendingRequests.length === 0 && (
            <CardDescription>No pending requests.</CardDescription>
          )}
        </CardHeader>
        {pendingRequests.length > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Requested Changes</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.customerName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {r.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {r.requestedChanges}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {r.reason}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-green-600"
                          title="Approve"
                          onClick={() => handleResolve(r.id, 'approved')}
                        >
                          <CheckCircle2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          title="Reject"
                          onClick={() => handleResolve(r.id, 'rejected')}
                        >
                          <XCircle className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {resolvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolved Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resolved By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedRequests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.customerName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {r.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === 'approved' ? 'default' : 'destructive'
                        }
                        className="capitalize"
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{r.resolvedBy}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.resolvedAt
                        ? new Date(r.resolvedAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Change Request</DialogTitle>
            <DialogDescription>
              Record a change request from a customer on behalf of them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Order</Label>
              <Select
                value={selectedOrderId}
                onValueChange={setSelectedOrderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders
                    .filter(
                      (o) =>
                        o.status !== 'cancelled' &&
                        o.status !== 'draft',
                    )
                    .map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.id.slice(0, 8)} &middot;{' '}
                        {customerMap.get(o.customerId) ?? 'Unknown'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={changeType}
                onValueChange={(v) =>
                  setChangeType(
                    v as 'quantity' | 'schedule' | 'address' | 'other',
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="changes">Requested Changes</Label>
              <Input
                id="changes"
                value={requestedChanges}
                onChange={(e) => setRequestedChanges(e.target.value)}
                placeholder="Describe the changes requested..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this change needed?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !selectedOrderId ||
                !requestedChanges.trim() ||
                !reason.trim()
              }
            >
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
