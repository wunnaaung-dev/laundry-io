import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
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
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import { useDeliveryStore } from '@/stores/delivery-store.ts'

interface ReadyLot {
  lotId: string
  lotNumber: string
  orderId: string
  customerId: string
  customerName: string
  category: string
  quantity: number
  weightKg: number
}

interface AddStopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRouteId: string
  onStopAdded?: () => void
}

export function AddStopDialog({
  open,
  onOpenChange,
  selectedRouteId,
  onStopAdded,
}: AddStopDialogProps) {
  const orders = useOrderStore((s) => s.orders)
  const customers = useCustomerStore((s) => s.customers)
  const linenStagingRecords = useWarehouseStore((s) => s.linenStagingRecords)
  const addStop = useDeliveryStore((s) => s.addStop)
  const addRushStop = useDeliveryStore((s) => s.addRushStop)
  const routes = useDeliveryStore((s) => s.routes)
  const allStops = useDeliveryStore((s) => s.stops)

  const [routeId, setRouteId] = useState(selectedRouteId)
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const [timeWindowStart, setTimeWindowStart] = useState('09:00')
  const [timeWindowEnd, setTimeWindowEnd] = useState('11:00')
  const [priority, setPriority] = useState('2')
  const [notes, setNotes] = useState('')
  const [isRush, setIsRush] = useState(false)

  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))
  const customerAddresses = new Map(
    customers.flatMap((c) =>
      c.addresses.map((a) => [c.id, a.fullAddress]),
    ),
  )

  const stagedLotIds = new Set(linenStagingRecords.map((r) => r.lotId))

  const readyLots: ReadyLot[] = orders
    .filter((o) => o.status === 'received_at_factory')
    .flatMap((o) =>
      o.lots
        .filter((l) => l.status === 'dispatch' && stagedLotIds.has(l.id))
        .map((l) => ({
          lotId: l.id,
          lotNumber: l.lotNumber,
          orderId: o.id,
          customerId: o.customerId,
          customerName: customerMap.get(o.customerId) ?? 'Unknown',
          category: l.category,
          quantity: l.quantity,
          weightKg: l.estimatedWeightKg,
        })),
    )

  const existingLotIds = new Set(
    allStops.filter((s) => s.routeId === routeId).map((s) => s.lotId),
  )

  const availableLots = readyLots.filter((l) => !existingLotIds.has(l.lotId))

  const [capacityError, setCapacityError] = useState('')

  function handleAdd() {
    if (!selectedLotId) return
    const lot = readyLots.find((l) => l.lotId === selectedLotId)
    if (!lot) return

    const address = customerAddresses.get(lot.customerId) ?? ''
    const stopData = {
      routeId,
      orderId: lot.orderId,
      lotId: lot.lotId,
      lotNumber: lot.lotNumber,
      customerId: lot.customerId,
      customerName: lot.customerName,
      address,
      timeWindowStart,
      timeWindowEnd,
      priority: Number(priority),
      notes,
    }

    let ok: boolean
    if (isRush) {
      ok = addRushStop(stopData)
    } else {
      ok = addStop(stopData)
    }

    if (!ok) {
      setCapacityError('Cannot add stop: driver capacity would be exceeded.')
      return
    }

    setCapacityError('')
    setSelectedLotId(null)
    setNotes('')
    setIsRush(false)
    onStopAdded?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Stop to Route</DialogTitle>
          <DialogDescription>
            Select a staged lot and assign it as a delivery stop.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Route</Label>
            <Select value={routeId} onValueChange={setRouteId}>
              <SelectTrigger>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                {routes
                  .filter((r) => r.status === 'draft' || r.status === 'active')
                  .map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Available Lots</Label>
            {availableLots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No available lots. Stage lots in Clean Linen Staging first.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableLots.map((lot) => (
                      <TableRow
                        key={lot.lotId}
                        className={
                          selectedLotId === lot.lotId ? 'bg-muted' : 'cursor-pointer'
                        }
                        onClick={() => setSelectedLotId(lot.lotId)}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            name="lot-select"
                            checked={selectedLotId === lot.lotId}
                            onChange={() => setSelectedLotId(lot.lotId)}
                            className="accent-primary"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{lot.lotNumber}</TableCell>
                        <TableCell className="text-sm">{lot.customerName}</TableCell>
                        <TableCell className="text-sm capitalize">{lot.category}</TableCell>
                        <TableCell className="text-sm">{lot.quantity} pcs</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tw-start">Time Window Start</Label>
              <Input
                id="tw-start"
                type="time"
                value={timeWindowStart}
                onChange={(e) => setTimeWindowStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tw-end">Time Window End</Label>
              <Input
                id="tw-end"
                type="time"
                value={timeWindowEnd}
                onChange={(e) => setTimeWindowEnd(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Highest</SelectItem>
                  <SelectItem value="2">2 - High</SelectItem>
                  <SelectItem value="3">3 - Normal</SelectItem>
                  <SelectItem value="4">4 - Low</SelectItem>
                  <SelectItem value="5">5 - Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {capacityError && (
            <p className="text-sm text-destructive">{capacityError}</p>
          )}

          <div className="flex items-center gap-2">
            <input
              id="rush"
              type="checkbox"
              checked={isRush}
              onChange={(e) => setIsRush(e.target.checked)}
              className="size-4 accent-destructive"
            />
            <Label htmlFor="rush" className="text-sm font-medium text-destructive">
              Rush Order (skips capacity check, auto-priority 1)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Stop Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery instructions for this stop..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedLotId}>
            Add Stop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
