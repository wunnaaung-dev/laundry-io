import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useCustomerStore } from '@/stores/customer-store.ts'
import type { CustomerAddress } from '@/types/customer.ts'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const customers = useCustomerStore((s) => s.customers)
  const updateCustomer = useCustomerStore((s) => s.updateCustomer)

  const profile = customers.find(
    (c) => c.email === user?.email || c.contactPerson === user?.name,
  )

  const [companyLogo, setCompanyLogo] = useState(profile?.companyLogo ?? '')
  const [companyName, setCompanyName] = useState(profile?.companyName ?? '')
  const [taxId, setTaxId] = useState(profile?.taxId ?? '')
  const [contactPerson, setContactPerson] = useState(profile?.contactPerson ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [addresses, setAddresses] = useState<CustomerAddress[]>(
    profile?.addresses ?? [{ siteLabel: '', fullAddress: '' }],
  )
  const [saved, setSaved] = useState(false)
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
    setSaved(false)

    if (!companyName.trim()) {
      setError('Company name is required')
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

    if (profile) {
      updateCustomer(profile.id, {
        companyLogo: companyLogo.trim(),
        companyName: companyName.trim(),
        taxId: taxId.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        addresses: addresses.filter((a) => a.siteLabel.trim() || a.fullAddress.trim()),
      })
      setSaved(true)
    }
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No company profile found. Contact your factory administrator.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Company Profile</CardTitle>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
          {saved && (
            <p className="text-sm text-green-600">Profile updated successfully.</p>
          )}

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}
