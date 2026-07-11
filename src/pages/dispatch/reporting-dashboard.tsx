import { useMemo } from 'react'
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { useDriverStore } from '@/stores/driver-store.ts'
import { useDeliveryEventStore } from '@/stores/delivery-event-store.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  BarChart,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  Route,
} from 'lucide-react'

export default function ReportingDashboardPage() {
  const routes = useDeliveryStore((s) => s.routes)
  const stops = useDeliveryStore((s) => s.stops)
  const scanHistory = useDriverStore((s) => s.scanHistory)
  const events = useDeliveryEventStore((s) => s.events)

  const metrics = useMemo(() => {
    const totalRoutes = routes.length
    const completedRoutes = routes.filter(
      (r) => r.status === 'completed',
    ).length
    const activeRoutes = routes.filter((r) => r.status === 'active').length
    const cancelledRoutes = routes.filter(
      (r) => r.status === 'cancelled',
    ).length
    const routeCompletionRate =
      totalRoutes > 0
        ? Math.round((completedRoutes / totalRoutes) * 100)
        : 0

    const totalStops = stops.length
    const completedStops = stops.filter(
      (s) => s.status === 'completed',
    ).length
    const missedStops = stops.filter((s) => s.status === 'missed').length
    const stopCompletionRate =
      totalStops > 0
        ? Math.round((completedStops / totalStops) * 100)
        : 0

    const totalScans = scanHistory.length
    const successfulScans = scanHistory.filter((s) => s.success).length
    const scanAccuracy =
      totalScans > 0
        ? Math.round((successfulScans / totalScans) * 100)
        : 0

    const routeDeliveryTimes = routes
      .filter((r) => r.status === 'completed')
      .map((r) => {
        const firstEvent = events
          .filter((e) => e.routeId === r.id)
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() -
              new Date(b.timestamp).getTime(),
          )
        const lastEvent = events
          .filter((e) => e.routeId === r.id)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() -
              new Date(a.timestamp).getTime(),
          )
        if (firstEvent.length === 0 || lastEvent.length === 0) return null
        const durationMs =
          new Date(lastEvent[0].timestamp).getTime() -
          new Date(firstEvent[0].timestamp).getTime()
        return durationMs > 0 ? durationMs : null
      })
      .filter((d): d is number => d !== null)

    const avgDeliveryTimeMinutes =
      routeDeliveryTimes.length > 0
        ? Math.round(
            routeDeliveryTimes.reduce((a, b) => a + b, 0) /
              routeDeliveryTimes.length /
              60000,
          )
        : 0

    return {
      totalRoutes,
      completedRoutes,
      activeRoutes,
      cancelledRoutes,
      routeCompletionRate,
      totalStops,
      completedStops,
      missedStops,
      stopCompletionRate,
      totalScans,
      successfulScans,
      scanAccuracy,
      avgDeliveryTimeMinutes,
    }
  }, [routes, stops, scanHistory, events])

  const driverMetrics = useMemo(() => {
    const driverMap = new Map<
      string,
      {
        driverName: string
        totalRoutes: number
        totalStops: number
        completedStops: number
        missedStops: number
      }
    >()

    for (const route of routes) {
      const existing = driverMap.get(route.driverId) ?? {
        driverName: route.driverName,
        totalRoutes: 0,
        totalStops: 0,
        completedStops: 0,
        missedStops: 0,
      }
      existing.totalRoutes++
      driverMap.set(route.driverId, existing)
    }

    for (const stop of stops) {
      const route = routes.find((r) => r.id === stop.routeId)
      if (!route) continue
      const existing = driverMap.get(route.driverId)
      if (!existing) continue
      existing.totalStops++
      if (stop.status === 'completed') existing.completedStops++
      if (stop.status === 'missed') existing.missedStops++
    }

    return Array.from(driverMap.values())
  }, [routes, stops])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart className="size-5" />
        <h2 className="text-lg font-semibold">Delivery Reporting & Analytics</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Route Completion
            </CardTitle>
            <Route className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.routeCompletionRate}%</p>
            <p className="text-xs text-muted-foreground">
              {metrics.completedRoutes} of {metrics.totalRoutes} routes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Stop Completion
            </CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.stopCompletionRate}%</p>
            <p className="text-xs text-muted-foreground">
              {metrics.completedStops} of {metrics.totalStops} stops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Scan Accuracy
            </CardTitle>
            <Percent className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.scanAccuracy}%</p>
            <p className="text-xs text-muted-foreground">
              {metrics.successfulScans} of {metrics.totalScans} scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Delivery Time
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {metrics.avgDeliveryTimeMinutes}m
            </p>
            <p className="text-xs text-muted-foreground">
              Per completed route
            </p>
          </CardContent>
        </Card>
      </div>

      {metrics.missedStops > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <XCircle className="size-4 text-destructive" />
            <CardTitle className="text-sm font-medium">
              Missed Stops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {metrics.missedStops}
            </p>
            <p className="text-xs text-muted-foreground">
              Require rescheduling
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="size-4" />
            Driver Performance KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {driverMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No driver data yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Routes</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Missed</TableHead>
                  <TableHead>Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverMetrics.map((dm) => {
                  const rate =
                    dm.totalStops > 0
                      ? Math.round(
                          (dm.completedStops / dm.totalStops) * 100,
                        )
                      : 0
                  return (
                    <TableRow key={dm.driverName}>
                      <TableCell className="font-medium">
                        {dm.driverName}
                      </TableCell>
                      <TableCell>{dm.totalRoutes}</TableCell>
                      <TableCell>{dm.totalStops}</TableCell>
                      <TableCell>
                        <span className="text-green-600">
                          {dm.completedStops}
                        </span>
                      </TableCell>
                      <TableCell>
                        {dm.missedStops > 0 ? (
                          <span className="text-destructive">
                            {dm.missedStops}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rate >= 90
                              ? 'default'
                              : rate >= 70
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
