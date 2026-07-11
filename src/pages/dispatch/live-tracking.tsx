import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useDriverStore } from '@/stores/driver-store.ts'
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Truck, Clock, MapPin } from 'lucide-react'

const activeIcon = L.divIcon({
  html: `<div style="background:#2563eb;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;">🚚</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const idleIcon = L.divIcon({
  html: `<div style="background:#6b7280;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;">🚚</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function MapUpdater() {
  const map = useMap()
  const { currentLocation } = useDriverStore()
  useEffect(() => {
    if (currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lng], map.getZoom())
    }
  }, [currentLocation, map])
  return null
}

export default function LiveTrackingPage() {
  const { currentLocation, tripStatus } = useDriverStore()
  const routes = useDeliveryStore((s) => s.routes)
  const stops = useDeliveryStore((s) => s.stops)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeRoutes = routes.filter((r) => r.status === 'active')
  const activeRouteStops = stops.filter((s) =>
    activeRoutes.some((r) => r.id === s.routeId),
  )
  const completedStops = activeRouteStops.filter((s) => s.status === 'completed').length

  useEffect(() => {
    if (tripStatus === 'in_transit') {
      intervalRef.current = setInterval(() => {
        const loc = useDriverStore.getState().currentLocation
        if (loc) {
          const jitter = 0.002
          const newLat = loc.lat + (Math.random() - 0.5) * jitter
          const newLng = loc.lng + (Math.random() - 0.5) * jitter
          useDriverStore.getState().updateLocation(
            loc.driverId,
            loc.driverName,
            newLat,
            newLng,
          )
        }
      }, 3000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [tripStatus])

  if (!currentLocation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Truck className="size-12 opacity-50" />
        <p className="text-lg font-medium">No active driver location</p>
        <p className="text-sm">
          Location data appears when a driver starts a trip.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Tracking</h2>
        <Badge
          variant={tripStatus === 'in_transit' ? 'default' : 'secondary'}
          className="gap-1"
        >
          <Clock className="size-3" />
          {tripStatus === 'in_transit' ? 'Live' : 'Idle'}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-[400px] w-full rounded-lg overflow-hidden">
            <MapContainer
              center={[currentLocation.lat, currentLocation.lng]}
              zoom={14}
              className="h-full w-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater />
              <Marker
                position={[currentLocation.lat, currentLocation.lng]}
                icon={tripStatus === 'in_transit' ? activeIcon : idleIcon}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">{currentLocation.driverName}</p>
                    <p className="text-muted-foreground">
                      {currentLocation.status === 'in_transit'
                        ? 'In Transit'
                        : 'Standing By'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated:{' '}
                      {new Date(currentLocation.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="size-4" />
            Trip Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Active Routes</p>
            <p className="text-lg font-semibold">{activeRoutes.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Stops</p>
            <p className="text-lg font-semibold">{activeRouteStops.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Completed</p>
            <p className="text-lg font-semibold">{completedStops}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
