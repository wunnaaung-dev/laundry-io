import { useState } from 'react'
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
} from '@/components/ui/alert-dialog.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'

export default function WarehouseListPage() {
  const navigate = useNavigate()
  const warehouses = useWarehouseStore((s) => s.warehouses)
  const deleteWarehouse = useWarehouseStore((s) => s.deleteWarehouse)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Warehouses</CardTitle>
            <Button onClick={() => navigate('/factory/warehouse/manage/new')}>
              Add Warehouse
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {warehouses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No warehouses yet. Create one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Functions</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((wh) => (
                  <TableRow
                    key={wh.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/factory/warehouse/manage/${wh.id}`)}
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      {wh.warehouseCode}
                    </TableCell>
                    <TableCell>{wh.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {wh.siteId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          wh.status === 'active'
                            ? 'default'
                            : wh.status === 'maintenance'
                              ? 'outline'
                              : 'secondary'
                        }
                      >
                        {wh.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-48">
                      <div className="flex flex-wrap gap-1">
                        {wh.enabledFunctions.map((fn) => (
                          <Badge key={fn} variant="secondary" className="text-xs">
                            {fn}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/factory/warehouse/manage/${wh.id}/edit`)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(wh.id)
                          }}
                        >
                          Delete
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Warehouse?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The warehouse record will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteWarehouse(deleteTarget)
                  setDeleteTarget(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
