import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card.tsx'
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
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { useDriverManagementStore } from '@/stores/driver-management-store.ts'
import { AddStopDialog } from './add-stop-dialog.tsx'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Truck,
  MapPin,
  ArrowUpDown,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
} from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  completed: 'Completed',
  missed: 'Missed',
}

export default function RoutePlanningDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const routes = useDeliveryStore((s) => s.routes)
  const stops = useDeliveryStore((s) => s.stops)
  const transitionRouteStatus = useDeliveryStore((s) => s.transitionRouteStatus)
  const removeStop = useDeliveryStore((s) => s.removeStop)
  const missStop = useDeliveryStore((s) => s.missStop)
  const optimizeRoute = useDeliveryStore((s) => s.optimizeRoute)
  const deleteRoute = useDeliveryStore((s) => s.deleteRoute)
  const driverProfiles = useDriverManagementStore((s) => s.driverProfiles)

  const [addStopOpen, setAddStopOpen] = useState(false)

  const route = routes.find((r) => r.id === id)
  const routeStops = stops
    .filter((s) => s.routeId === id)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (!route) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Route not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/factory/dispatch/routes')}
        >
          Back to Routes
        </Button>
      </div>
    )
  }

  const r = route
  const driver = driverProfiles.find((d) => d.id === r.driverId)

  function handleMoveStop(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= routeStops.length) return
    const ids = routeStops.map((s) => s.id)
    ;[ids[index], ids[newIndex]] = [ids[newIndex], ids[index]]
    useDeliveryStore.getState().reorderStops(r.id, ids)
  }

  function handlePublish() {
    if (routeStops.length === 0) return
    transitionRouteStatus(r.id, 'active')
  }

  function handleComplete() {
    transitionRouteStatus(r.id, 'completed')
  }

  function handleCancel() {
    transitionRouteStatus(r.id, 'cancelled')
  }

  function handleDelete() {
    deleteRoute(r.id)
    navigate('/factory/dispatch/routes')
  }

  const completedStops = routeStops.filter((s) => s.status === 'completed').length

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/factory/dispatch/routes')}
        className="gap-1"
      >
        <ArrowLeft className="size-4" />
        Back to Routes
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <CardTitle>{r.name}</CardTitle>
                <Badge
                  variant={
                    r.status === 'active'
                      ? 'default'
                      : r.status === 'completed'
                        ? 'secondary'
                        : r.status === 'cancelled'
                          ? 'destructive'
                          : 'outline'
                  }
                  className="capitalize"
                >
                  {r.status}
                </Badge>
              </div>
              <CardDescription className="mt-1">{r.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => navigate(`/factory/dispatch/routes/${r.id}/load-sheet`)}
              >
                <FileText className="size-3.5" />
                Load Sheet
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => navigate(`/factory/dispatch/routes/${r.id}/edit`)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1">
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Route</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? This will remove all stops in this r.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label className="text-xs text-muted-foreground">Driver</Label>
              <div className="flex items-center gap-2 mt-1">
                <Truck className="size-4 text-muted-foreground" />
                <span>{r.driverName}</span>
              </div>
              {driver && (
                <p className="text-xs text-muted-foreground mt-1">
                  {driver.vehicleType} &middot; {driver.vehiclePlate}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <p className="text-sm mt-1">
                {r.scheduledDate
                  ? new Date(r.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not scheduled'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Progress</Label>
              <p className="text-sm mt-1">
                {completedStops} of {routeStops.length} stops completed
              </p>
              {routeStops.length > 0 && (
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{
                      width: `${(completedStops / routeStops.length) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Stops</CardTitle>
              <CardDescription>
                {routeStops.length} stop{routeStops.length !== 1 ? 's' : ''} in this route
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => optimizeRoute(r.id)}
                disabled={routeStops.length < 2}
              >
                <ArrowUpDown className="size-3.5" />
                Optimize
              </Button>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => setAddStopOpen(true)}
              >
                <Plus className="size-3.5" />
                Add Stop
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {routeStops.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <MapPin className="size-8 mx-auto mb-2 opacity-50" />
              <p>No stops yet. Add lots from the dispatch board or click "Add Stop".</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Time Window</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routeStops.map((stop, index) => (
                  <TableRow key={stop.id}>
                    <TableCell className="text-muted-foreground text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{stop.lotNumber}</TableCell>
                    <TableCell className="text-sm">{stop.customerName}</TableCell>
                    <TableCell className="text-sm">
                      {stop.timeWindowStart} &ndash; {stop.timeWindowEnd}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stop.priority <= 2 ? 'destructive' : 'secondary'}>
                        {stop.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          stop.status === 'completed'
                            ? 'default'
                            : stop.status === 'missed'
                              ? 'destructive'
                              : stop.status === 'in_transit'
                                ? 'secondary'
                                : 'outline'
                        }
                        className="capitalize"
                      >
                        {STATUS_LABELS[stop.status] ?? stop.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          disabled={index === 0}
                          onClick={() => handleMoveStop(index, 'up')}
                          title="Move up"
                        >
                          <ArrowUpDown className="size-3 rotate-90" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          disabled={index === routeStops.length - 1}
                          onClick={() => handleMoveStop(index, 'down')}
                          title="Move down"
                        >
                          <ArrowUpDown className="size-3 -rotate-90" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          onClick={() => removeStop(stop.id)}
                          title="Remove stop"
                        >
                          <XCircle className="size-3.5" />
                        </Button>
                        {stop.status !== 'completed' && stop.status !== 'missed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-orange-500"
                            onClick={() => missStop(stop.id)}
                            title="Mark missed"
                          >
                            <XCircle className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            navigate(
                              `/factory/dispatch/routes/${r.id}/timeline`,
                            )
                          }
                          title="Event timeline"
                        >
                          <FileText className="size-3" />
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

      {r.status === 'draft' && (
        <div className="flex gap-3">
          <Button
            className="gap-1"
            onClick={handlePublish}
            disabled={routeStops.length === 0}
          >
            <Play className="size-4" />
            Publish Route
          </Button>
          <Button
            variant="outline"
            className="gap-1"
            onClick={handleCancel}
          >
            <XCircle className="size-4" />
            Cancel Route
          </Button>
        </div>
      )}

      {r.status === 'active' && (
        <div className="flex gap-3">
          <Button className="gap-1" onClick={handleComplete}>
            <CheckCircle2 className="size-4" />
            Complete Route
          </Button>
          <Button
            variant="outline"
            className="gap-1"
            onClick={handleCancel}
          >
            <XCircle className="size-4" />
            Cancel Route
          </Button>
        </div>
      )}

      <AddStopDialog
        open={addStopOpen}
        onOpenChange={setAddStopOpen}
        selectedRouteId={r.id}
      />
    </div>
  )
}
