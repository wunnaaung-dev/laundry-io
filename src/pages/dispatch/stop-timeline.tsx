import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDeliveryEventStore } from '@/stores/delivery-event-store.ts'
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { ArrowLeft, Clock, Scan, Camera, Pen, MapPin, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const eventIcons: Record<string, React.ReactNode> = {
  scan: <Scan className="size-4" />,
  load_validation: <Scan className="size-4" />,
  arrival: <MapPin className="size-4" />,
  departure: <MapPin className="size-4" />,
  signature: <Pen className="size-4" />,
  photo: <Camera className="size-4" />,
  note: <AlertCircle className="size-4" />,
}

const eventColors: Record<string, string> = {
  scan: 'bg-blue-100 text-blue-700',
  load_validation: 'bg-green-100 text-green-700',
  arrival: 'bg-yellow-100 text-yellow-700',
  departure: 'bg-green-100 text-green-700',
  signature: 'bg-purple-100 text-purple-700',
  photo: 'bg-pink-100 text-pink-700',
  note: 'bg-gray-100 text-gray-700',
}

export default function StopTimelinePage() {
  const navigate = useNavigate()
  const { routeId } = useParams()
  const events = useDeliveryEventStore((s) => s.events)
  const routes = useDeliveryStore((s) => s.routes)
  const allStops = useDeliveryStore((s) => s.stops)
  const [expandedStop, setExpandedStop] = useState<string | null>(null)

  const route = routes.find((r) => r.id === routeId)
  const routeStops = allStops
    .filter((s) => s.routeId === routeId)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (!route) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Route not found.</p>
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

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/factory/dispatch/routes/${routeId}`)}
        className="gap-1"
      >
        <ArrowLeft className="size-4" />
        Back to {route.name}
      </Button>

      <div>
        <h2 className="text-lg font-semibold">Event Timeline</h2>
        <p className="text-sm text-muted-foreground">
          {route.name} &middot; {routeStops.length} stops
        </p>
      </div>

      {routeStops.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-sm text-muted-foreground">
            No stops to display.
          </CardContent>
        </Card>
      ) : (
        routeStops.map((stop) => {
          const stopEvents = events.filter((e) => e.stopId === stop.id)
          const isExpanded = expandedStop === stop.id

          return (
            <Card key={stop.id}>
              <CardHeader
                className="cursor-pointer pb-2"
                onClick={() =>
                  setExpandedStop(isExpanded ? null : stop.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">
                      {stop.customerName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Lot {stop.lotNumber} &middot; {stop.timeWindowStart}-
                      {stop.timeWindowEnd}
                    </p>
                  </div>
                  <Badge
                    variant={
                      stop.status === 'completed'
                        ? 'default'
                        : stop.status === 'missed'
                          ? 'destructive'
                          : 'outline'
                    }
                    className="capitalize text-xs"
                  >
                    {stop.status}
                  </Badge>
                </div>
                {stopEvents.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stopEvents.length} event{stopEvents.length !== 1 ? 's' : ''}
                  </p>
                )}
              </CardHeader>
              {isExpanded && (
                <CardContent>
                  {stopEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No events logged for this stop yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stopEvents.map((event, idx) => (
                        <div key={event.id}>
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex size-7 items-center justify-center rounded-full shrink-0 ${
                                eventColors[event.eventType] ??
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {eventIcons[event.eventType] ?? (
                                <Clock className="size-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium capitalize">
                                  {event.eventType.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    event.timestamp,
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                              {(event.cartCount ?? 0) > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Carts: {event.cartCount}
                                  {event.weightKg
                                    ? ` | Weight: ${event.weightKg} kg`
                                    : ''}
                                </p>
                              )}
                              {event.photoUrl && (
                                <img
                                  src={event.photoUrl}
                                  alt="Delivery photo"
                                  className="mt-2 max-h-32 rounded border object-cover"
                                />
                              )}
                              <p className="text-xs text-muted-foreground mt-0.5">
                                by {event.userName}
                              </p>
                            </div>
                          </div>
                          {idx < stopEvents.length - 1 && (
                            <Separator className="my-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}
