import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useHotelLinenStore } from '@/stores/hotel-linen-store.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'

export default function RejectLogPage() {
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)
  const createOrder = useOrderStore((s) => s.createOrder)
  const rejects = useHotelLinenStore((s) => s.rejects)
  const linenItems = useHotelLinenStore((s) => s.linenItems)
  const addReject = useHotelLinenStore((s) => s.addReject)

  const customerId =
    user?.role === 'hotel_super_admin'
      ? customers[0]?.id ?? ''
      : ''

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRfid, setSelectedRfid] = useState('')
  const [reason, setReason] = useState('')
  const [condition, setCondition] = useState('')
  const [error, setError] = useState('')

  const customerRejects = rejects.filter((r) => r.customerId === customerId)

  const customerLinenItems = linenItems.filter(
    (i) => i.customerId === customerId && i.status !== 'rejected',
  )

  function handleLogReject() {
    setError('')
    if (!selectedRfid) {
      setError('Please select an RFID-tagged item.')
      return
    }
    if (!reason.trim()) {
      setError('Reason is required.')
      return
    }

    const item = linenItems.find((i) => i.rfidCode === selectedRfid)
    if (!item) {
      setError('Item not found.')
      return
    }

    const contractId = orders.find((o) => o.customerId === customerId)
      ?.contractId

    const replacementOrderId = makeReplacementOrder(customerId, contractId, item)

    addReject({
      linenItemId: item.id,
      rfidCode: item.rfidCode,
      category: item.category,
      orderId: item.orderId,
      customerId,
      reason: reason.trim(),
      condition: condition.trim(),
      replacementOrderId,
    })

    setDialogOpen(false)
    setSelectedRfid('')
    setReason('')
    setCondition('')
  }

  function makeReplacementOrder(
    custId: string,
    contractId: string | undefined,
    item: { category: string },
  ): string {
    if (!contractId) return ''
    const orderId = `repl-${Date.now()}`
    createOrder({
      customerId: custId,
      contractId,
      items: [
        {
          category: item.category as 'linen' | 'towel' | 'uniform',
          quantity: 1,
        },
      ],
      expectedCost: 0,
      notes: `Auto-replacement for rejected ${item.category} (${reason}), please include with next delivery.`,
    })
    return orderId
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reject Log</CardTitle>
            <Button onClick={() => setDialogOpen(true)}>Log Reject</Button>
          </div>
        </CardHeader>
        <CardContent>
          {customerRejects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rejects logged.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Replacement</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerRejects.slice().reverse().map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">
                      {r.rfidCode}
                    </TableCell>
                    <TableCell className="capitalize">{r.category}</TableCell>
                    <TableCell>{r.reason}</TableCell>
                    <TableCell>{r.condition}</TableCell>
                    <TableCell>
                      {r.replacementOrderId ? (
                        <Badge variant="secondary">Ordered</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Reject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rfid">RFID-Tagged Item</Label>
              <Select value={selectedRfid} onValueChange={setSelectedRfid}>
                <SelectTrigger id="rfid">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {customerLinenItems.map((i) => (
                    <SelectItem key={i.id} value={i.rfidCode}>
                      {i.rfidCode} — {i.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reject</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Torn fabric, persistent stain"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition Details</Label>
              <Input
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. 5cm tear on pillowcase seam"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogReject}>
              Log Reject & Auto-Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
