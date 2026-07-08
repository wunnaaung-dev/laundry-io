import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
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
  PricingRule,
  PricingTemplate,
  LinenCategory,
} from '@/types/customer.ts'

const LINEN_CATEGORIES: LinenCategory[] = ['linen', 'towel', 'uniform']
const RULE_TYPES = ['per_item', 'weight_based'] as const

interface RuleEntry {
  key: string
  type: 'per_item' | 'weight_based'
  linenRate?: number
  towelRate?: number
  uniformRate?: number
  ratePerKg?: number
}

function ruleToEntry(rule: PricingRule, key: string): RuleEntry {
  if (rule.type === 'per_item') {
    return {
      key,
      type: 'per_item',
      linenRate: rule.rates.linen ?? 0,
      towelRate: rule.rates.towel ?? 0,
      uniformRate: rule.rates.uniform ?? 0,
    }
  }
  return {
    key,
    type: 'weight_based',
    ratePerKg: rule.ratePerKg ?? 0,
  }
}

function entryToRule(entry: RuleEntry): PricingRule {
  if (entry.type === 'per_item') {
    return {
      type: 'per_item',
      rates: {
        linen: entry.linenRate ?? 0,
        towel: entry.towelRate ?? 0,
        uniform: entry.uniformRate ?? 0,
      },
    }
  }
  return {
    type: 'weight_based',
    ratePerKg: entry.ratePerKg ?? 0,
  }
}

let ruleKeyCounter = 0
function freshKey(): string {
  return `rule-${++ruleKeyCounter}`
}

export default function PricingTemplateFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const pricingTemplates = useCustomerStore((s) => s.pricingTemplates)
  const createPricingTemplate = useCustomerStore((s) => s.createPricingTemplate)
  const updatePricingTemplate = useCustomerStore((s) => s.updatePricingTemplate)

  const existing: PricingTemplate | undefined = isEdit
    ? pricingTemplates.find((t) => t.id === id)
    : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [rules, setRules] = useState<RuleEntry[]>(
    existing?.rules.map((r) => ruleToEntry(r, freshKey())) ?? [
      { key: freshKey(), type: 'per_item' },
    ],
  )
  const [error, setError] = useState('')

  function addRule() {
    setRules((prev) => [...prev, { key: freshKey(), type: 'per_item' }])
  }

  function removeRule(key: string) {
    setRules((prev) => prev.filter((r) => r.key !== key))
  }

  function updateRule(key: string, field: Partial<RuleEntry>) {
    setRules((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...field } : r)),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Template name is required')
      return
    }
    if (rules.length === 0) {
      setError('At least one pricing rule is required')
      return
    }

    const data = {
      name: name.trim(),
      description: description.trim(),
      rules: rules.map(entryToRule),
    }

    if (isEdit && existing) {
      updatePricingTemplate(existing.id, data)
    } else {
      createPricingTemplate(data)
    }

    navigate('..', { relative: 'path' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit Pricing Template' : 'Create Pricing Template'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Per-Item Linen Rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this pricing template"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pricing Rules</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRule}>
                Add Rule
              </Button>
            </div>
            {rules.map((rule) => (
              <div
                key={rule.key}
                className="border rounded-md p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-48">
                    <Select
                      value={rule.type}
                      onValueChange={(v) =>
                        updateRule(rule.key, {
                          type: v as 'per_item' | 'weight_based',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RULE_TYPES.map((rt) => (
                          <SelectItem key={rt} value={rt}>
                            {rt === 'per_item' ? 'Per-Item Pricing' : 'Weight-Based Pricing'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeRule(rule.key)}
                    disabled={rules.length === 1}
                  >
                    Remove
                  </Button>
                </div>
                {rule.type === 'per_item' ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {LINEN_CATEGORIES.map((cat) => (
                      <div key={cat} className="space-y-1">
                        <Label className="text-xs capitalize">{cat} Rate ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            cat === 'linen'
                              ? rule.linenRate ?? ''
                              : cat === 'towel'
                                ? rule.towelRate ?? ''
                                : rule.uniformRate ?? ''
                          }
                          onChange={(e) =>
                            updateRule(rule.key, {
                              [`${cat}Rate`]: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-48 space-y-1">
                    <Label className="text-xs">Rate per Kg ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={rule.ratePerKg ?? ''}
                      onChange={(e) =>
                        updateRule(rule.key, {
                          ratePerKg: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Create Template'}
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
