import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'

const navItems = [
  { title: 'Dashboard', url: '/hotel/dashboard' },
  { title: 'My Profile', url: '/hotel/profile' },
  { title: 'Contracts', url: '/hotel/contracts' },
  { title: 'Orders', url: '/hotel/orders' },
  { title: 'Linen Tracking', url: '/hotel/linen-tracking' },
  { title: 'Invoices', url: '/hotel/invoices' },
  { title: 'Reports', url: '/hotel/reports' },
]

const adminItems = [
  { title: 'Role Levels', url: '/hotel/role-levels' },
  { title: 'Users', url: '/hotel/users' },
]

export function HotelSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-muted-foreground">Hotel</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>{item.title}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>{item.title}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
