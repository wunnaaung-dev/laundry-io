import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useWarehouseStore } from '@/stores/warehouse-store.ts'
import {
  LayoutGrid,
  Package,
  Truck,
  Wrench,
  Undo2,
  ArrowLeftRight,
  Factory,
} from 'lucide-react'

const sectionLinks = [
  { title: 'Storage Map', url: '/factory/warehouse/storage', icon: LayoutGrid },
  { title: 'Inventory', url: '/factory/warehouse/inventory', icon: Package },
  { title: 'Receiving', url: '/factory/warehouse/receiving', icon: Truck },
  { title: 'Equipment', url: '/factory/warehouse/equipment', icon: Wrench },
  { title: 'Returns', url: '/factory/warehouse/returns', icon: Undo2 },
  { title: 'Transactions', url: '/factory/warehouse/transactions', icon: ArrowLeftRight },
  { title: 'Production', url: '/factory/warehouse/production', icon: Factory },
]

const FUNCTION_LABELS: Record<string, string> = {
  receiving: 'Receiving',
  storage: 'Storage',
  inventoryManagement: 'Inventory Management',
  production: 'Production',
  dispatch: 'Dispatch',
}

const ZONE_LABELS: Record<string, string> = {
  'consumable-chemical': 'Consumable & Chemical',
  'facilities-utilities': 'Facilities & Utilities',
  'linen-processing': 'Linen Processing',
  'packaging-shipping': 'Packaging & Shipping',
}

export default function WarehouseDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const warehouses = useWarehouseStore((s) => s.warehouses)
  const warehouse = warehouses.find((w) => w.id === id)

  if (!warehouse) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg text-muted-foreground">Warehouse not found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/factory/warehouse/manage')}
          >
            Back to Warehouses
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{warehouse.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {warehouse.warehouseCode}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/factory/warehouse/manage/${warehouse.id}/edit`)
                }
              >
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/factory/warehouse/manage')}
              >
                All Warehouses
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Site</p>
              <p className="text-sm font-medium">{warehouse.siteId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                variant={
                  warehouse.status === 'active'
                    ? 'default'
                    : warehouse.status === 'maintenance'
                      ? 'outline'
                      : 'secondary'
                }
              >
                {warehouse.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-medium">
                {warehouse.address.label
                  ? `${warehouse.address.label} — ${warehouse.address.address}`
                  : 'Not specified'}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-muted-foreground">Enabled Functions</p>
            <div className="flex flex-wrap gap-1">
              {warehouse.enabledFunctions.map((fn) => (
                <Badge key={fn} variant="secondary">
                  {FUNCTION_LABELS[fn] ?? fn}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-muted-foreground">Enabled Zones</p>
            <div className="flex flex-wrap gap-1">
              {warehouse.enabledZones.map((z) => (
                <Badge key={z} variant="outline">
                  {ZONE_LABELS[z] ?? z}
                </Badge>
              ))}
            </div>
          </div>

          {warehouse.notes && (
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{warehouse.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Sections</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sectionLinks.map((link) => {
            const Icon = link.icon
            return (
              <Card
                key={link.title}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => navigate(link.url)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{link.title}</span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
