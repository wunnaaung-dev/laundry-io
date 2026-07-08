import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-gray-300">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Page not found</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </CardContent>
      </Card>
    </div>
  )
}
