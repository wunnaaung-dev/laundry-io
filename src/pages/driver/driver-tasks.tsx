import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Scan, ArrowRight, Warehouse, Route, ArrowLeftRight } from 'lucide-react'
import type { DriverTask } from '@/stores/driver-store.ts'

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'outline',
  mismatch: 'destructive',
  delivered: 'default',
}

function TaskActions({ task }: { task: DriverTask }) {
  const navigate = useNavigate()
  const updateTaskStatus = useDriverStore((s) => s.updateTaskStatus)

  return (
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        variant="outline"
        className="gap-1"
        onClick={() => navigate(`/driver/scan/${task.id}`)}
      >
        <Scan className="size-3.5" />
        Scan
      </Button>
      {task.type === 'delivery' && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => navigate(`/driver/delivery-proof/${task.id}`)}
        >
          <ArrowRight className="size-3.5" />
          POD
        </Button>
      )}
      {task.status === 'completed' && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => {
            useOrderStore.getState().transitionOrder(task.orderId, 'delivered')
            updateTaskStatus(task.id, 'delivered')
          }}
        >
          <Warehouse className="size-3.5" />
          Unload at Factory
        </Button>
      )}
    </div>
  )
}

function TaskCard({ task }: { task: DriverTask }) {
  return (
    <Card className="border-l-4 border-l-primary mb-2">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm">{task.clientName}</CardTitle>
          <Badge variant={statusColor[task.status]}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {task.lotDescription}
        </p>
        <p className="text-xs text-muted-foreground">
          {task.scheduledTime} &middot; {task.type}
        </p>
        <TaskActions task={task} />
      </CardContent>
    </Card>
  )
}

function PairedStopCard({ deliveryTask, pickupTask }: { deliveryTask: DriverTask; pickupTask: DriverTask }) {
  const navigate = useNavigate()
  const updateTaskStatus = useDriverStore((s) => s.updateTaskStatus)

  return (
    <Card className="border-l-4 border-l-amber-500 mb-2">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">{deliveryTask.clientName}</CardTitle>
            <Badge variant="outline" className="text-xs gap-1">
              <ArrowLeftRight className="size-3" />
              Round Trip
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={statusColor[deliveryTask.status]}>
              {deliveryTask.type}
            </Badge>
            <Badge variant={statusColor[pickupTask.status]}>
              {pickupTask.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-green-700">Deliver Clean</span>
            <Badge variant={statusColor[deliveryTask.status]}>
              {deliveryTask.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {deliveryTask.lotDescription}
          </p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/driver/scan/${deliveryTask.id}`)}>
              <Scan className="size-3.5" />
              Scan
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/driver/delivery-proof/${deliveryTask.id}`)}>
              <ArrowRight className="size-3.5" />
              POD
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-blue-700">Pick Up Used</span>
            <Badge variant={statusColor[pickupTask.status]}>
              {pickupTask.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {pickupTask.lotDescription}
          </p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/driver/scan/${pickupTask.id}`)}>
              <Scan className="size-3.5" />
              Scan
            </Button>
            {pickupTask.status === 'completed' && (
              <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                useOrderStore.getState().transitionOrder(pickupTask.orderId, 'delivered')
                updateTaskStatus(pickupTask.id, 'delivered')
              }}>
                <Warehouse className="size-3.5" />
                Unload at Factory
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {deliveryTask.scheduledTime}
        </p>
      </CardContent>
    </Card>
  )
}

export default function DriverTasks() {
  const { tasks } = useDriverStore()

  const grouped = useMemo(() => {
    const paired = new Set<string>()
    const singles: DriverTask[] = []

    for (const task of tasks) {
      if (task.pairedTaskId) {
        paired.add(task.id)
        paired.add(task.pairedTaskId)
      }
    }

    for (const task of tasks) {
      if (!paired.has(task.id)) {
        singles.push(task)
      }
    }

    const pairGroups: Array<[DriverTask, DriverTask]> = []
    const seen = new Set<string>()
    for (const task of tasks) {
      if (task.pairedTaskId && !seen.has(task.id)) {
        const mate = tasks.find((t) => t.id === task.pairedTaskId)
        if (mate) {
          const [delivery, pickup] = task.type === 'delivery' ? [task, mate] : [mate, task]
          pairGroups.push([delivery, pickup])
          seen.add(task.id)
          seen.add(mate.id)
        }
      }
    }

    const routeGroups = new Map<string, { pairs: Array<[DriverTask, DriverTask]>; singles: DriverTask[] }>()

    for (const singleton of singles) {
      const key = singleton.routeName ?? '__unassigned'
      if (!routeGroups.has(key)) routeGroups.set(key, { pairs: [], singles: [] })
      routeGroups.get(key)!.singles.push(singleton)
    }

    for (const [delivery, pickup] of pairGroups) {
      const key = delivery.routeName ?? '__unassigned'
      if (!routeGroups.has(key)) routeGroups.set(key, { pairs: [], singles: [] })
      routeGroups.get(key)!.pairs.push([delivery, pickup])
    }

    return routeGroups
  }, [tasks])

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-semibold">Today's Tasks</h2>

      {tasks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No tasks assigned for today.
        </p>
      )}

      {Array.from(grouped.entries()).map(([routeName, { pairs, singles }]) => (
        <div key={routeName}>
          <div className="flex items-center gap-2 mb-2 mt-1">
            <Route className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">
              {routeName === '__unassigned' ? 'Other Tasks' : routeName}
            </h3>
            <Badge variant="outline" className="text-xs">
              {singles.length + pairs.length}
            </Badge>
          </div>

          {pairs.map(([delivery, pickup]) => (
            <PairedStopCard key={delivery.id} deliveryTask={delivery} pickupTask={pickup} />
          ))}

          {singles.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ))}
    </div>
  )
}
