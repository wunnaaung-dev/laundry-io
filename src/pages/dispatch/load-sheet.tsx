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
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { useDriverManagementStore } from '@/stores/driver-management-store.ts'
import {
  ArrowLeft,
  Printer,
  Truck,
  Package,
  Weight,
  MapPin,
  Clock,
} from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  completed: 'Completed',
  missed: 'Missed',
}

export default function LoadSheetPage() {
  const navigate = useNavigate()
  const { routeId } = useParams()

  const routes = useDeliveryStore((s) => s.routes)
  const stops = useDeliveryStore((s) => s.stops)
  const orders = useOrderStore((s) => s.orders)
  const driverProfiles = useDriverManagementStore((s) => s.driverProfiles)

  const route = routes.find((r) => r.id === routeId)
  if (!route) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Route not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/factory/dispatch/routes')}>
          Back to Routes
        </Button>
      </div>
    )
  }

  const routeStops = stops
    .filter((s) => s.routeId === routeId)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const orderMap = new Map(orders.map((o) => [o.id, o]))

  const enrichedStops = routeStops.map((stop) => {
    const order = orderMap.get(stop.orderId)
    const lot = order?.lots.find((l) => l.id === stop.lotId)
    return { stop, order, lot }
  })

  const totalQty = enrichedStops.reduce((s, e) => s + (e.lot?.quantity ?? 0), 0)
  const totalWeight = enrichedStops.reduce((s, e) => s + (e.lot?.estimatedWeightKg ?? 0), 0)

  const customerGroups = new Map<string, typeof enrichedStops>()
  for (const es of enrichedStops) {
    const key = es.stop.customerId
    if (!customerGroups.has(key)) customerGroups.set(key, [])
    customerGroups.get(key)!.push(es)
  }

  const driver = driverProfiles.find((d) => d.id === route.driverId)

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/factory/dispatch/routes/${routeId}`)}
          className="gap-1"
        >
          <ArrowLeft className="size-4" />
          Back to Route
        </Button>
        <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}>
          <Printer className="size-4" />
          Print
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Load Sheet — {route.name}</CardTitle>
              <CardDescription>Delivery manifest and packing report</CardDescription>
            </div>
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
              className="capitalize"
            >
              {route.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <Label className="text-xs text-muted-foreground">Driver</Label>
              <div className="flex items-center gap-2 mt-1">
                <Truck className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{route.driverName}</span>
              </div>
              {driver && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {driver.vehiclePlate} &middot; {driver.vehicleType}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <p className="text-sm mt-1">
                {route.scheduledDate
                  ? new Date(route.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Schedule</Label>
              <p className="text-sm mt-1 capitalize">
                {route.scheduleType.replace('_', ' ')}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Vehicle</Label>
              <p className="text-sm mt-1">{route.vehicleInfo || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-muted/50">
              <CardContent className="flex items-center gap-3 py-3">
                <Package className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{enrichedStops.length}</p>
                  <p className="text-xs text-muted-foreground">Total Stops</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="flex items-center gap-3 py-3">
                <Package className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{totalQty.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="flex items-center gap-3 py-3">
                <Weight className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{totalWeight.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Total Weight (kg)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {enrichedStops.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No stops on this route.
            </p>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold mb-3">All Stops</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Lot #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead>Time Window</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedStops.map(({ stop, lot }, index) => (
                      <TableRow key={stop.id}>
                        <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{stop.lotNumber}</TableCell>
                        <TableCell className="text-sm">{stop.customerName}</TableCell>
                        <TableCell className="text-sm capitalize">{lot?.category ?? '—'}</TableCell>
                        <TableCell className="text-right text-sm">{lot?.quantity ?? 0} pcs</TableCell>
                        <TableCell className="text-right text-sm">{lot?.estimatedWeightKg ?? 0} kg</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3 text-muted-foreground" />
                            {stop.timeWindowStart} &ndash; {stop.timeWindowEnd}
                          </div>
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
                            className="capitalize text-xs"
                          >
                            {STATUS_LABELS[stop.status] ?? stop.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold mb-4">
                  Per-Customer Packing Report
                </h3>
                {Array.from(customerGroups.entries()).map(([customerId, entries]) => {
                  const custQty = entries.reduce((s, e) => s + (e.lot?.quantity ?? 0), 0)
                  const custWeight = entries.reduce((s, e) => s + (e.lot?.estimatedWeightKg ?? 0), 0)
                  return (
                    <Card key={customerId} className="mb-4">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-muted-foreground" />
                            <CardTitle className="text-sm">
                              {entries[0].stop.customerName}
                            </CardTitle>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {custQty} pcs &middot; {custWeight.toFixed(1)} kg
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Lot #</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">Weight</TableHead>
                              <TableHead>Time Window</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entries.map(({ stop, lot }) => (
                              <TableRow key={stop.id}>
                                <TableCell className="font-mono text-xs">{stop.lotNumber}</TableCell>
                                <TableCell className="text-sm capitalize">{lot?.category ?? '—'}</TableCell>
                                <TableCell className="text-right text-sm">{lot?.quantity ?? 0}</TableCell>
                                <TableCell className="text-right text-sm">{lot?.estimatedWeightKg ?? 0} kg</TableCell>
                                <TableCell className="text-sm">
                                  {stop.timeWindowStart} &ndash; {stop.timeWindowEnd}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
