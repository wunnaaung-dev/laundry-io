import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useHotelLinenStore } from '@/stores/hotel-linen-store.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import type { LinenCategory } from '@/types/customer.ts'

const CATEGORY_LABELS: Record<LinenCategory, string> = {
  linen: 'Linen',
  towel: 'Towel',
  uniform: 'Uniform',
}

export default function HotelWarehouseDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const getStockByCategory = useHotelLinenStore((s) => s.getStockByCategory)
  const rejects = useHotelLinenStore((s) => s.rejects)
  const parLevels = useHotelLinenStore((s) => s.parLevels)

  const customerId =
    user?.role === 'hotel_super_admin'
      ? customers[0]?.id ?? ''
      : ''

  const stock = getStockByCategory(customerId)
  const pendingRejects = rejects.filter((r) => !r.replacementOrderId)
  const categories: LinenCategory[] = ['linen', 'towel', 'uniform']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hotel Warehouse Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((cat) => {
              const s = stock[cat]
              const ratio = s.parLevel > 0 ? s.inStock / s.parLevel : 1
              const variant =
                ratio < 0.5
                  ? 'destructive'
                  : ratio < 0.8
                    ? 'outline'
                    : 'secondary'
              return (
                <Card key={cat}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground capitalize">
                      {CATEGORY_LABELS[cat]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{s.inStock}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Par level: {s.parLevel}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={variant}>
                        {Math.round(ratio * 100)}% stocked
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {s.inLaundry} in laundry
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Par Levels</CardTitle>
          </CardHeader>
          <CardContent>
            {parLevels.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No par levels configured.
              </p>
            ) : (
              <div className="space-y-3">
                {parLevels
                  .filter((p) => p.customerId === customerId)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between border rounded-md p-3"
                    >
                      <div>
                        <p className="font-medium capitalize">{p.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.roomCount} rooms
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{p.parQuantity}</p>
                        <p className="text-xs text-muted-foreground">
                          pieces needed
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Rejects</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRejects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending rejects.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingRejects.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <p className="font-medium">{r.rfidCode}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.reason}
                      </p>
                    </div>
                    <Badge variant="destructive">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
