import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Label } from '@/components/ui/label.tsx'
import type { ResourceModule, AccessLevel } from '../types/auth.ts'
import { MODULE_LABELS, MODULE_CATEGORIES } from './module-labels.ts'

const ACCESS_LEVELS: { value: AccessLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' },
  { value: 'admin', label: 'Admin' },
]

interface PermissionGridProps {
  permissions: Record<ResourceModule, AccessLevel>
  onChange: (module: ResourceModule, level: AccessLevel) => void
}

export function PermissionGrid({ permissions, onChange }: PermissionGridProps) {
  return (
    <div className="space-y-6">
      {MODULE_CATEGORIES.map((cat) => (
        <fieldset key={cat.label}>
          <legend className="text-sm font-semibold mb-2 text-muted-foreground">
            {cat.label}
          </legend>
          <div className="space-y-2">
            {cat.modules.map((mod) => (
              <div
                key={mod}
                className="grid grid-cols-[1fr_140px] items-center gap-4"
              >
                <Label
                  htmlFor={`perm-${mod}`}
                  className="text-sm font-normal"
                >
                  {MODULE_LABELS[mod]}
                </Label>
                <Select
                  value={permissions[mod]}
                  onValueChange={(v) => onChange(mod, v as AccessLevel)}
                >
                  <SelectTrigger id={`perm-${mod}`} className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_LEVELS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
