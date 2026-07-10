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
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import {
  TRANSACTION_LABELS,
  TRANSACTION_VARIANTS,
} from './constants.ts'

export default function WarehouseTransactionsPage() {
  const items = useWarehouseStore((s) => s.items)
  const transactions = useWarehouseStore((s) => s.transactions)

  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [itemFilter, setItemFilter] = useState<string>('all')

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (itemFilter !== 'all' && t.itemId !== itemFilter) return false
    return true
  })

  const itemMap = new Map(items.map((i) => [i.id, i]))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Transaction Log</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">In</SelectItem>
                <SelectItem value="out">Out</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={itemFilter} onValueChange={setItemFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered
                .slice()
                .reverse()
                .map((t) => {
                  const item = itemMap.get(t.itemId)
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(t.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item?.name ?? 'Unknown Item'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={TRANSACTION_VARIANTS[t.type]}>
                          {TRANSACTION_LABELS[t.type]}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          t.type === 'in'
                            ? 'text-green-600 font-semibold'
                            : t.type === 'out'
                              ? 'text-red-600 font-semibold'
                              : 'text-amber-600 font-semibold'
                        }
                      >
                        {t.type === 'in' ? '+' : t.type === 'out' ? '-' : ''}
                        {t.quantity}
                        {item ? item.unit : ''}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.reference}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {t.notes}
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
