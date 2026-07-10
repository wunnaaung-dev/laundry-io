import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
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
import { useOrderStore } from '@/stores/order-store.ts'
import type { LinenCategory } from '@/types/customer.ts'

const CATEGORIES: LinenCategory[] = ['linen', 'towel', 'uniform']

export default function StandingOrdersPage() {
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)
  const rules = useHotelLinenStore((s) => s.standingOrderRules)
  const getStockByCategory = useHotelLinenStore((s) => s.getStockByCategory)
  const toggleStandingOrderRule = useHotelLinenStore(
    (s) => s.toggleStandingOrderRule,
  )

  const customerId =
    user?.role === 'hotel_super_admin'
      ? customers[0]?.id ?? ''
      : ''

  const stock = getStockByCategory(customerId)
  const customerOrders = orders.filter(
    (o) => o.customerId === customerId,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Standing Orders</CardTitle>
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
                  <TableHead>In Stock</TableHead>
                  <TableHead>Par Level</TableHead>
                  <TableHead>Stock %</TableHead>
                  <TableHead>Auto-Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATEGORIES.map((cat) => {
                  const s = stock[cat]
                  const rule = rules.find(
                    (r) => r.customerId === customerId && r.category === cat,
                  )
                  const ratio = s.parLevel > 0 ? s.inStock / s.parLevel : 1
                  const needsOrder =
                    rule?.enabled && ratio < (rule.triggerThreshold ?? 0.8)

                  return (
                    <TableRow key={cat}>
                      <TableCell className="font-medium capitalize">
                        {cat}
                      </TableCell>
                      <TableCell>{s.inStock}</TableCell>
                      <TableCell>{s.parLevel}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ratio < 0.5
                              ? 'destructive'
                              : ratio < 0.8
                                ? 'outline'
                                : 'secondary'
                          }
                        >
                          {Math.round(ratio * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule?.enabled ? (
                          <Badge variant="default">Enabled</Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleStandingOrderRule(
                              customerId,
                              cat,
                              !rule?.enabled,
                            )
                          }
                        >
                          {rule?.enabled ? 'Disable' : 'Enable'}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {customerOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerOrders.slice().reverse().slice(0, 5).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">
                      {o.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {o.items
                        .map((i) => `${i.quantity}x ${i.category}`)
                        .join(', ')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          o.status === 'cancelled' ? 'destructive' : 'default'
                        }
                      >
                        {o.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
