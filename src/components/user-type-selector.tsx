import { Label } from '@/components/ui/label.tsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'

export type UserTypeOption = 'factory' | 'client' | 'driver' | 'dispatcher'

interface UserTypeSelectorProps {
  value: UserTypeOption
  onChange: (value: UserTypeOption) => void
}

const OPTIONS: { value: UserTypeOption; label: string; desc: string }[] = [
  {
    value: 'factory',
    label: 'Factory',
    desc: 'Internal laundry staff',
  },
  {
    value: 'client',
    label: 'Client',
    desc: 'Hotel / customer users',
  },
  {
    value: 'driver',
    label: 'Driver',
    desc: 'Delivery drivers',
  },
  {
    value: 'dispatcher',
    label: 'Dispatcher',
    desc: 'Dispatch & route planners',
  },
]

export function UserTypeSelector({ value, onChange }: UserTypeSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as UserTypeOption)}
      className="grid grid-cols-3 gap-4"
    >
      {OPTIONS.map((opt) => (
        <div key={opt.value}>
          <RadioGroupItem
            value={opt.value}
            id={`user-type-${opt.value}`}
            className="peer sr-only"
          />
          <Label
            htmlFor={`user-type-${opt.value}`}
            className="flex flex-col items-center gap-1 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <span className="text-sm font-semibold">{opt.label}</span>
            <span className="text-xs text-muted-foreground">{opt.desc}</span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
