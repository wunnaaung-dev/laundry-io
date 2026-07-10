import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import {
  CATEGORY_LABELS,
  CATEGORY_VARIANTS,
  getExpiryStatus,
  EXPIRY_LABELS,
  EXPIRY_VARIANTS,
} from './constants.ts'
import type { WarehouseItemCategory } from '@/types/warehouse.ts'

const categories = Object.keys(CATEGORY_LABELS) as WarehouseItemCategory[]

type FilterMode = 'all' | WarehouseItemCategory | 'expired' | 'expiring_soon'

export default function WarehouseInventoryPage() {
  const navigate = useNavigate()
  const items = useWarehouseStore((s) => s.items)
  const deleteItem = useWarehouseStore((s) => s.deleteItem)
  const [filter, setFilter] = useState<FilterMode>('all')

  const filtered = items.filter((i) => {
    if (filter === 'all') return true
    if (filter === 'expired') return getExpiryStatus(i.expiryDate) === 'expired'
    if (filter === 'expiring_soon')
      return getExpiryStatus(i.expiryDate) === 'expiring_soon'
    return i.category === filter
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Warehouse Inventory</CardTitle>
          <div className="flex items-center gap-3">
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as FilterMode)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                {categories.map((key) => (
                  <SelectItem key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </SelectItem>
                ))}
                <SelectItem value="expired">Expired Only</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => navigate('new')}>Add Item</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Min Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const isLowStock = item.currentStock <= item.minStockLevel
                const expiryStatus = item.expiryDate
                  ? getExpiryStatus(item.expiryDate)
                  : null
                return (
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
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expiryStatus ? (
                        <Badge variant={EXPIRY_VARIANTS[expiryStatus]}>
                          {EXPIRY_LABELS[expiryStatus]}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.location}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`${item.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete &ldquo;{item.name}&rdquo;?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this item from
                                inventory.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteItem(item.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
