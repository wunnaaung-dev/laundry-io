import { Progress } from '@/components/ui/progress.tsx'

interface TatGaugeProps {
  elapsedHours: number
  targetHours: number
}

export function TatGauge({ elapsedHours, targetHours }: TatGaugeProps) {
  const ratio = targetHours > 0 ? elapsedHours / targetHours : 0
  const pct = Math.min(Math.round(ratio * 100), 100)

  let indicatorClassName: string
  let textColor: string
  let label: string

  if (ratio >= 1) {
    indicatorClassName = 'bg-red-500'
    textColor = 'text-red-600'
    label = 'Breached'
  } else if (ratio >= 0.8) {
    indicatorClassName = 'bg-amber-500'
    textColor = 'text-amber-600'
    label = 'At Risk'
  } else {
    indicatorClassName = 'bg-green-500'
    textColor = 'text-green-600'
    label = 'On Track'
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          TAT: {elapsedHours.toFixed(1)}h / {targetHours}h
        </span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>
      <Progress value={pct} className="h-2" indicatorClassName={indicatorClassName} />
    </div>
  )
}
