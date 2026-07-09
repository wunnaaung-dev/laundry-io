import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useDriverStore } from '@/stores/driver-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { Button } from '@/components/ui/button.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Scan, Truck, MapPin, Warehouse } from 'lucide-react'

export default function DriverDashboard() {
  const user = useAuthStore((s) => s.user)
  const { tasks, tripStatus, startTrip } = useDriverStore()
  const navigate = useNavigate()

  const pendingTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'delivered',
  )
  const nextTask = pendingTasks[0]

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Welcome, {user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {pendingTasks.length} pending{' '}
              {pendingTasks.length === 1 ? 'task' : 'tasks'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {tasks.length} total
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="size-4" />
            Route Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
            Map placeholder
          </div>
        </CardContent>
      </Card>

      {nextTask && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Next Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{nextTask.clientName}</p>
            <p className="text-muted-foreground">{nextTask.lotDescription}</p>
            <p className="text-muted-foreground">{nextTask.scheduledTime}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 mt-2">
        <Button
          size="lg"
          className="h-14 text-base gap-2"
          onClick={() => navigate('/driver/scan')}
        >
          <Scan className="size-5" />
          Scan QR / Barcode
        </Button>

        {tripStatus === 'idle' ? (
          <Button
            size="lg"
            variant="secondary"
            className="h-14 text-base gap-2"
            onClick={() => startTrip(`trip-${Date.now()}`)}
          >
            <Truck className="size-5" />
            Start Trip
          </Button>
        ) : tripStatus === 'in_transit' ? (
          <Button
            size="lg"
            variant="secondary"
            className="h-14 text-base gap-2"
            onClick={() => {
              const { transitionOrder } = useOrderStore.getState()
              const completedTasks = tasks.filter(
                (t) => t.status === 'completed',
              )
              completedTasks.forEach((t) => {
                transitionOrder(t.orderId, 'delivered')
              })
            }}
          >
            <Warehouse className="size-5" />
            Unload at Factory
          </Button>
        ) : null}
      </div>
    </div>
  )
}
