import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useRoleStore } from '@/stores/role-store.ts'
import { RoleLevelSelect } from '@/components/role-level-select.tsx'
import {
  UserTypeSelector,
  type UserTypeOption,
} from '@/components/user-type-selector.tsx'
import type { UserRole } from '@/types/auth.ts'
import type { StoredUser } from '@/types/auth.ts'

const TYPE_TO_SCOPE: Record<UserTypeOption, 'hotel' | 'factory' | 'driver'> = {
  factory: 'factory',
  client: 'hotel',
  driver: 'driver',
}

const TYPE_TO_ROLE: Record<UserTypeOption, UserRole> = {
  factory: 'factory_super_admin',
  client: 'hotel_super_admin',
  driver: 'driver',
}

export default function UserFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const user = useAuthStore((s) => s.user)
  const roleLevels = useRoleStore((s) => s.roleLevels)
  const users = useRoleStore((s) => s.users)
  const createUser = useRoleStore((s) => s.createUser)
  const updateUser = useRoleStore((s) => s.updateUser)

  const isHotelSide = user?.role === 'hotel_super_admin'
  const existingUser: StoredUser | undefined = isEdit
    ? users.find((u) => u.id === id && !u.isDeleted)
    : undefined

  const [userType, setUserType] = useState<UserTypeOption>('factory')
  const [name, setName] = useState(existingUser?.name ?? '')
  const [email, setEmail] = useState(existingUser?.email ?? '')
  const [password, setPassword] = useState('')
  const [roleLevelId, setRoleLevelId] = useState(existingUser?.roleLevelId ?? '')
  const [error, setError] = useState('')

  const scope = isHotelSide ? 'hotel' : TYPE_TO_SCOPE[userType]
  const availableRoleLevels = roleLevels.filter((r) => r.scope === scope)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!isEdit && !password.trim()) {
      setError('Password is required')
      return
    }
    if (!roleLevelId) {
      setError('Role level is required')
      return
    }

    if (isEdit && existingUser) {
      updateUser(existingUser.id, {
        email: email.trim(),
        name: name.trim(),
        role: existingUser.role,
        roleLevelId,
      })
    } else {
      const role = isHotelSide ? 'hotel_super_admin' : TYPE_TO_ROLE[userType]
      createUser({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        roleLevelId,
      })
    }

    navigate('..', { relative: 'path' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit User' : 'Create User'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isHotelSide && !isEdit && (
            <div className="space-y-3">
              <Label>User Type</Label>
              <UserTypeSelector value={userType} onChange={setUserType} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="roleLevel">Role Level</Label>
              {availableRoleLevels.length === 0 ? (
                <p className="text-sm text-muted-foreground pt-2">
                  No role levels available for this{' '}
                  {isHotelSide ? 'hotel' : userType} scope.{' '}
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() =>
                      navigate(
                        isHotelSide ? '/hotel/role-levels/new' : '/factory/role-levels/new',
                      )
                    }
                  >
                    Create one
                  </Button>
                </p>
              ) : (
                <RoleLevelSelect
                  value={roleLevelId}
                  onChange={setRoleLevelId}
                  scope={scope}
                />
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={availableRoleLevels.length === 0}>
              {isEdit ? 'Save Changes' : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('..', { relative: 'path' })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
