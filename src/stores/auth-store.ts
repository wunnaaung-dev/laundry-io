import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, UserRole } from '../types/auth.ts'
import { useRoleStore } from './role-store.ts'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const { users } = useRoleStore.getState()
        const found = users.find(
          (u) => u.email === email && u.password === password && !u.isDeleted,
        )
        if (!found) return false

        const user: AuthUser = {
          id: found.id,
          email: found.email,
          name: found.name,
          role: found.role,
          roleLevelId: found.roleLevelId,
        }
        set({ user, isAuthenticated: true })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      hasRole: (role) => get().user?.role === role,
    }),
    { name: 'laundry-auth-store' },
  ),
)
