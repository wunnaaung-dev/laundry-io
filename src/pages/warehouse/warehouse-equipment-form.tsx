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
import { CATEGORY_LABELS, CONDITION_LABELS } from './constants.ts'
import type { WarehouseItemCategory } from '@/types/warehouse.ts'

const categories = Object.keys(CATEGORY_LABELS) as WarehouseItemCategory[]

const conditions = ['new', 'good', 'fair', 'poor'] as const

export default function WarehouseEquipmentFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const equipment = useWarehouseStore((s) => s.equipment)
  const addEquipment = useWarehouseStore((s) => s.addEquipment)
  const updateEquipment = useWarehouseStore((s) => s.updateEquipment)

  const existing = isEdit ? equipment.find((e) => e.id === id) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState<WarehouseItemCategory>(
    existing?.category ?? 'maintenance_equipment',
  )
  const [location, setLocation] = useState(existing?.location ?? '')
  const [condition, setCondition] = useState<string>(
    existing?.condition ?? 'good',
  )
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Equipment name is required')
      return
    }

    if (isEdit && existing) {
      updateEquipment(existing.id, {
        name: name.trim(),
        category,
        location: location.trim(),
        condition: condition as 'new' | 'good' | 'fair' | 'poor',
        notes: notes.trim(),
      })
    } else {
      addEquipment({
        name: name.trim(),
        category,
        location: location.trim(),
        condition: condition as 'new' | 'good' | 'fair' | 'poor',
        notes: notes.trim(),
      })
    }

    navigate('..', { relative: 'path' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit Equipment' : 'Add Equipment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Forklift (Electric)"
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Warehouse Bay 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CONDITION_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isEdit ? 'Save Changes' : 'Add Equipment'}
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
