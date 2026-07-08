import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth-store.ts'
import { useRoleStore } from '../../stores/role-store.ts'
import type { UserRole, ResourceModule, AccessLevel, Scope } from '../../types/auth.ts'

interface ProtectedRouteProps {
  allowedRole?: UserRole
  allowedScopes?: Scope[]
  requiredModule?: ResourceModule
}

function meetAccess(level: AccessLevel): boolean {
  return level === 'view' || level === 'edit' || level === 'admin'
}

export default function ProtectedRoute({
  allowedRole,
  allowedScopes,
  requiredModule,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const roleLevels = useRoleStore((s) => s.roleLevels)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/login" replace />
  }

  if (allowedScopes && user?.roleLevelId) {
    const roleLevel = roleLevels.find((r) => r.id === user.roleLevelId)
    if (!roleLevel || !allowedScopes.includes(roleLevel.scope)) {
      return <Navigate to="/login" replace />
    }
  }

  if (requiredModule && user?.roleLevelId) {
    const roleLevel = roleLevels.find((r) => r.id === user.roleLevelId)
    if (!roleLevel || !meetAccess(roleLevel.permissions[requiredModule])) {
      return <Navigate to="/login" replace />
    }
  }

  return <Outlet />
}
