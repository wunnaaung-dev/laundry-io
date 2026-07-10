import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useHotelLinenStore } from '@/stores/hotel-linen-store.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import type { LinenCategory } from '@/types/customer.ts'

const CATEGORIES: LinenCategory[] = ['linen', 'towel', 'uniform']
const CATEGORY_LABELS: Record<LinenCategory, string> = {
  linen: 'Linen',
  towel: 'Towel',
  uniform: 'Uniform',
}

export default function ParLevelPage() {
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const parLevels = useHotelLinenStore((s) => s.parLevels)
  const setParLevel = useHotelLinenStore((s) => s.setParLevel)

  const customerId =
    user?.role === 'hotel_super_admin'
      ? customers[0]?.id ?? ''
      : ''

  const customerParLevels = parLevels.filter(
    (p) => p.customerId === customerId,
  )

  const [editValues, setEditValues] = useState<
    Record<string, { parQuantity: string; roomCount: string }>
  >(() => {
    const initial: Record<string, { parQuantity: string; roomCount: string }> =
      {}
    for (const cat of CATEGORIES) {
      const existing = customerParLevels.find((p) => p.category === cat)
      initial[cat] = {
        parQuantity: existing?.parQuantity.toString() ?? '0',
        roomCount: existing?.roomCount.toString() ?? '0',
      }
    }
    return initial
  })

  function handleSave(category: LinenCategory) {
    const vals = editValues[category]
    const parQty = parseInt(vals.parQuantity, 10)
    const rooms = parseInt(vals.roomCount, 10)
    if (isNaN(parQty) || isNaN(rooms) || parQty < 0 || rooms < 0) return
    setParLevel(customerId, category, parQty, rooms)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Par Levels</CardTitle>
      </CardHeader>
      <CardContent>
        {!customerId ? (
          <p className="text-sm text-muted-foreground">
            No customer profile found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Par Quantity</TableHead>
                <TableHead>Room Count</TableHead>
                <TableHead>Per Room</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CATEGORIES.map((cat) => {
                const vals = editValues[cat]
                const parQty = parseInt(vals.parQuantity, 10)
                const rooms = parseInt(vals.roomCount, 10)
                const perRoom =
                  !isNaN(parQty) && !isNaN(rooms) && rooms > 0
                    ? (parQty / rooms).toFixed(1)
                    : '—'
                return (
                  <TableRow key={cat}>
                    <TableCell className="font-medium capitalize">
                      {CATEGORY_LABELS[cat]}
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="0"
                          value={vals.parQuantity}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [cat]: { ...prev[cat], parQuantity: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="0"
                          value={vals.roomCount}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [cat]: { ...prev[cat], roomCount: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {perRoom}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleSave(cat)}>
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
