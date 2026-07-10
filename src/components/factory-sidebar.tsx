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
  { title: 'Dashboard', url: '/factory/dashboard' },
  { title: 'Customers', url: '/factory/customers' },
  { title: 'Pricing Templates', url: '/factory/pricing-templates' },
  { title: 'Contracts', url: '/factory/contracts' },
  { title: 'Orders', url: '/factory/orders' },
  { title: 'Linen Tracking', url: '/factory/linen-tracking' },
  { title: 'Warehouse', url: '/factory/warehouse' },
  { title: 'Storage', url: '/factory/warehouse/storage' },
  { title: 'Stock Reports', url: '/factory/warehouse/transactions' },
  { title: 'Production', url: '/factory/warehouse/production' },
  { title: 'Dispatch', url: '/factory/dispatch' },
  { title: 'QC & Inspection', url: '/factory/qc-inspection' },
  { title: 'Asset Management', url: '/factory/assets' },
  { title: 'Purchasing', url: '/factory/purchasing' },
]

const adminItems = [
  { title: 'Role Levels', url: '/factory/role-levels' },
  { title: 'Users', url: '/factory/users' },
]

export function FactorySidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-muted-foreground">Factory</p>
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
