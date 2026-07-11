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
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { Plus, Pencil, Trash2, Eye, Truck, Route } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const SCHEDULE_LABELS: Record<string, string> = {
  one_time: 'One-Time',
  recurring_daily: 'Daily',
  recurring_weekly: 'Weekly',
  recurring_monthly: 'Monthly',
}

export default function RoutePlanningListPage() {
  const navigate = useNavigate()
  const routes = useDeliveryStore((s) => s.routes)
  const stops = useDeliveryStore((s) => s.stops)
  const deleteRoute = useDeliveryStore((s) => s.deleteRoute)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Route Planning</CardTitle>
            <CardDescription>
              Create and manage delivery routes for drivers
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/factory/dispatch/routes/new')} className="gap-1">
            <Plus className="size-4" />
            Create Route
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {routes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No routes yet. Click "Create Route" to start planning deliveries.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => {
                const stopCount = stops.filter((s) => s.routeId === route.id).length
                return (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Route className="size-4 text-muted-foreground" />
                        <span className="font-medium">{route.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Truck className="size-3.5 text-muted-foreground" />
                        {route.driverName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {route.scheduledDate ? new Date(route.scheduledDate).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {SCHEDULE_LABELS[route.scheduleType] ?? route.scheduleType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{stopCount} stop{stopCount !== 1 ? 's' : ''}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          route.status === 'active'
                            ? 'default'
                            : route.status === 'completed'
                              ? 'secondary'
                              : route.status === 'cancelled'
                                ? 'destructive'
                                : 'outline'
                        }
                      >
                        {STATUS_LABELS[route.status] ?? route.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/factory/dispatch/routes/${route.id}`)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/factory/dispatch/routes/${route.id}/edit`)}
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
                              <AlertDialogTitle>Delete Route</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{route.name}"? This will also remove all stops in this route.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRoute(route.id)}>
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
