import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
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
import { useHotelStorageStore } from '@/stores/hotel-storage-store.ts'
import type { HotelZoneType } from '@/types/hotel-storage.ts'

const ZONE_TYPE_LABELS: Record<HotelZoneType, string> = {
  shelf: 'Shelf',
  rack: 'Rack',
  bin: 'Bin',
  floor: 'Floor',
  room: 'Room',
}

const zoneTypes = Object.keys(ZONE_TYPE_LABELS) as HotelZoneType[]

export default function HotelZoneManageDialog() {
  const zones = useHotelStorageStore((s) => s.hotelZones)
  const addZone = useHotelStorageStore((s) => s.addZone)
  const updateZone = useHotelStorageStore((s) => s.updateZone)
  const deleteZone = useHotelStorageStore((s) => s.deleteZone)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [capacityUnits, setCapacityUnits] = useState('100')
  const [type, setType] = useState<HotelZoneType>('shelf')

  function resetForm() {
    setEditingId(null)
    setName('')
    setCapacityUnits('100')
    setType('shelf')
  }

  function handleEdit(zone: (typeof zones)[number]) {
    setEditingId(zone.id)
    setName(zone.name)
    setCapacityUnits(zone.capacityUnits.toString())
    setType(zone.type)
  }

  function handleSave() {
    if (!name.trim()) return
    const payload = {
      name: name.trim(),
      capacityUnits: parseInt(capacityUnits, 10) || 100,
      type,
    }
    if (editingId) {
      updateZone(editingId, payload)
    } else {
      addZone(payload)
    }
    resetForm()
  }

  function handleDelete(id: string) {
    deleteZone(id)
    if (editingId === id) resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-3.5 mr-1" />
          Manage Zones
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Storage Zones</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="hzone-name">Zone Name</Label>
              <Input
                id="hzone-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Linen Rack D1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hzone-capacity">Capacity (units)</Label>
              <Input
                id="hzone-capacity"
                type="number"
                min="1"
                value={capacityUnits}
                onChange={(e) => setCapacityUnits(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hzone-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as HotelZoneType)}>
                <SelectTrigger id="hzone-type">
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
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingId ? 'Update Zone' : 'Add Zone'}
            </Button>
            {editingId && (
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {zones.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="text-xs">{zone.name}</TableCell>
                    <TableCell className="text-xs">{zone.capacityUnits}</TableCell>
                    <TableCell className="text-xs">{ZONE_TYPE_LABELS[zone.type]}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() => handleEdit(zone)}
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-destructive"
                          onClick={() => handleDelete(zone.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
