import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { useRoleStore } from '../stores/role-store.ts'
import type { Scope } from '../types/auth.ts'

interface RoleLevelSelectProps {
  value: string
  onChange: (value: string) => void
  scope?: Scope
  disabled?: boolean
  placeholder?: string
}

export function RoleLevelSelect({
  value,
  onChange,
  scope,
  disabled,
  placeholder = 'Select a role level',
}: RoleLevelSelectProps) {
  const roleLevels = useRoleStore((s) => s.roleLevels)
  const filtered = scope
    ? roleLevels.filter((r) => r.scope === scope)
    : roleLevels

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filtered.length === 0 && (
          <SelectItem value="__none__" disabled>
            No role levels available
          </SelectItem>
        )}
        {filtered.map((rl) => (
          <SelectItem key={rl.id} value={rl.id}>
            {rl.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
