import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useRoleStore } from '@/stores/role-store.ts'
import { PermissionGrid } from '@/components/permission-grid.tsx'
import type { ResourceModule, AccessLevel, Scope } from '@/types/auth.ts'
import type { RoleLevel } from '@/types/auth.ts'

const ALL_MODULES: ResourceModule[] = [
  'customer_profile',
  'contract_sla',
  'pricing',
  'order_management',
  'linen_tracking',
  'workflow_sop',
  'warehouse',
  'asset_management',
  'purchasing',
  'dispatch_delivery',
  'ai_analytics',
  'notification',
  'billing_cashflow',
  'access_control',
  'reports',
]

function emptyPermissions(): Record<ResourceModule, AccessLevel> {
  return Object.fromEntries(ALL_MODULES.map((m) => [m, 'none' as AccessLevel])) as Record<ResourceModule, AccessLevel>
}

export default function RoleLevelFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const user = useAuthStore((s) => s.user)
  const roleLevels = useRoleStore((s) => s.roleLevels)
  const createRoleLevel = useRoleStore((s) => s.createRoleLevel)
  const updateRoleLevel = useRoleStore((s) => s.updateRoleLevel)

  const isHotelSide = user?.role === 'hotel_super_admin'
  const existing: RoleLevel | undefined = isEdit
    ? roleLevels.find((r) => r.id === id)
    : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [scope, setScope] = useState<Scope>(existing?.scope ?? (isHotelSide ? 'hotel' : 'factory'))
  const [permissions, setPermissions] = useState<Record<ResourceModule, AccessLevel>>(
    existing?.permissions ?? emptyPermissions(),
  )
  const [error, setError] = useState('')

  if (isEdit && !existing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Level Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The role level you're trying to edit doesn't exist.
          </p>
          <Button onClick={() => navigate('/factory/role-levels')}>
            Back to Role Levels
          </Button>
        </CardContent>
      </Card>
    )
  }

  function handlePermissionChange(mod: ResourceModule, level: AccessLevel) {
    setPermissions((prev) => ({ ...prev, [mod]: level }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (isEdit && existing) {
      updateRoleLevel(existing.id, { name: name.trim(), description: description.trim(), permissions })
    } else {
      createRoleLevel({ name: name.trim(), description: description.trim(), scope, permissions })
    }

    navigate('/factory/role-levels')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Role Level' : 'Create Role Level'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hotel Manager"
              />
            </div>

            {!isHotelSide && !isEdit && (
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select
                  value={scope}
                  onValueChange={(v) => setScope(v as Scope)}
                >
                  <SelectTrigger id="scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="factory">Factory</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isEdit && (
              <div className="space-y-2">
                <Label>Scope</Label>
                <p className="text-sm text-muted-foreground pt-2 capitalize">{existing?.scope}</p>
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this role level"
                rows={2}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Module Permissions</h3>
            <PermissionGrid
              permissions={permissions}
              onChange={handlePermissionChange}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit">{isEdit ? 'Save Changes' : 'Create Role Level'}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/factory/role-levels')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
