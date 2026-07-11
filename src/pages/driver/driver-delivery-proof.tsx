import { useRef, useState, type PointerEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDriverStore } from '@/stores/driver-store.ts'
import { useDeliveryStore } from '@/stores/delivery-store.ts'
import { useDeliveryEventStore } from '@/stores/delivery-event-store.ts'
import { useOrderStore } from '@/stores/order-store.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { Button } from '@/components/ui/button.tsx'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Pen, Camera, CheckCircle2 } from 'lucide-react'

export default function DriverDeliveryProof() {
  const { orderId } = useParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [completed, setCompleted] = useState(false)
  const { completeDelivery, tasks } = useDriverStore()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const startDrawing = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleConfirm = () => {
    if (orderId) {
      const { confirmDelivery } = useOrderStore.getState()
      confirmDelivery(orderId)
      const task = tasks.find((t) => t.orderId === orderId)
      if (task?.stopId) {
        const stop = useDeliveryStore.getState().stops.find((s) => s.id === task.stopId)
        if (stop) {
          useDeliveryEventStore.getState().addEvent({
            stopId: task.stopId,
            routeId: stop.routeId,
            eventType: 'signature',
            description: `Delivery confirmed for ${task.clientName}`,
            photoUrl: photo ?? undefined,
            userId: user?.id ?? 'driver',
            userName: user?.name ?? 'Driver',
          })
        }
      }
    }
    completeDelivery()
    setShowConfirm(false)
    setCompleted(true)
    setTimeout(() => navigate('/driver/dashboard'), 2000)
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 pt-20">
        <CheckCircle2 className="size-16 text-green-600" />
        <p className="text-lg font-semibold text-green-700">
          Delivery Confirmed
        </p>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Pen className="size-4" />
            Digital Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <canvas
            ref={canvasRef}
            width={300}
            height={150}
            className="w-full rounded-lg border bg-white touch-none"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />
          <Button variant="ghost" size="sm" onClick={clearSignature}>
            Clear
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera className="size-4" />
            Photo of Delivered Goods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {photo && (
            <img
              src={photo}
              alt="Delivered goods"
              className="w-full rounded-lg border object-cover max-h-48"
            />
          )}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full h-14 text-base"
        onClick={() => setShowConfirm(true)}
      >
        Confirm Delivery
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this delivery as complete? The order
              status will be updated to 'Delivered'.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
