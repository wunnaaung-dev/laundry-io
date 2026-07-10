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
import { useHotelLinenStore } from '@/stores/hotel-linen-store.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import type { LinenItemStatus, LinenCondition } from '@/types/hotel-linen.ts'

const STATUS_LABELS: Record<LinenItemStatus, string> = {
  in_stock: 'In Stock',
  in_laundry: 'In Laundry',
  rejected: 'Rejected',
  decommissioned: 'Decommissioned',
}

const STATUS_VARIANTS: Record<LinenItemStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  in_stock: 'default',
  in_laundry: 'secondary',
  rejected: 'destructive',
  decommissioned: 'outline',
}

const CONDITION_VARIANTS: Record<LinenCondition, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  good: 'secondary',
  fair: 'outline',
  poor: 'destructive',
}

export default function LinenInventoryPage() {
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const linenItems = useHotelLinenStore((s) => s.linenItems)

  const customerId =
    user?.role === 'hotel_super_admin'
      ? customers[0]?.id ?? ''
      : ''

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filtered = linenItems.filter((i) => {
    if (i.customerId !== customerId) return false
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
    return true
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Linen Inventory</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="linen">Linen</SelectItem>
                <SelectItem value="towel">Towel</SelectItem>
                <SelectItem value="uniform">Uniform</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="in_laundry">In Laundry</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="decommissioned">Decommissioned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No linen items found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFID Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Wash Count</TableHead>
                <TableHead>Lot #</TableHead>
                <TableHead>Last Scan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    {item.rfidCode}
                  </TableCell>
                  <TableCell className="capitalize">{item.category}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[item.status]}>
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={CONDITION_VARIANTS[item.condition]}>
                      {item.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.washCount}x</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.lotNumber}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.lastScanDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
