import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import type { LinenCategory } from '@/types/customer.ts'

const CATEGORIES: LinenCategory[] = ['linen', 'towel', 'uniform']

interface LineItem {
  category: LinenCategory
  quantity: number
  weightKg: number
}

function emptyItem(): LineItem {
  return { category: 'linen', quantity: 0, weightKg: 0 }
}

export default function HotelOrderFormPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const contracts = useCustomerStore((s) => s.contracts)
  const createOrder = useOrderStore((s) => s.createOrder)

  const profile = customers.find(
    (c) => c.email === user?.email || c.contactPerson === user?.name,
  )

  const myContracts = profile
    ? contracts.filter((c) => c.customerId === profile.id)
    : []

  const [contractId, setContractId] = useState('')
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [pickupDate, setPickupDate] = useState('')
  const [notes, setNotes] = useState('')

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    )
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !contractId) return

    const orderItems = items
      .filter((it) => it.quantity > 0)
      .map((it) => ({
        category: it.category,
        quantity: it.quantity,
        weightKg: it.weightKg > 0 ? it.weightKg : undefined,
      }))

    if (orderItems.length === 0) return

    createOrder({
      customerId: profile.id,
      contractId,
      items: orderItems,
      expectedCost: 0,
      pickupDate: pickupDate || undefined,
      notes: notes || undefined,
    })

    navigate('/hotel/orders')
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No company profile found. Contact your factory administrator.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (myContracts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No contracts assigned. You need a contract before placing an order.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contract">Contract</Label>
            <Select value={contractId} onValueChange={setContractId}>
              <SelectTrigger id="contract">
                <SelectValue placeholder="Select a contract" />
              </SelectTrigger>
              <SelectContent>
                {myContracts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.contractName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Add Item
              </Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={item.category}
                    onValueChange={(v) => updateItem(i, 'category', v as LinenCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    min={0}
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={item.weightKg || ''}
                    onChange={(e) => updateItem(i, 'weightKg', Number(e.target.value))}
                  />
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(i)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Expected Cost</Label>
            <Input id="cost" value="— (auto-calculated from contract)" disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupDate">Pickup Date (optional)</Label>
            <Input
              id="pickupDate"
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Create Order</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/hotel/orders')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
