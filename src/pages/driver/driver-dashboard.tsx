import { useMemo } from 'react'
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
import {
  Scan,
  Truck,
  Warehouse,
  Route,
} from 'lucide-react'

export default function DriverDashboard() {
  const user = useAuthStore((s) => s.user)
  const { tasks, tripStatus, startTrip } = useDriverStore()
  const navigate = useNavigate()

  const pendingTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'delivered',
  )
  const nextTask = pendingTasks[0]

  const routeGroups = useMemo(() => {
    const groups = new Map<string, typeof tasks>()
    for (const task of pendingTasks) {
      const key = task.routeName ?? '__unassigned'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(task)
    }
    return groups
  }, [pendingTasks])

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

      {routeGroups.size > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Route className="size-4" />
              Today's Routes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from(routeGroups.entries()).map(([routeName, routeTasks]) => (
              <div key={routeName} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Route className="size-3.5 text-muted-foreground" />
                    {routeName === '__unassigned' ? 'Other Tasks' : routeName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {routeTasks.length} stop{routeTasks.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {routeTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                    >
                      <span>{t.clientName}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.scheduledTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {nextTask && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Next Task</CardTitle>
            {nextTask.routeName && (
              <Badge variant="secondary" className="text-xs w-fit">
                {nextTask.routeName}
              </Badge>
            )}
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
