import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'

export default function HotelContractsPage() {
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const pricingTemplates = useCustomerStore((s) => s.pricingTemplates)
  const contracts = useCustomerStore((s) => s.contracts)

  const profile = customers.find(
    (c) => c.email === user?.email || c.contactPerson === user?.name,
  )

  const templateMap = new Map(pricingTemplates.map((t) => [t.id, t.name]))

  const myContracts = profile
    ? contracts.filter((c) => c.customerId === profile.id)
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Contracts</CardTitle>
      </CardHeader>
      <CardContent>
        {!profile ? (
          <p className="text-sm text-muted-foreground">
            No company profile found. Contact your factory administrator.
          </p>
        ) : myContracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contracts assigned to your company yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Pricing Template</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>TAT</TableHead>
                <TableHead>Service Scope</TableHead>
                <TableHead>Quality Standards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myContracts.map((ct) => (
                <TableRow key={ct.id}>
                  <TableCell className="font-medium">{ct.contractName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {templateMap.get(ct.pricingTemplateId) ?? 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {ct.startDate} &ndash; {ct.endDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ct.sla.tatHours}h</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ct.sla.serviceScope.map((s) => (
                        <Badge key={s} variant="outline" className="capitalize">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground truncate">
                    {ct.sla.qualityStandards}
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
