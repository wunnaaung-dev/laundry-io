import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { LayoutDashboard, ListChecks, Scan, User } from 'lucide-react'

const tabs = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/driver/dashboard' },
  { label: 'Tasks', icon: ListChecks, path: '/driver/tasks' },
  { label: 'Scan', icon: Scan, path: '/driver/scan' },
  { label: 'Profile', icon: User, path: '/driver/profile' },
]

export function DriverBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="flex items-center justify-around border-t bg-background px-2 py-1">
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path)
        return (
          <Button
            key={tab.path}
            variant={isActive ? 'default' : 'ghost'}
            size="lg"
            className="flex flex-col items-center gap-0.5 h-auto min-w-0 py-2 px-3 rounded-lg"
            onClick={() => navigate(tab.path)}
          >
            <tab.icon className="size-5" />
            <span className="text-[10px] leading-tight">{tab.label}</span>
          </Button>
        )
      })}
    </nav>
  )
}
