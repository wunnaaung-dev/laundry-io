import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useRoleStore } from '@/stores/role-store.ts'

export default function UserListPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const roleLevels = useRoleStore((s) => s.roleLevels)
  const users = useRoleStore((s) => s.users)
  const softDeleteUser = useRoleStore((s) => s.softDeleteUser)

  const isHotelSide = user?.role === 'hotel_super_admin'

  const activeUsers = users.filter((u) => !u.isDeleted)
  const hotelScopeIds = roleLevels.filter((r) => r.scope === 'hotel').map((r) => r.id)
  const filtered = isHotelSide
    ? activeUsers.filter((u) => hotelScopeIds.includes(u.roleLevelId))
    : activeUsers

  const hasRoleLevels = isHotelSide
    ? roleLevels.some((r) => r.scope === 'hotel')
    : roleLevels.length > 0

  const roleLevelMap = new Map(roleLevels.map((r) => [r.id, r.name]))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Button onClick={() => navigate('new')} disabled={!hasRoleLevels}>
            Create User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasRoleLevels ? (
          <p className="text-sm text-muted-foreground">
            No role levels defined yet.{' '}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => navigate('/hotel/role-levels')}
            >
              Create a role level
            </Button>{' '}
            first before adding users.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role Level</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {roleLevelMap.get(u.roleLevelId) ?? 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${u.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will deactivate "{u.name}". They will no longer be
                              able to log in. You can restore them later if needed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => softDeleteUser(u.id)}
                            >
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
