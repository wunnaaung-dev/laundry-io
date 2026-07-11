import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
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
import { useCustomerStore } from '@/stores/customer-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { Scan, Search } from 'lucide-react'

export default function FactoryReceivingPage() {
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)
  const checkInOrder = useOrderStore((s) => s.checkInOrder)
  const [searchCode, setSearchCode] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))

  const deliveredOrders = orders.filter((o) => o.status === 'delivered')

  const filtered = searchCode.trim()
    ? deliveredOrders.filter((o) =>
        o.id.toLowerCase().includes(searchCode.trim().toLowerCase()),
      )
    : deliveredOrders

  function handleConfirm(id: string) {
    checkInOrder(id)
    setConfirmId(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Receiving — Confirm Arrival</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Scan or search order..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchCode.trim()
                ? 'No matching orders found.'
                : 'No orders awaiting check-in.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Expected Cost</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead className="w-48">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {customerMap.get(order.customerId) ?? 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {order.items.reduce((s, i) => s + i.quantity, 0)} pcs
                    </TableCell>
                    <TableCell>
                      {order.expectedCost > 0
                        ? `$${order.expectedCost.toFixed(2)}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <AlertDialog
                          open={confirmId === order.id}
                          onOpenChange={(open) =>
                            setConfirmId(open ? order.id : null)
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                              <Scan className="size-3.5" />
                              Confirm Arrival
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirm Arrival
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Mark order #{order.id.slice(0, 8)} from{' '}
                                {customerMap.get(order.customerId) ??
                                  'Unknown'}{' '}
                                as received? This will generate processing lots
                                and move the order to the processing queue.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleConfirm(order.id)}
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/factory/orders/${order.id}`)
                          }
                        >
                          View
                        </Button>
                      </div>
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
