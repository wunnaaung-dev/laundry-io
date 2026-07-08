import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useCustomerStore } from '@/stores/customer-store.ts'
import type {
  Contract,
  LinenCategory,
} from '@/types/customer.ts'

const LINEN_OPTIONS: LinenCategory[] = ['linen', 'towel', 'uniform']

export default function ContractFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)

  const customers = useCustomerStore((s) => s.customers)
  const pricingTemplates = useCustomerStore((s) => s.pricingTemplates)
  const contracts = useCustomerStore((s) => s.contracts)
  const createContract = useCustomerStore((s) => s.createContract)
  const updateContract = useCustomerStore((s) => s.updateContract)

  const existing: Contract | undefined = isEdit
    ? contracts.find((c) => c.id === id)
    : undefined

  const preselectedCustomerId = searchParams.get('customerId') ?? ''

  const [customerId, setCustomerId] = useState(
    existing?.customerId ?? preselectedCustomerId,
  )
  const [pricingTemplateId, setPricingTemplateId] = useState(
    existing?.pricingTemplateId ?? '',
  )
  const [contractName, setContractName] = useState(existing?.contractName ?? '')
  const [startDate, setStartDate] = useState(existing?.startDate ?? '')
  const [endDate, setEndDate] = useState(existing?.endDate ?? '')
  const [tatHours, setTatHours] = useState(existing?.sla.tatHours ?? 24)
  const [qualityStandards, setQualityStandards] = useState(
    existing?.sla.qualityStandards ?? '',
  )
  const [serviceScope, setServiceScope] = useState<LinenCategory[]>(
    existing?.sla.serviceScope ?? [],
  )
  const [penaltyClauses, setPenaltyClauses] = useState(
    existing?.sla.penaltyClauses ?? '',
  )
  const [error, setError] = useState('')

  function toggleScope(cat: LinenCategory) {
    setServiceScope((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!customerId) {
      setError('Customer is required')
      return
    }
    if (!pricingTemplateId) {
      setError('Pricing template is required')
      return
    }
    if (!contractName.trim()) {
      setError('Contract name is required')
      return
    }
    if (!startDate) {
      setError('Start date is required')
      return
    }
    if (!endDate) {
      setError('End date is required')
      return
    }
    if (serviceScope.length === 0) {
      setError('At least one linen category must be selected in SLA scope')
      return
    }

    const data = {
      customerId,
      pricingTemplateId,
      contractName: contractName.trim(),
      startDate,
      endDate,
      sla: {
        tatHours,
        qualityStandards: qualityStandards.trim(),
        serviceScope,
        penaltyClauses: penaltyClauses.trim(),
      },
    }

    if (isEdit && existing) {
      updateContract(existing.id, data)
    } else {
      createContract(data)
    }

    navigate('..', { relative: 'path' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit Contract' : 'Create Contract'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricingTemplateId">Pricing Template</Label>
              <Select
                value={pricingTemplateId}
                onValueChange={setPricingTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {pricingTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractName">Contract Name</Label>
              <Input
                id="contractName"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="e.g. Standard Laundry Agreement 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tatHours">TAT (Hours)</Label>
              <Input
                id="tatHours"
                type="number"
                min="1"
                value={tatHours}
                onChange={(e) => setTatHours(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Service Scope (SLA)</Label>
            <div className="flex gap-6">
              {LINEN_OPTIONS.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    id={`scope-${cat}`}
                    checked={serviceScope.includes(cat)}
                    onCheckedChange={() => toggleScope(cat)}
                  />
                  <Label htmlFor={`scope-${cat}`} className="capitalize cursor-pointer">
                    {cat}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualityStandards">Quality Standards</Label>
            <Textarea
              id="qualityStandards"
              value={qualityStandards}
              onChange={(e) => setQualityStandards(e.target.value)}
              placeholder="Describe quality standards..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="penaltyClauses">Penalty Clauses</Label>
            <Textarea
              id="penaltyClauses"
              value={penaltyClauses}
              onChange={(e) => setPenaltyClauses(e.target.value)}
              placeholder="Describe penalty terms..."
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Create Contract'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('..', { relative: 'path' })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
