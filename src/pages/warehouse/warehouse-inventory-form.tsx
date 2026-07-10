import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import { CATEGORY_LABELS, ZONE_TYPE_LABELS } from './constants.ts'
import type { WarehouseItemCategory, WarehouseZoneType } from '@/types/warehouse.ts'

const categories = Object.keys(CATEGORY_LABELS) as WarehouseItemCategory[]
const zoneTypes = Object.keys(ZONE_TYPE_LABELS) as WarehouseZoneType[]

export default function WarehouseInventoryFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const items = useWarehouseStore((s) => s.items)
  const warehouseZones = useWarehouseStore((s) => s.warehouseZones)
  const addItem = useWarehouseStore((s) => s.addItem)
  const updateItem = useWarehouseStore((s) => s.updateItem)
  const addZone = useWarehouseStore((s) => s.addZone)

  const existing = isEdit ? items.find((i) => i.id === id) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [sku, setSku] = useState(existing?.sku ?? '')
  const [category, setCategory] = useState<WarehouseItemCategory>(
    existing?.category ?? 'detergent',
  )
  const [currentStock, setCurrentStock] = useState(
    existing?.currentStock.toString() ?? '0',
  )
  const [unit, setUnit] = useState(existing?.unit ?? '')
  const [minStockLevel, setMinStockLevel] = useState(
    existing?.minStockLevel.toString() ?? '0',
  )
  const [zoneId, setZoneId] = useState(existing?.zoneId ?? '')
  const [capacityUnits, setCapacityUnits] = useState(
    existing?.capacityUnits?.toString() ?? '1',
  )
  const [supplierInfo, setSupplierInfo] = useState(existing?.supplierInfo ?? '')
  const [sdsUrl, setSdsUrl] = useState(existing?.sdsUrl ?? '')
  const [expiryDate, setExpiryDate] = useState(existing?.expiryDate ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [error, setError] = useState('')
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneCapacity, setNewZoneCapacity] = useState('100')
  const [newZoneType, setNewZoneType] = useState<WarehouseZoneType>('shelf')

  function handleCreateZone() {
    if (!newZoneName.trim()) return
    const zid = addZone({
      name: newZoneName.trim(),
      capacityUnits: parseInt(newZoneCapacity, 10) || 100,
      type: newZoneType,
    })
    setZoneId(zid)
    setZoneDialogOpen(false)
    setNewZoneName('')
    setNewZoneCapacity('100')
    setNewZoneType('shelf')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Item name is required')
      return
    }
    if (!sku.trim()) {
      setError('SKU is required')
      return
    }
    if (!unit.trim()) {
      setError('Unit is required')
      return
    }

    const stock = parseInt(currentStock, 10)
    const min = parseInt(minStockLevel, 10)
    const cap = parseInt(capacityUnits, 10) || 1

    const zone = zoneId ? warehouseZones.find((z) => z.id === zoneId) : undefined
    const location = zone?.name ?? ''

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      category,
      currentStock: isNaN(stock) ? 0 : stock,
      unit: unit.trim(),
      minStockLevel: isNaN(min) ? 0 : min,
      location,
      zoneId: zoneId || undefined,
      capacityUnits: cap,
      supplierInfo: supplierInfo.trim(),
      sdsUrl: sdsUrl.trim(),
      expiryDate: expiryDate.trim(),
      notes: notes.trim(),
    }

    if (isEdit && existing) {
      updateItem(existing.id, payload)
    } else {
      addItem(payload)
    }

    navigate('..', { relative: 'path' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Industrial Liquid Detergent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. CHM-DET-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as WarehouseItemCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((key) => (
                    <SelectItem key={key} value={key}>
                      {CATEGORY_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. L, kg, pcs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level (Reorder Point)</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoneId">Storage Zone</Label>
              <div className="flex gap-2">
                <Select value={zoneId} onValueChange={setZoneId}>
                  <SelectTrigger id="zoneId" className="flex-1">
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseZones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="size-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Zone</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="new-zone-name">Zone Name</Label>
                        <Input
                          id="new-zone-name"
                          value={newZoneName}
                          onChange={(e) => setNewZoneName(e.target.value)}
                          placeholder="e.g. Aisle D - Shelf 1"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-zone-capacity">Capacity</Label>
                        <Input
                          id="new-zone-capacity"
                          type="number"
                          min="1"
                          value={newZoneCapacity}
                          onChange={(e) => setNewZoneCapacity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-zone-type">Type</Label>
                        <Select
                          value={newZoneType}
                          onValueChange={(v) =>
                            setNewZoneType(v as WarehouseZoneType)
                          }
                        >
                          <SelectTrigger id="new-zone-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {zoneTypes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {ZONE_TYPE_LABELS[t]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        onClick={handleCreateZone}
                        disabled={!newZoneName.trim()}
                      >
                        Create Zone
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacityUnits">Capacity Units (space per unit)</Label>
              <Input
                id="capacityUnits"
                type="number"
                min="1"
                value={capacityUnits}
                onChange={(e) => setCapacityUnits(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierInfo">Supplier Info</Label>
              <Input
                id="supplierInfo"
                value={supplierInfo}
                onChange={(e) => setSupplierInfo(e.target.value)}
                placeholder="e.g. ChemCo Ltd."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sdsUrl">SDS URL (for chemicals)</Label>
              <Input
                id="sdsUrl"
                value={sdsUrl}
                onChange={(e) => setSdsUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
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
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Add Item'}
            </Button>
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
