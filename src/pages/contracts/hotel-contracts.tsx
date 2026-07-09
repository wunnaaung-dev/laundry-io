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
import { useCustomerStore } from '@/stores/customer-store.ts'

export default function HotelContractsPage() {
  const customers = useCustomerStore((s) => s.customers)
  const pricingTemplates = useCustomerStore((s) => s.pricingTemplates)
  const contracts = useCustomerStore((s) => s.contracts)

  const templateMap = new Map(pricingTemplates.map((t) => [t.id, t.name]))
  const customerMap = new Map(customers.map((c) => [c.id, c.companyName]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contracts yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contract Name</TableHead>
                <TableHead>Pricing Template</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>TAT</TableHead>
                <TableHead>Service Scope</TableHead>
                <TableHead>Quality Standards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((ct) => (
                <TableRow key={ct.id}>
                  <TableCell>{customerMap.get(ct.customerId) ?? 'Unknown'}</TableCell>
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
