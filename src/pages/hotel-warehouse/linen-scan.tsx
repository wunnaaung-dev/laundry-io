import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useHotelLinenStore } from '@/stores/hotel-linen-store.ts'
import type { LinenCondition, LinenItemStatus } from '@/types/hotel-linen.ts'

export default function LinenScanPage() {
  const findLinenByRfid = useHotelLinenStore((s) => s.findLinenByRfid)
  const scanLinenItem = useHotelLinenStore((s) => s.scanLinenItem)

  const [rfidInput, setRfidInput] = useState('')
  const [scannedItem, setScannedItem] = useState<{
    rfidCode: string
    category: string
    washCount: number
    condition: LinenCondition
    status: LinenItemStatus
  } | null>(null)
  const [newCondition, setNewCondition] = useState<LinenCondition>('good')
  const [newStatus, setNewStatus] = useState<LinenItemStatus>('in_stock')
  const [message, setMessage] = useState('')

  function handleScan() {
    setMessage('')
    const code = rfidInput.trim()
    if (!code) {
      setMessage('Please enter an RFID code.')
      return
    }

    const item = findLinenByRfid(code)
    if (!item) {
      setMessage(`No item found with RFID "${code}".`)
      setScannedItem(null)
      return
    }

    setScannedItem({
      rfidCode: item.rfidCode,
      category: item.category,
      washCount: item.washCount,
      condition: item.condition,
      status: item.status,
    })
    setNewCondition(item.condition)
    setNewStatus(item.status)
    setMessage(`Found: ${item.rfidCode}`)
  }

  function handleUpdate() {
    if (!scannedItem) return
    const updated = scanLinenItem(scannedItem.rfidCode, {
      condition: newCondition,
      status: newStatus,
    })
    if (updated) {
      setScannedItem({
        rfidCode: updated.rfidCode,
        category: updated.category,
        washCount: updated.washCount,
        condition: updated.condition as LinenCondition,
        status: updated.status as LinenItemStatus,
      })
      setMessage('Item updated successfully.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Linen Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="rfid">RFID / QR Code</Label>
            <Input
              id="rfid"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              placeholder="Scan or type RFID code..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScan()
              }}
            />
          </div>
          <Button onClick={handleScan}>Scan</Button>
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.startsWith('Found') || message.endsWith('successfully.')
                ? 'text-green-600'
                : 'text-destructive'
            }`}
          >
            {message}
          </p>
        )}

        {scannedItem && (
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-semibold">Item Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">RFID</p>
                <p className="font-mono text-sm">{scannedItem.rfidCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="capitalize">{scannedItem.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Wash Count</p>
                <p>{scannedItem.washCount}x</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Condition</p>
                <Badge
                  variant={
                    scannedItem.condition === 'new' || scannedItem.condition === 'good'
                      ? 'default'
                      : scannedItem.condition === 'fair'
                        ? 'outline'
                        : 'destructive'
                  }
                >
                  {scannedItem.condition}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="condition">Update Condition</Label>
                <Select
                  value={newCondition}
                  onValueChange={(v) => setNewCondition(v as LinenCondition)}
                >
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as LinenItemStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="in_laundry">In Laundry</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleUpdate}>Update Item</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
