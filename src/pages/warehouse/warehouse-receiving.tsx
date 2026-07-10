import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
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
import { RECEIVING_STATUS_LABELS } from './constants.ts'

export default function WarehouseReceivingPage() {
  const navigate = useNavigate()
  const receivingRecords = useWarehouseStore((s) => s.receivingRecords)
  const completeReceiving = useWarehouseStore((s) => s.completeReceiving)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Receiving</CardTitle>
          <Button onClick={() => navigate('new')}>New Receiving Record</Button>
        </div>
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
                <TableHead>Received By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivingRecords.slice().reverse().map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.supplier}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.poReference}
                  </TableCell>
                  <TableCell>{r.items.length}</TableCell>
                  <TableCell>{r.receivedBy}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === 'completed' ? 'secondary' : 'outline'
                      }
                    >
                      {RECEIVING_STATUS_LABELS[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {r.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Complete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Complete Receiving?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Mark this receiving record as completed. Stock
                              levels will be updated for all items.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => completeReceiving(r.id)}
                            >
                              Complete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
