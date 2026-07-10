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
import type { WarehouseStatus, WarehouseFunction, WarehouseZoneCategory } from '@/types/warehouse.ts'

const STATUS_OPTIONS: { value: WarehouseStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Maintenance' },
]

const FUNCTION_OPTIONS: { value: WarehouseFunction; label: string }[] = [
  { value: 'receiving', label: 'Receiving' },
  { value: 'storage', label: 'Storage' },
  { value: 'inventoryManagement', label: 'Inventory Management' },
  { value: 'production', label: 'Production' },
  { value: 'dispatch', label: 'Dispatch' },
]

const ZONE_OPTIONS: { value: WarehouseZoneCategory; label: string }[] = [
  { value: 'consumable-chemical', label: 'Consumable & Chemical' },
  { value: 'facilities-utilities', label: 'Facilities & Utilities' },
  { value: 'linen-processing', label: 'Linen Processing' },
  { value: 'packaging-shipping', label: 'Packaging & Shipping' },
]

export default function WarehouseFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const warehouses = useWarehouseStore((s) => s.warehouses)
  const addWarehouse = useWarehouseStore((s) => s.addWarehouse)
  const updateWarehouse = useWarehouseStore((s) => s.updateWarehouse)

  const existing = isEdit ? warehouses.find((w) => w.id === id) : undefined

  const [warehouseCode, setWarehouseCode] = useState(existing?.warehouseCode ?? '')
  const [name, setName] = useState(existing?.name ?? '')
  const [siteId, setSiteId] = useState(existing?.siteId ?? 'main-factory')
  const [status, setStatus] = useState<WarehouseStatus>(existing?.status ?? 'active')
  const [addrLabel, setAddrLabel] = useState(existing?.address.label ?? '')
  const [addrAddress, setAddrAddress] = useState(existing?.address.address ?? '')
  const [enabledFunctions, setEnabledFunctions] = useState<WarehouseFunction[]>(
    existing?.enabledFunctions ?? ['receiving', 'storage', 'inventoryManagement'],
  )
  const [enabledZones, setEnabledZones] = useState<WarehouseZoneCategory[]>(
    existing?.enabledZones ?? ['consumable-chemical', 'facilities-utilities'],
  )
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [error, setError] = useState('')

  function toggleFunction(fn: WarehouseFunction) {
    setEnabledFunctions((prev) =>
      prev.includes(fn) ? prev.filter((f) => f !== fn) : [...prev, fn],
    )
  }

  function toggleZone(zone: WarehouseZoneCategory) {
    setEnabledZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!warehouseCode.trim()) {
      setError('Warehouse code is required')
      return
    }
    if (!name.trim()) {
      setError('Warehouse name is required')
      return
    }

    if (isEdit && existing) {
      updateWarehouse(existing.id, {
        warehouseCode: warehouseCode.trim(),
        name: name.trim(),
        siteId,
        status,
        address: { label: addrLabel.trim(), address: addrAddress.trim() },
        enabledFunctions,
        enabledZones,
        notes: notes.trim(),
      })
    } else {
      addWarehouse({
        warehouseCode: warehouseCode.trim(),
        name: name.trim(),
        siteId,
        status,
        address: { label: addrLabel.trim(), address: addrAddress.trim() },
        enabledFunctions,
        enabledZones,
        notes: notes.trim(),
      })
    }

    navigate('/factory/warehouse/manage')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Warehouse' : 'Add Warehouse'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="warehouseCode">Warehouse Code *</Label>
              <Input
                id="warehouseCode"
                value={warehouseCode}
                onChange={(e) => setWarehouseCode(e.target.value)}
                placeholder="e.g. WH-MAIN-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Warehouse Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Factory Warehouse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteId">Site</Label>
              <Input
                id="siteId"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                placeholder="e.g. main-factory"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as WarehouseStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addrLabel">Address Label</Label>
              <Input
                id="addrLabel"
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                placeholder="e.g. Main Site"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addrAddress">Address</Label>
              <Input
                id="addrAddress"
                value={addrAddress}
                onChange={(e) => setAddrAddress(e.target.value)}
                placeholder="e.g. 123 Factory Road"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Enabled Functions</Label>
            <div className="flex flex-wrap gap-2">
              {FUNCTION_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={enabledFunctions.includes(opt.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFunction(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Enabled Zones</Label>
            <div className="flex flex-wrap gap-2">
              {ZONE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={enabledZones.includes(opt.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleZone(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
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
              {isEdit ? 'Save Changes' : 'Create Warehouse'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/factory/warehouse/manage')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
