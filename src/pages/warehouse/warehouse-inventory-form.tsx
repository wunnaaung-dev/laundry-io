import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import { CATEGORY_LABELS } from './constants.ts'
import type { WarehouseItemCategory } from '@/types/warehouse.ts'

const categories = Object.keys(CATEGORY_LABELS) as WarehouseItemCategory[]

export default function WarehouseInventoryFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const items = useWarehouseStore((s) => s.items)
  const addItem = useWarehouseStore((s) => s.addItem)
  const updateItem = useWarehouseStore((s) => s.updateItem)

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
  const [location, setLocation] = useState(existing?.location ?? '')
  const [supplierInfo, setSupplierInfo] = useState(existing?.supplierInfo ?? '')
  const [sdsUrl, setSdsUrl] = useState(existing?.sdsUrl ?? '')
  const [expiryDate, setExpiryDate] = useState(existing?.expiryDate ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [error, setError] = useState('')

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

    if (isEdit && existing) {
      updateItem(existing.id, {
        name: name.trim(),
        sku: sku.trim(),
        category,
        currentStock: isNaN(stock) ? 0 : stock,
        unit: unit.trim(),
        minStockLevel: isNaN(min) ? 0 : min,
        location: location.trim(),
        supplierInfo: supplierInfo.trim(),
        sdsUrl: sdsUrl.trim(),
        expiryDate: expiryDate.trim(),
        notes: notes.trim(),
      })
    } else {
      addItem({
        name: name.trim(),
        sku: sku.trim(),
        category,
        currentStock: isNaN(stock) ? 0 : stock,
        unit: unit.trim(),
        minStockLevel: isNaN(min) ? 0 : min,
        location: location.trim(),
        supplierInfo: supplierInfo.trim(),
        sdsUrl: sdsUrl.trim(),
        expiryDate: expiryDate.trim(),
        notes: notes.trim(),
      })
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
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Aisle A - Shelf 1"
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
