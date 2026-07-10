import { useNavigate } from 'react-router-dom'
import { TriangleAlert, ExternalLink, FileWarning } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { HAZARDOUS_CATEGORIES, getExpiryStatus } from './constants.ts'
import type { WarehouseItem } from '@/types/warehouse.ts'

interface ItemChipProps {
  item: WarehouseItem
}

export default function ItemChip({ item }: ItemChipProps) {
  const navigate = useNavigate()
  const isLowStock = item.currentStock <= item.minStockLevel
  const isHazardous = HAZARDOUS_CATEGORIES.has(item.category)
  const expiryStatus = item.expiryDate ? getExpiryStatus(item.expiryDate) : null
  const isExpiringSoon = expiryStatus === 'expiring_soon'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        navigate(`/factory/warehouse/inventory/${item.id}/edit`)
      }}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs text-card-foreground transition-colors hover:bg-accent cursor-pointer ${
        isExpiringSoon ? 'border-amber-400 bg-amber-500/10' : ''
      }`}
    >
      {isLowStock && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <TriangleAlert className="size-3 text-amber-500 shrink-0" />
            </TooltipTrigger>
            <TooltipContent>Low stock</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {isHazardous && item.sdsUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ExternalLink className="size-3 text-blue-500 shrink-0" />
            </TooltipTrigger>
            <TooltipContent>SDS available</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {isHazardous && !item.sdsUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <FileWarning className="size-3 text-orange-500 shrink-0" />
            </TooltipTrigger>
            <TooltipContent>Missing SDS</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <span>{item.name}</span>
      <span className="text-muted-foreground">
        ({item.currentStock}
        {item.unit})
      </span>
    </button>
  )
}
