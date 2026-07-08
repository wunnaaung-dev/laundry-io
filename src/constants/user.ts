import type { MockUser } from '../types/auth.ts'

export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'hotel@admin.com',
    password: 'admin123',
    name: 'Hotel Super Admin',
    role: 'hotel_super_admin',
  },
  {
    id: '2',
    email: 'factory@admin.com',
    password: 'admin123',
    name: 'Factory Super Admin',
    role: 'factory_super_admin',
  },
]
