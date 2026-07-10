import { useState } from 'react'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import {
  CATEGORY_LABELS,
  CATEGORY_VARIANTS,
  RECEIVING_STATUS_LABELS,
  RETURN_STATUS_LABELS,
  RETURN_ACTION_LABELS,
  getExpiryStatus,
  EXPIRY_LABELS,
  EXPIRY_VARIANTS,
} from './constants.ts'

export default function WarehouseDashboardPage() {
  const items = useWarehouseStore((s) => s.items)
  const receivingRecords = useWarehouseStore((s) => s.receivingRecords)
  const returns = useWarehouseStore((s) => s.returns)
  const getLowStockItems = useWarehouseStore((s) => s.getLowStockItems)

  const lowStockItems = getLowStockItems()
  const pendingReceiving = receivingRecords.filter((r) => r.status === 'pending')
  const pendingReturns = returns.filter((r) => r.status === 'pending')
  const [now] = useState(() => Date.now())

  const expiringItems = items.filter(
    (i) => i.expiryDate && getExpiryStatus(i.expiryDate) !== 'valid',
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{items.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-destructive">
                  {lowStockItems.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Pending Receiving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingReceiving.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Pending Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingReturns.length}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All items are adequately stocked.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell>
                      <Badge variant={CATEGORY_VARIANTS[item.category]}>
                        {CATEGORY_LABELS[item.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {item.currentStock}
                      {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.minStockLevel}
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.location}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent>
          {expiringItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items are expired or expiring soon.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {expiringItems.map((item) => {
                  const status = getExpiryStatus(item.expiryDate)
                  const daysLeft = Math.ceil(
                    (new Date(item.expiryDate).getTime() - now) /
                      (1000 * 60 * 60 * 24),
                  )
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={EXPIRY_VARIANTS[status]}>
                          {EXPIRY_LABELS[status]}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          status === 'expired'
                            ? 'text-destructive font-semibold'
                            : 'text-amber-500 font-semibold'
                        }
                      >
                        {status === 'expired'
                          ? `${Math.abs(daysLeft)} days ago`
                          : `${daysLeft} days`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.location}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Receiving</CardTitle>
          </CardHeader>
          <CardContent>
            {receivingRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No receiving records yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>PO Reference</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivingRecords.slice().reverse().slice(0, 5).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.supplier}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.poReference}
                      </TableCell>
                      <TableCell>{r.items.length}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === 'completed' ? 'secondary' : 'outline'
                          }
                        >
                          {RECEIVING_STATUS_LABELS[r.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Returns</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingReturns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending returns.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReturns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.customerName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.itemDescription}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {RETURN_ACTION_LABELS[r.action]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {RETURN_STATUS_LABELS[r.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
