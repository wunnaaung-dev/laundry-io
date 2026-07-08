import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth-store.ts'
import type { UserRole } from '../../types/auth.ts'

interface ProtectedRouteProps {
  allowedRole?: UserRole
}

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
