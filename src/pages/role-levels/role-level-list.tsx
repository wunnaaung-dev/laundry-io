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
import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useRoleStore } from '@/stores/role-store.ts'
import type { Scope } from '@/types/auth.ts'

function scopeBadge(scope: Scope) {
  const map: Record<Scope, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    hotel: { label: 'Hotel', variant: 'default' },
    factory: { label: 'Factory', variant: 'secondary' },
    driver: { label: 'Driver', variant: 'outline' },
  }
  const s = map[scope]
  return <Badge variant={s.variant}>{s.label}</Badge>
}

export default function RoleLevelListPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const roleLevels = useRoleStore((s) => s.roleLevels)
  const deleteRoleLevel = useRoleStore((s) => s.deleteRoleLevel)

  const isHotelSide = user?.role === 'hotel_super_admin'
  const filtered = isHotelSide
    ? roleLevels.filter((r) => r.scope === 'hotel')
    : roleLevels

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Role Levels</CardTitle>
          <Button onClick={() => navigate('new')}>Create Role Level</Button>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No role levels defined yet. Create your first role level to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                {!isHotelSide && <TableHead>Scope</TableHead>}
                <TableHead>Created</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rl) => (
                <TableRow key={rl.id}>
                  <TableCell className="font-medium">{rl.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {rl.description}
                  </TableCell>
                  {!isHotelSide && <TableCell>{scopeBadge(rl.scope)}</TableCell>}
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(rl.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${rl.id}/edit`)}
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
                            <AlertDialogTitle>Delete Role Level?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove "{rl.name}". Users assigned
                              to this role level may lose access. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRoleLevel(rl.id)}
                            >
                              Delete
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
