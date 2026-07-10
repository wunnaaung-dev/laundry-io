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
import {
  CATEGORY_LABELS,
  CATEGORY_VARIANTS,
  CONDITION_LABELS,
  CONDITION_VARIANTS,
} from './constants.ts'

export default function WarehouseEquipmentPage() {
  const navigate = useNavigate()
  const equipment = useWarehouseStore((s) => s.equipment)
  const deleteEquipment = useWarehouseStore((s) => s.deleteEquipment)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Equipment & Supplies</CardTitle>
          <Button onClick={() => navigate('new')}>Add Equipment</Button>
        </div>
      </CardHeader>
      <CardContent>
        {equipment.length === 0 ? (
          <p className="text-sm text-muted-foreground">No equipment found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead className="w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>
                    <Badge variant={CATEGORY_VARIANTS[e.category]}>
                      {CATEGORY_LABELS[e.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.location}
                  </TableCell>
                  <TableCell>
                    <Badge variant={CONDITION_VARIANTS[e.condition]}>
                      {CONDITION_LABELS[e.condition]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {e.lastMaintenanceDate
                      ? new Date(e.lastMaintenanceDate).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${e.id}/edit`)}
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
                              Delete &ldquo;{e.name}&rdquo;?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this equipment
                              record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEquipment(e.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
