import { useMemo } from 'react'
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { useDriverStore } from '@/stores/driver-store.ts'
import { useDriverManagementStore } from '@/stores/driver-management-store.ts'
import { useDeliveryEventStore } from '@/stores/delivery-event-store.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { ArrowLeft, Trophy, Truck, Target, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'

export default function DriverKPIPage() {
  const navigate = useNavigate()
  const routes = useDeliveryStore((s) => s.routes)
  const stops = useDeliveryStore((s) => s.stops)
  const scanHistory = useDriverStore((s) => s.scanHistory)
  const events = useDeliveryEventStore((s) => s.events)
  const driverProfiles = useDriverManagementStore((s) => s.driverProfiles)

  const driverKpis = useMemo(() => {
    return driverProfiles.map((driver) => {
      const driverRoutes = routes.filter(
        (r) => r.driverId === driver.id,
      )
      const activeRouteIds = new Set(
        driverRoutes.map((r) => r.id),
      )
      const driverStops = stops.filter((s) =>
        activeRouteIds.has(s.routeId),
      )

      const completedStops = driverStops.filter(
        (s) => s.status === 'completed',
      ).length
      const missedStops = driverStops.filter(
        (s) => s.status === 'missed',
      ).length
      const totalStops = driverStops.length

      const completedRoutes = driverRoutes.filter(
        (r) => r.status === 'completed',
      ).length
      const totalRoutes = driverRoutes.length

      const completionRate =
        totalStops > 0
          ? Math.round((completedStops / totalStops) * 100)
          : 0

      const driverEvents = events.filter((e) =>
        driverStops.some((s) => s.id === e.stopId),
      )
      const totalScanAttempts = scanHistory.length
      const successfulScanAttempts = scanHistory.filter(
        (s) => s.success,
      ).length
      const scanAccuracy =
        totalScanAttempts > 0
          ? Math.round((successfulScanAttempts / totalScanAttempts) * 100)
          : 0

      const avgTimePerStop =
        completedStops > 0
          ? Math.round(driverEvents.length / completedStops)
          : 0

      return {
        driverId: driver.id,
        driverName: driver.name,
        vehicleInfo: `${driver.vehicleType} · ${driver.vehiclePlate}`,
        totalRoutes,
        completedRoutes,
        totalStops,
        completedStops,
        missedStops,
        completionRate,
        scanAccuracy,
        avgTimePerStop,
        isActive: driver.isActive,
      }
    })
  }, [driverProfiles, routes, stops, scanHistory, events])

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/factory/dispatch')}
        className="gap-1"
      >
        <ArrowLeft className="size-4" />
        Back to Dispatch
      </Button>

      <div className="flex items-center gap-2">
        <Trophy className="size-5" />
        <h2 className="text-lg font-semibold">Driver KPIs</h2>
      </div>

      {driverKpis.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Truck className="size-12 mx-auto mb-3 opacity-50" />
            <p>No driver data available.</p>
          </CardContent>
        </Card>
      ) : (
        driverKpis.map((kpi) => (
          <Card
            key={kpi.driverId}
            className={!kpi.isActive ? 'opacity-60' : ''}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{kpi.driverName}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {kpi.vehicleInfo}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    kpi.completionRate >= 90
                      ? 'default'
                      : kpi.completionRate >= 70
                        ? 'secondary'
                        : 'destructive'
                  }
                  className="text-sm px-3 py-1"
                >
                  {kpi.completionRate}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="size-3" />
                    Routes
                  </p>
                  <p className="text-lg font-semibold">
                    {kpi.completedRoutes}/{kpi.totalRoutes}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Stops Completed
                  </p>
                  <p className="text-lg font-semibold">{kpi.completedStops}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    Missed
                  </p>
                  <p className="text-lg font-semibold text-destructive">
                    {kpi.missedStops}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="size-3" />
                    Scan Accuracy
                  </p>
                  <p className="text-lg font-semibold">{kpi.scanAccuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
