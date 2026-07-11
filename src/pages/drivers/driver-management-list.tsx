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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card.tsx'
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
import { useDriverManagementStore } from '@/stores/driver-management-store.ts'
import { Plus, Pencil, Trash2, Truck, User } from 'lucide-react'

const VEHICLE_LABELS: Record<string, string> = {
  truck: 'Truck',
  van: 'Van',
  motorcycle: 'Motorcycle',
}

export default function DriverManagementListPage() {
  const navigate = useNavigate()
  const driverProfiles = useDriverManagementStore((s) => s.driverProfiles)
  const deleteDriver = useDriverManagementStore((s) => s.deleteDriver)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Driver Management</CardTitle>
            <CardDescription>
              Manage driver profiles and vehicle assignments
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/factory/drivers/new')} className="gap-1">
            <Plus className="size-4" />
            Add Driver
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {driverProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No drivers registered yet. Click "Add Driver" to create one.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Max Capacity</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverProfiles.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span className="font-medium">{driver.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{driver.email}</div>
                    <div>{driver.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div>{VEHICLE_LABELS[driver.vehicleType] ?? driver.vehicleType}</div>
                        <div className="text-muted-foreground">{driver.vehiclePlate}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{driver.licenseNumber}</TableCell>
                  <TableCell className="text-sm">{driver.maxCapacityKg} kg</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {driver.workStartTime} &ndash; {driver.workEndTime}
                  </TableCell>
                  <TableCell>
                    <Badge variant={driver.isActive ? 'default' : 'secondary'}>
                      {driver.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/factory/drivers/${driver.id}/edit`)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {driver.name}? This will also deactivate their user account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteDriver(driver.id)}>
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
