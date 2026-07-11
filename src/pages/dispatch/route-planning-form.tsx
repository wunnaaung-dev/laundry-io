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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card.tsx'
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { useDriverManagementStore } from '@/stores/driver-management-store.ts'
import type { ScheduleType } from '@/types/delivery.ts'
import { ArrowLeft } from 'lucide-react'

const SCHEDULE_OPTIONS: { value: ScheduleType; label: string }[] = [
  { value: 'one_time', label: 'One-Time' },
  { value: 'recurring_daily', label: 'Daily' },
  { value: 'recurring_weekly', label: 'Weekly' },
  { value: 'recurring_monthly', label: 'Monthly' },
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface FormData {
  name: string
  description: string
  driverId: string
  scheduledDate: string
  scheduleType: ScheduleType
  recurringDays: number[]
}

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  driverId: '',
  scheduledDate: new Date().toISOString().split('T')[0],
  scheduleType: 'one_time',
  recurringDays: [],
}

export default function RoutePlanningFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const routes = useDeliveryStore((s) => s.routes)
  const createRoute = useDeliveryStore((s) => s.createRoute)
  const updateRoute = useDeliveryStore((s) => s.updateRoute)
  const driverProfiles = useDriverManagementStore((s) => s.driverProfiles)

  const existingRoute = id ? routes.find((r) => r.id === id) : undefined

  const [form, setForm] = useState<FormData>(
    existingRoute
      ? {
          name: existingRoute.name,
          description: existingRoute.description,
          driverId: existingRoute.driverId,
          scheduledDate: existingRoute.scheduledDate,
          scheduleType: existingRoute.scheduleType,
          recurringDays: existingRoute.recurringDays,
        }
      : EMPTY_FORM,
  )

  const selectedDriver = driverProfiles.find((d) => d.id === form.driverId)

  function handleChange<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter((d) => d !== day)
        : [...prev.recurringDays, day].sort(),
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.driverId) return

    if (isEditing && id) {
      updateRoute(id, {
        name: form.name,
        description: form.description,
        driverId: form.driverId,
        driverName: selectedDriver?.name ?? 'Unknown',
        vehicleInfo: selectedDriver
          ? `${selectedDriver.vehicleType} - ${selectedDriver.vehiclePlate}`
          : '',
        scheduledDate: form.scheduledDate,
        scheduleType: form.scheduleType,
        recurringDays: form.recurringDays,
      })
      navigate(`/factory/dispatch/routes/${id}`)
    } else {
      const routeId = createRoute({
        name: form.name,
        description: form.description,
        driverId: form.driverId,
        driverName: selectedDriver?.name ?? 'Unknown',
        vehicleInfo: selectedDriver
          ? `${selectedDriver.vehicleType} - ${selectedDriver.vehiclePlate}`
          : '',
        scheduledDate: form.scheduledDate,
        scheduleType: form.scheduleType,
        recurringDays: form.recurringDays,
      })
      navigate(`/factory/dispatch/routes/${routeId}`)
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/factory/dispatch/routes')}
        className="gap-1"
      >
        <ArrowLeft className="size-4" />
        Back to Routes
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Route' : 'Create Route'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update route details and driver assignment'
              : 'Plan a new delivery route and assign a driver'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Monday Hotel Route 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverId">Driver *</Label>
                <Select
                  value={form.driverId}
                  onValueChange={(val) => handleChange('driverId', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {driverProfiles
                      .filter((d) => d.isActive)
                      .map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} ({driver.vehiclePlate})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Route notes, special instructions..."
                rows={3}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => handleChange('scheduledDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleType">Schedule Type</Label>
                  <Select
                    value={form.scheduleType}
                    onValueChange={(val: ScheduleType) => handleChange('scheduleType', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHEDULE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.scheduleType === 'recurring_weekly' && (
                <div className="mt-4 space-y-2">
                  <Label>Repeat Days</Label>
                  <div className="flex gap-2">
                    {DAY_LABELS.map((label, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant={form.recurringDays.includes(i) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDay(i)}
                        className="w-10"
                      >
                        {label[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {form.scheduleType === 'recurring_monthly' && (
                <div className="mt-4 space-y-2">
                  <Label>Repeat on Days of Month</Label>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant={form.recurringDays.includes(day) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDay(day)}
                        className="w-9 h-9"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/factory/dispatch/routes')}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Route'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
