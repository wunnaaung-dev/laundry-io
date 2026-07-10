import { useNavigate } from 'react-router-dom'
import { TriangleAlert, ExternalLink, FileWarning } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import {
  CATEGORY_LABELS,
  CATEGORY_VARIANTS,
  HAZARDOUS_CATEGORIES,
  getExpiryStatus,
  EXPIRY_LABELS,
  EXPIRY_VARIANTS,
} from './constants.ts'
import type { WarehouseItem } from '@/types/warehouse.ts'

interface ZoneTableSectionProps {
  zoneName: string
  items: WarehouseItem[]
}

export default function ZoneTableSection({ zoneName, items }: ZoneTableSectionProps) {
  const navigate = useNavigate()
  const sorted = [...items].sort((a, b) => {
    if (!a.expiryDate) return 1
    if (!b.expiryDate) return -1
    return a.expiryDate.localeCompare(b.expiryDate)
  })

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{zoneName}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Safety</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-4">
                No items in this zone
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((item) => {
              const isLowStock = item.currentStock <= item.minStockLevel
              const isHazardous = HAZARDOUS_CATEGORIES.has(item.category)
              const expiryStatus = item.expiryDate ? getExpiryStatus(item.expiryDate) : null
              const isExpiringSoon = expiryStatus === 'expiring_soon'

              return (
                <TableRow
                  key={item.id}
                  className={`cursor-pointer hover:bg-muted/50 ${isExpiringSoon ? 'border-l-4 border-l-amber-400' : ''}`}
                  onClick={() => navigate(`/factory/warehouse/inventory/${item.id}/edit`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
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
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                  <TableCell>
                    <Badge variant={CATEGORY_VARIANTS[item.category]}>
                      {CATEGORY_LABELS[item.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.currentStock}
                    {item.unit}
                  </TableCell>
                  <TableCell>
                    {expiryStatus ? (
                      <Badge variant={EXPIRY_VARIANTS[expiryStatus]}>
                        {EXPIRY_LABELS[expiryStatus]}
                        {item.expiryDate && ` (${new Date(item.expiryDate).toLocaleDateString()})`}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isHazardous && item.sdsUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={item.sdsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex"
                            >
                              <ExternalLink className="size-4 text-blue-500" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>SDS available</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isHazardous && !item.sdsUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FileWarning className="size-4 text-orange-500" />
                          </TooltipTrigger>
                          <TooltipContent>Missing SDS</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {!isHazardous && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
