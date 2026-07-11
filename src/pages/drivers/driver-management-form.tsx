import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card.tsx'
import { useDriverManagementStore } from '@/stores/driver-management-store.ts'
import type { VehicleType } from '@/types/delivery.ts'
import { ArrowLeft } from 'lucide-react'

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'motorcycle', label: 'Motorcycle' },
]

interface FormData {
  name: string
  email: string
  phone: string
  licenseNumber: string
  vehicleType: VehicleType
  vehiclePlate: string
  maxCapacityKg: string
  workStartTime: string
  workEndTime: string
  breakStart: string
  breakEnd: string
}

const EMPTY_FORM: FormData = {
  name: '',
  email: '',
  phone: '',
  licenseNumber: '',
  vehicleType: 'van',
  vehiclePlate: '',
  maxCapacityKg: '',
  workStartTime: '08:00',
  workEndTime: '17:00',
  breakStart: '12:00',
  breakEnd: '13:00',
}

export default function DriverManagementFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const driverProfiles = useDriverManagementStore((s) => s.driverProfiles)
  const createDriver = useDriverManagementStore((s) => s.createDriver)
  const updateDriver = useDriverManagementStore((s) => s.updateDriver)

  const existingDriver = id ? driverProfiles.find((d) => d.id === id) : undefined
  const [form, setForm] = useState<FormData>(
    existingDriver
      ? {
          name: existingDriver.name,
          email: existingDriver.email,
          phone: existingDriver.phone,
          licenseNumber: existingDriver.licenseNumber,
          vehicleType: existingDriver.vehicleType,
          vehiclePlate: existingDriver.vehiclePlate,
          maxCapacityKg: String(existingDriver.maxCapacityKg),
          workStartTime: existingDriver.workStartTime,
          workEndTime: existingDriver.workEndTime,
          breakStart: existingDriver.breakStart,
          breakEnd: existingDriver.breakEnd,
        }
      : EMPTY_FORM,
  )

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return

    if (isEditing && id) {
      updateDriver(id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        licenseNumber: form.licenseNumber,
        vehicleType: form.vehicleType,
        vehiclePlate: form.vehiclePlate,
        maxCapacityKg: Number(form.maxCapacityKg),
        workStartTime: form.workStartTime,
        workEndTime: form.workEndTime,
        breakStart: form.breakStart,
        breakEnd: form.breakEnd,
      })
    } else {
      createDriver({
        name: form.name,
        email: form.email,
        phone: form.phone,
        licenseNumber: form.licenseNumber,
        vehicleType: form.vehicleType,
        vehiclePlate: form.vehiclePlate,
        maxCapacityKg: Number(form.maxCapacityKg),
        workStartTime: form.workStartTime,
        workEndTime: form.workEndTime,
        breakStart: form.breakStart,
        breakEnd: form.breakEnd,
      })
    }
    navigate('/factory/drivers')
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/factory/drivers')} className="gap-1">
        <ArrowLeft className="size-4" />
        Back to Drivers
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Driver' : 'Add Driver'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update driver profile and vehicle details'
              : 'Register a new driver with vehicle assignment'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Driver name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="driver@laundry.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="081-234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Driver License No.</Label>
                <Input
                  id="licenseNumber"
                  value={form.licenseNumber}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  placeholder="LIC-2024-001"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={form.vehicleType}
                    onValueChange={(val: VehicleType) => handleChange('vehicleType', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate">License Plate</Label>
                  <Input
                    id="vehiclePlate"
                    value={form.vehiclePlate}
                    onChange={(e) => handleChange('vehiclePlate', e.target.value)}
                    placeholder="กข 1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCapacityKg">Max Capacity (kg)</Label>
                  <Input
                    id="maxCapacityKg"
                    type="number"
                    min={0}
                    value={form.maxCapacityKg}
                    onChange={(e) => handleChange('maxCapacityKg', e.target.value)}
                    placeholder="1500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">Working Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workStartTime">Work Start</Label>
                  <Input
                    id="workStartTime"
                    type="time"
                    value={form.workStartTime}
                    onChange={(e) => handleChange('workStartTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workEndTime">Work End</Label>
                  <Input
                    id="workEndTime"
                    type="time"
                    value={form.workEndTime}
                    onChange={(e) => handleChange('workEndTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakStart">Break Start</Label>
                  <Input
                    id="breakStart"
                    type="time"
                    value={form.breakStart}
                    onChange={(e) => handleChange('breakStart', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakEnd">Break End</Label>
                  <Input
                    id="breakEnd"
                    type="time"
                    value={form.breakEnd}
                    onChange={(e) => handleChange('breakEnd', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/factory/drivers')}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Driver'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
