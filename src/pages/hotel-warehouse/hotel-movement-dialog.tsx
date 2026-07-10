import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'
import { useHotelStorageStore } from '@/stores/hotel-storage-store.ts'
import type { LinenCategory } from '@/types/customer.ts'
import type { LinenMovementDirection, LinenMovementReason } from '@/types/hotel-storage.ts'

const CATEGORY_LABELS: Record<LinenCategory, string> = {
  linen: 'Linens',
  towel: 'Towels',
  uniform: 'Uniforms',
}

const REASON_LABELS: Record<LinenMovementReason, string> = {
  delivery: 'Factory Delivery',
  pickup: 'Laundry Pickup',
  purchase: 'New Purchase',
  return: 'Guest Room Return',
  reject: 'Rejected / Damaged',
  transfer: 'Zone Transfer',
  decommission: 'Decommissioned',
  adjustment: 'Stock Adjustment',
}

const categories: LinenCategory[] = ['linen', 'towel', 'uniform']
const reasons: LinenMovementReason[] = [
  'delivery',
  'pickup',
  'purchase',
  'return',
  'reject',
  'transfer',
  'decommission',
  'adjustment',
]

interface HotelMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultZoneId?: string
  defaultDirection?: LinenMovementDirection
  dialogKey?: number
}

export default function HotelMovementDialog({
  open,
  onOpenChange,
  defaultZoneId,
  defaultDirection = 'incoming',
  dialogKey = 0,
}: HotelMovementDialogProps) {
  const zones = useHotelStorageStore((s) => s.hotelZones)
  const recordMovement = useHotelStorageStore((s) => s.recordMovement)

  const [direction, setDirection] = useState(defaultDirection)
  const [zoneId, setZoneId] = useState(defaultZoneId ?? '')
  const [category, setCategory] = useState<LinenCategory>('linen')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState<LinenMovementReason>(
    defaultDirection === 'incoming' ? 'delivery' : 'pickup',
  )
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  function handleSave() {
    const qty = parseInt(quantity, 10)
    if (!zoneId || !qty || qty <= 0) return

    recordMovement({
      zoneId,
      category,
      direction,
      quantity: qty,
      reason,
      reference: reference.trim(),
      notes: notes.trim(),
      userId: 'current-user',
    })
    onOpenChange(false)
  }

  const canSave = zoneId && parseInt(quantity, 10) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" key={dialogKey}>
        <DialogHeader>
          <DialogTitle>
            Record {direction === 'incoming' ? 'Incoming' : 'Outgoing'} Movement
          </DialogTitle>
          <DialogDescription>
            Log linen moving {direction === 'incoming' ? 'into' : 'out of'} storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Direction</Label>
            <RadioGroup
              value={direction}
              onValueChange={(v) => setDirection(v as LinenMovementDirection)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="incoming" id="dir-incoming" />
                <Label htmlFor="dir-incoming" className="text-green-600 font-medium">
                  Incoming
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="outgoing" id="dir-outgoing" />
                <Label htmlFor="dir-outgoing" className="text-red-600 font-medium">
                  Outgoing
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mov-zone">Zone</Label>
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger id="mov-zone">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mov-category">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as LinenCategory)}
            >
              <SelectTrigger id="mov-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mov-quantity">Quantity</Label>
            <Input
              id="mov-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="mov-reason">Reason</Label>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as LinenMovementReason)}
            >
              <SelectTrigger id="mov-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {REASON_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mov-reference">Reference (optional)</Label>
            <Input
              id="mov-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Order / delivery / PO number"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="mov-notes">Notes (optional)</Label>
            <Textarea
              id="mov-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              Record Movement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
