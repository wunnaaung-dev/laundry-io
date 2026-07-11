import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDriverStore } from '@/stores/driver-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx'
import { Scan, CheckCircle2, AlertCircle, Warehouse } from 'lucide-react'

export default function DriverScan() {
  const { orderId } = useParams()
  const [code, setCode] = useState('')
  const [lastResult, setLastResult] = useState<'success' | 'mismatch' | null>(null)
  const [showMismatch, setShowMismatch] = useState(false)
  const [delivered, setDelivered] = useState(false)
  const { recordScan, tasks, updateTaskStatus } = useDriverStore()

  const taskId = orderId ?? tasks[0]?.id ?? ''
  const currentTask = tasks.find((t) => t.id === taskId)

  const handleScan = () => {
    if (!code.trim()) return
    const success = recordScan(taskId, code.trim())
    setLastResult(success ? 'success' : 'mismatch')
    if (!success) {
      setShowMismatch(true)
    }
    setCode('')
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 pt-8">
      {lastResult === 'success' && (
        <div className="flex flex-col items-center gap-2 text-green-600">
          <CheckCircle2 className="size-12" />
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-sm px-4 py-1">
            Scan Successful
          </Badge>
          {!delivered && currentTask?.status === 'completed' && (
            <Button
              className="w-full mt-2 h-12 text-base gap-2"
              size="lg"
              variant="secondary"
              onClick={() => {
                useOrderStore.getState().transitionOrder(currentTask.orderId, 'delivered')
                updateTaskStatus(currentTask.id, 'delivered')
                setDelivered(true)
              }}
            >
              <Warehouse className="size-5" />
              Unload at Factory
            </Button>
          )}
          {delivered && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-sm px-4 py-1">
              Delivered
            </Badge>
          )}
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Scan className="size-4" />
            Scan QR / Barcode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter or scan code..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            className="h-12 text-center text-lg"
            autoFocus
          />
          <Button
            className="w-full h-14 text-base gap-2"
            size="lg"
            onClick={handleScan}
            disabled={!code.trim()}
          >
            <Scan className="size-5" />
            Scan
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showMismatch} onOpenChange={setShowMismatch}>
        <AlertDialogContent className="max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              Mismatch Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              Check Item Again. The scanned code does not match the expected item for this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowMismatch(false)}>
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
