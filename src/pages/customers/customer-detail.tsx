import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useCustomerStore } from '@/stores/customer-store.ts'

export default function CustomerDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const customers = useCustomerStore((s) => s.customers)
  const contracts = useCustomerStore((s) => s.contracts)
  const pricingTemplates = useCustomerStore((s) => s.pricingTemplates)
  const deleteContract = useCustomerStore((s) => s.deleteContract)

  const customer = customers.find((c) => c.id === id)
  if (!customer) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Customer not found.
        </CardContent>
      </Card>
    )
  }

  const customerContracts = contracts.filter((c) => c.customerId === id)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{customer.companyName}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/factory/customers/${customer.id}/edit`)}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/factory/customers')}
              >
                Back
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Tax ID</p>
              <p className="font-medium">{customer.taxId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Person</p>
              <p className="font-medium">{customer.contactPerson}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{customer.email}</p>
            </div>
          </div>
          {customer.addresses.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Addresses</p>
              <div className="space-y-1">
                {customer.addresses.map((a, i) => (
                  <p key={i} className="text-sm">
                    <span className="font-medium">{a.siteLabel}:</span>{' '}
                    {a.fullAddress}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contracts</CardTitle>
            <Button
              onClick={() =>
                navigate(`/factory/contracts/new?customerId=${customer.id}`)
              }
            >
              New Contract
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customerContracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No contracts for this customer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Name</TableHead>
                  <TableHead>Pricing Template</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>SLA (TAT)</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerContracts.map((ct) => {
                  const template = pricingTemplates.find(
                    (t) => t.id === ct.pricingTemplateId,
                  )
                  return (
                    <TableRow key={ct.id}>
                      <TableCell className="font-medium">
                        {ct.contractName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {template?.name ?? 'Unknown'}
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
                            onClick={() =>
                              navigate(`/factory/contracts/${ct.id}/edit`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteContract(ct.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
