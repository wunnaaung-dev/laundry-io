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
import { Scan, ArrowRight, Warehouse } from 'lucide-react'

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'outline',
  mismatch: 'destructive',
  delivered: 'default',
}

export default function DriverTasks() {
  const { tasks, updateTaskStatus } = useDriverStore()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-semibold">Today's Tasks</h2>

      {tasks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No tasks assigned for today.
        </p>
      )}

      {tasks.map((task) => (
        <Card key={task.id} className="border-l-4 border-l-primary">
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
                  onClick={() =>
                    navigate(`/driver/delivery-proof/${task.id}`)
                  }
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
                    useOrderStore
                      .getState()
                      .transitionOrder(task.orderId, 'delivered')
                    updateTaskStatus(task.id, 'delivered')
                  }}
                >
                  <Warehouse className="size-3.5" />
                  Unload at Factory
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
