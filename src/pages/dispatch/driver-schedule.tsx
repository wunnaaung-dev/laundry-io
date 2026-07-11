import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Input } from '@/components/ui/input.tsx'
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
import { useDriverManagementStore } from '@/stores/driver-management-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { Truck, Route, Eye, CalendarDays } from 'lucide-react'

export default function DriverSchedulePage() {
  const navigate = useNavigate()
  const routes = useDeliveryStore((s) => s.routes)
  const stops = useDeliveryStore((s) => s.stops)
  const orders = useOrderStore((s) => s.orders)
  const driverProfiles = useDriverManagementStore((s) => s.driverProfiles)

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )

  const routesOnDate = routes.filter((r) => {
    if (!r.scheduledDate) return false
    const routeDate = r.scheduledDate.split('T')[0]
    const match = routeDate === selectedDate
    if (!match && r.scheduleType === 'recurring_daily') return true
    if (r.scheduleType === 'recurring_weekly') {
      const dayOfWeek = new Date(selectedDate).getDay()
      if (r.recurringDays.includes(dayOfWeek)) return true
    }
    if (r.scheduleType === 'recurring_monthly') {
      const dayOfMonth = new Date(selectedDate).getDate()
      if (r.recurringDays.includes(dayOfMonth)) return true
    }
    return match
  })

  const driverRouteMap = new Map<string, typeof routesOnDate>()
  const unassignedRoutes: typeof routesOnDate = []

  for (const route of routesOnDate) {
    if (!route.driverId) {
      unassignedRoutes.push(route)
      continue
    }
    if (!driverRouteMap.has(route.driverId)) {
      driverRouteMap.set(route.driverId, [])
    }
    driverRouteMap.get(route.driverId)!.push(route)
  }

  function getRouteTotalWeight(routeId: string): number {
    return stops
      .filter((s) => s.routeId === routeId)
      .reduce((sum, s) => {
        const order = orders.find((o) => o.id === s.orderId)
        const lot = order?.lots.find((l) => l.id === s.lotId)
        return sum + (lot?.estimatedWeightKg ?? 0)
      }, 0)
  }

  function getRouteStopCount(routeId: string): number {
    return stops.filter((s) => s.routeId === routeId).length
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Driver Schedule</CardTitle>
              <CardDescription>
                View all driver assignments and routes for a given day
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-44"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {driverProfiles.length === 0 && routesOnDate.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No drivers or routes found for this date.
            </p>
          ) : (
            <div className="space-y-6">
              {driverProfiles
                .filter((d) => d.isActive)
                .map((driver) => {
                  const driverRoutes = driverRouteMap.get(driver.id) ?? []
                  const totalWeight = driverRoutes.reduce(
                    (s, r) => s + getRouteTotalWeight(r.id),
                    0,
                  )
                  const capacityPct = Math.min(
                    100,
                    (totalWeight / driver.maxCapacityKg) * 100,
                  )
                  const capacityColor =
                    capacityPct > 90
                      ? 'bg-destructive'
                      : capacityPct > 70
                        ? 'bg-amber-500'
                        : 'bg-primary'

                  return (
                    <Card key={driver.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                              <Truck className="size-5 text-muted-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {driver.name}
                              </CardTitle>
                              <CardDescription>
                                {driver.vehicleType} &middot;{' '}
                                {driver.vehiclePlate} &middot;{' '}
                                {driver.licenseNumber} &middot;{' '}
                                {driver.workStartTime}&ndash;{driver.workEndTime}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {driverRoutes.length} route
                              {driverRoutes.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {totalWeight.toFixed(0)} / {driver.maxCapacityKg} kg
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="w-full bg-muted rounded-full h-2 mb-4">
                          <div
                            className={`${capacityColor} rounded-full h-2 transition-all`}
                            style={{ width: `${capacityPct}%` }}
                          />
                        </div>

                        {driverRoutes.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No routes assigned.
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Route</TableHead>
                                <TableHead>Stops</TableHead>
                                <TableHead>Total Weight</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-10"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {driverRoutes.map((route) => (
                                <TableRow key={route.id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <Route className="size-3.5 text-muted-foreground" />
                                      {route.name}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {getRouteStopCount(route.id)}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {getRouteTotalWeight(route.id).toFixed(1)} kg
                                  </TableCell>
                                  <TableCell className="text-sm capitalize">
                                    {route.scheduleType.replace('_', ' ')}
                                  </TableCell>
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
                                      className="capitalize"
                                    >
                                      {route.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7"
                                      onClick={() =>
                                        navigate(
                                          `/factory/dispatch/routes/${route.id}`,
                                        )
                                      }
                                    >
                                      <Eye className="size-3.5" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}

              {unassignedRoutes.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-muted-foreground">
                      Unassigned Routes
                    </CardTitle>
                    <CardDescription>
                      {unassignedRoutes.length} route
                      {unassignedRoutes.length !== 1 ? 's' : ''} without a driver
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Route</TableHead>
                          <TableHead>Stops</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unassignedRoutes.map((route) => (
                          <TableRow key={route.id}>
                            <TableCell className="font-medium">{route.name}</TableCell>
                            <TableCell>{getRouteStopCount(route.id)}</TableCell>
                            <TableCell>{getRouteTotalWeight(route.id).toFixed(1)} kg</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {route.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() =>
                                  navigate(`/factory/dispatch/routes/${route.id}`)
                                }
                              >
                                <Eye className="size-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
