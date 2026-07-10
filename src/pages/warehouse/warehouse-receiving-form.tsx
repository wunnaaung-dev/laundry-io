import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import { useAuthStore } from '@/stores/auth-store.ts'

interface ReceivingItemLine {
  itemId: string
  itemName: string
  quantity: number
}

export default function WarehouseReceivingFormPage() {
  const navigate = useNavigate()
  const items = useWarehouseStore((s) => s.items)
  const addReceivingRecord = useWarehouseStore((s) => s.addReceivingRecord)
  const recordTransaction = useWarehouseStore((s) => s.recordTransaction)
  const user = useAuthStore((s) => s.user)

  const [supplier, setSupplier] = useState('')
  const [poReference, setPoReference] = useState('')
  const [receivedItems, setReceivedItems] = useState<ReceivingItemLine[]>([
    { itemId: '', itemName: '', quantity: 1 },
  ])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  function addLine() {
    setReceivedItems((prev) => [...prev, { itemId: '', itemName: '', quantity: 1 }])
  }

  function removeLine(index: number) {
    setReceivedItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateLine(index: number, itemId: string) {
    const item = items.find((i) => i.id === itemId)
    setReceivedItems((prev) =>
      prev.map((line, i) =>
        i === index
          ? { ...line, itemId, itemName: item?.name ?? '' }
          : line,
      ),
    )
  }

  function updateQuantity(index: number, quantity: string) {
    const qty = parseInt(quantity, 10)
    setReceivedItems((prev) =>
      prev.map((line, i) =>
        i === index ? { ...line, quantity: isNaN(qty) ? 0 : qty } : line,
      ),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!supplier.trim()) {
      setError('Supplier name is required')
      return
    }
    if (!poReference.trim()) {
      setError('PO reference is required')
      return
    }

    const validLines = receivedItems.filter(
      (line) => line.itemId && line.quantity > 0,
    )
    if (validLines.length === 0) {
      setError('At least one item must be selected with a valid quantity')
      return
    }

    const recordItems = validLines.map((line) => ({
      itemId: line.itemId,
      itemName: line.itemName,
      quantity: line.quantity,
    }))

    addReceivingRecord({
      supplier: supplier.trim(),
      poReference: poReference.trim(),
      items: recordItems,
      receivedBy: user?.name ?? 'Unknown',
      notes: notes.trim(),
    })

    validLines.forEach((line) => {
      recordTransaction({
        itemId: line.itemId,
        type: 'in',
        quantity: line.quantity,
        reference: poReference.trim(),
        notes: `Receiving from ${supplier.trim()}`,
        userId: user?.id ?? '',
      })
    })

    navigate('..', { relative: 'path' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Receiving Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. ChemCo Ltd."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poReference">PO Reference</Label>
              <Input
                id="poReference"
                value={poReference}
                onChange={(e) => setPoReference(e.target.value)}
                placeholder="e.g. PO-2026-001"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items Received</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                Add Item
              </Button>
            </div>
            {receivedItems.map((line, i) => (
              <div
                key={i}
                className="flex gap-3 items-start border rounded-md p-3"
              >
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Item</Label>
                    <Select
                      value={line.itemId}
                      onValueChange={(v) => updateLine(i, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateQuantity(i, e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-5 text-destructive"
                  onClick={() => removeLine(i)}
                  disabled={receivedItems.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit">Create Receiving Record</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('..', { relative: 'path' })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
