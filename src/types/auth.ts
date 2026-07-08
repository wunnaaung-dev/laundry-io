export type UserRole = 'hotel_super_admin' | 'factory_super_admin'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface MockUser extends AuthUser {
  password: string
}
