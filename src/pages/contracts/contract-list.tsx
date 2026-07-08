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

export default function ContractListPage() {
  const navigate = useNavigate()
  const customers = useCustomerStore((s) => s.customers)
  const pricingTemplates = useCustomerStore((s) => s.pricingTemplates)
  const contracts = useCustomerStore((s) => s.contracts)
  const deleteContract = useCustomerStore((s) => s.deleteContract)

  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))
  const templateMap = new Map(pricingTemplates.map((t) => [t.id, t.name]))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contracts</CardTitle>
          <Button onClick={() => navigate('new')}>Create Contract</Button>
        </div>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contracts found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Pricing Template</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>SLA (TAT)</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((ct) => (
                <TableRow key={ct.id}>
                  <TableCell className="font-medium">{ct.contractName}</TableCell>
                  <TableCell>{customerMap.get(ct.customerId) ?? 'Unknown'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {templateMap.get(ct.pricingTemplateId) ?? 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {ct.startDate} &ndash; {ct.endDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ct.sla.tatHours}h TAT</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${ct.id}/edit`)}
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
                            <AlertDialogTitle>
                              Delete Contract?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &ldquo;{ct.contractName}
                              &rdquo;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteContract(ct.id)}
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
