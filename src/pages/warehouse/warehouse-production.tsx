import { useState } from 'react'
import { Badge } from '@/components/ui/badge.tsx'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useOrderStore } from '@/stores/order-store.ts'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import {
  CATEGORY_LABELS,
  CATEGORY_VARIANTS,
} from './constants.ts'
import type { LotStatus } from '@/types/customer.ts'

const LOT_LABELS: Record<LotStatus, string> = {
  tagging: 'Tagging',
  sorting: 'Sorting',
  washing: 'Washing',
  drying: 'Drying',
  ironing: 'Ironing',
  folding: 'Folding',
  qc: 'QC',
  dispatch: 'Dispatched',
  cancelled: 'Cancelled',
}

const LOT_VARIANTS: Record<LotStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  tagging: 'secondary',
  sorting: 'outline',
  washing: 'default',
  drying: 'outline',
  ironing: 'secondary',
  folding: 'outline',
  qc: 'default',
  dispatch: 'secondary',
  cancelled: 'destructive',
}

const ACTIVE_STATUSES: LotStatus[] = [
  'tagging',
  'sorting',
  'washing',
  'drying',
  'ironing',
  'folding',
  'qc',
]

const LINEN_LABELS: Record<string, string> = {
  linen: 'Linen',
  towel: 'Towel',
  uniform: 'Uniform',
}

const LINEN_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  linen: 'default',
  towel: 'secondary',
  uniform: 'outline',
}

const SUPPLY_CATEGORIES = ['detergent', 'bleach', 'softener', 'chemical', 'solvent'] as const

export default function WarehouseProductionPage() {
  const orders = useOrderStore((s) => s.orders)
  const customers = useCustomerStore((s) => s.customers)
  const items = useWarehouseStore((s) => s.items)

  const [statusFilter, setStatusFilter] = useState<string>('all')

  const activeLots = orders.flatMap((order) => {
    const customer = customers.find((c) => c.id === order.customerId)
    return order.lots
      .filter((lot) => ACTIVE_STATUSES.includes(lot.status))
      .map((lot) => ({
        ...lot,
        orderId: order.id,
        customerName: customer?.companyName ?? 'Unknown',
      }))
  })

  const filtered =
    statusFilter === 'all'
      ? activeLots
      : activeLots.filter((l) => l.status === statusFilter)

  const relatedSupplies = items.filter((i) =>
    (SUPPLY_CATEGORIES as readonly string[]).includes(i.category),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Production Queue</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {ACTIVE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LOT_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active lots in production.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Lot #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {lot.orderId.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">{lot.lotNumber}</TableCell>
                    <TableCell>{lot.customerName}</TableCell>
                    <TableCell>
                      <Badge variant={LINEN_VARIANTS[lot.category] ?? 'secondary'}>
                        {LINEN_LABELS[lot.category] ?? lot.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={LOT_VARIANTS[lot.status]}>
                        {LOT_LABELS[lot.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lot.route || 'N/A'}
                    </TableCell>
                    <TableCell>{lot.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supplies Status</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedSupplies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No supply items in inventory.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supply Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedSupplies.map((item) => {
                  const isLowStock = item.currentStock <= item.minStockLevel
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant={CATEGORY_VARIANTS[item.category]}>
                          {CATEGORY_LABELS[item.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.currentStock}
                        {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.minStockLevel}
                        {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isLowStock ? 'destructive' : 'secondary'}>
                          {isLowStock ? 'Low Stock' : 'Sufficient'}
                        </Badge>
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
    </div>
  )
}
