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
import { Badge } from '@/components/ui/badge.tsx'
import { useCustomerStore } from '@/stores/customer-store.ts'

const RULE_LABELS: Record<string, string> = {
  per_item: 'Per-Item',
  weight_based: 'Weight-Based',
}

export default function PricingTemplateListPage() {
  const navigate = useNavigate()
  const pricingTemplates = useCustomerStore((s) => s.pricingTemplates)
  const contracts = useCustomerStore((s) => s.contracts)
  const deletePricingTemplate = useCustomerStore((s) => s.deletePricingTemplate)

  function canDelete(id: string) {
    return !contracts.some((c) => c.pricingTemplateId === id)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pricing Templates</CardTitle>
          <Button onClick={() => navigate('new')}>Create Template</Button>
        </div>
      </CardHeader>
      <CardContent>
        {pricingTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pricing templates found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead className="w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingTemplates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.rules.map((r, i) => (
                        <Badge key={i} variant="secondary">
                          {RULE_LABELS[r.type]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${t.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={!canDelete(t.id)}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Pricing Template?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {canDelete(t.id)
                                ? `This will permanently remove "${t.name}".`
                                : 'This template is in use by one or more contracts and cannot be deleted.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            {canDelete(t.id) && (
                              <AlertDialogAction
                                onClick={() => deletePricingTemplate(t.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            )}
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
