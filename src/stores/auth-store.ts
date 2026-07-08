import { create } from 'zustand'
import type { AuthUser, UserRole } from '../types/auth.ts'
import { MOCK_USERS } from '../constants/user.ts'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (email, password) => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    )
    if (!found) return false

    const user: AuthUser = {
      id: found.id,
      email: found.email,
      name: found.name,
      role: found.role,
    }
    set({ user, isAuthenticated: true })
    return true
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  },

  hasRole: (role) => get().user?.role === role,
}))
