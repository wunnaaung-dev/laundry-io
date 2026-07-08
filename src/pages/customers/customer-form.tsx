import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useCustomerStore } from '@/stores/customer-store.ts'
import type { CustomerAddress, CustomerProfile } from '@/types/customer.ts'

export default function CustomerFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const customers = useCustomerStore((s) => s.customers)
  const createCustomer = useCustomerStore((s) => s.createCustomer)
  const updateCustomer = useCustomerStore((s) => s.updateCustomer)

  const existing: CustomerProfile | undefined = isEdit
    ? customers.find((c) => c.id === id)
    : undefined

  const [companyLogo, setCompanyLogo] = useState(existing?.companyLogo ?? '')
  const [companyName, setCompanyName] = useState(existing?.companyName ?? '')
  const [taxId, setTaxId] = useState(existing?.taxId ?? '')
  const [contactPerson, setContactPerson] = useState(existing?.contactPerson ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [email, setEmail] = useState(existing?.email ?? '')
  const [addresses, setAddresses] = useState<CustomerAddress[]>(
    existing?.addresses ?? [{ siteLabel: '', fullAddress: '' }],
  )
  const [error, setError] = useState('')

  function updateAddress(index: number, field: keyof CustomerAddress, value: string) {
    setAddresses((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    )
  }

  function addAddress() {
    setAddresses((prev) => [...prev, { siteLabel: '', fullAddress: '' }])
  }

  function removeAddress(index: number) {
    setAddresses((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!companyName.trim()) {
      setError('Company name is required')
      return
    }
    if (!taxId.trim()) {
      setError('Tax ID is required')
      return
    }
    if (!contactPerson.trim()) {
      setError('Contact person is required')
      return
    }
    if (!phone.trim()) {
      setError('Phone is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    const data = {
      companyLogo: companyLogo.trim(),
      companyName: companyName.trim(),
      taxId: taxId.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      addresses: addresses.filter((a) => a.siteLabel.trim() || a.fullAddress.trim()),
    }

    if (isEdit && existing) {
      updateCustomer(existing.id, data)
    } else {
      createCustomer(data)
    }

    navigate('..', { relative: 'path' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Customer' : 'Create Customer'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyLogo">Company Logo URL</Label>
            <Input
              id="companyLogo"
              value={companyLogo}
              onChange={(e) => setCompanyLogo(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="TX-00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Addresses</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAddress}>
                Add Address
              </Button>
            </div>
            {addresses.map((addr, i) => (
              <div key={i} className="flex gap-3 items-start border rounded-md p-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Site Label</Label>
                    <Input
                      value={addr.siteLabel}
                      onChange={(e) => updateAddress(i, 'siteLabel', e.target.value)}
                      placeholder="Main Building"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Full Address</Label>
                    <Input
                      value={addr.fullAddress}
                      onChange={(e) =>
                        updateAddress(i, 'fullAddress', e.target.value)
                      }
                      placeholder="123 Street, City"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-5 text-destructive"
                  onClick={() => removeAddress(i)}
                  disabled={addresses.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Create Customer'}
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
