import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useDriverStore } from '@/stores/driver-store.ts'
import { Button } from '@/components/ui/button.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { LogOut, User, Truck } from 'lucide-react'

export default function DriverProfile() {
  const { user, logout } = useAuthStore()
  const { tasks, tripStatus } = useDriverStore()
  const navigate = useNavigate()

  const completedTasks = tasks.filter((t) => t.status === 'completed').length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <User className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{user?.name}</CardTitle>
              <p className="text-xs text-muted-foreground">Driver</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span>{' '}
            {user?.email}
          </p>
          <p>
            <span className="text-muted-foreground">Status:</span>{' '}
            {tripStatus === 'idle' ? 'Standing By' : 'On Trip'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Truck className="size-4" />
            Trip Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Tasks</span>
            <span className="font-medium">{tasks.length}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed</span>
            <span className="font-medium">{completedTasks}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-medium">{tasks.length - completedTasks}</span>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        size="lg"
        className="h-14 text-base gap-2 mt-4"
        onClick={handleLogout}
      >
        <LogOut className="size-5" />
        Logout
      </Button>
    </div>
  )
}
