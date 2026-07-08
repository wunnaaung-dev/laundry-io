import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/auth/login.tsx'
import HotelLayout from './layouts/hotel-layout.tsx'
import FactoryLayout from './layouts/factory-layout.tsx'
import HotelDashboard from './pages/dashboard/hotel-dashboard.tsx'
import FactoryDashboard from './pages/dashboard/factory-dashboard.tsx'
import ProtectedRoute from './components/auth/protected-route.tsx'
import NotFoundPage from './pages/not-found.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={<ProtectedRoute allowedRole="hotel_super_admin" />}
        >
          <Route element={<HotelLayout />}>
            <Route path="/hotel/dashboard" element={<HotelDashboard />} />
          </Route>
        </Route>
        <Route
          element={<ProtectedRoute allowedRole="factory_super_admin" />}
        >
          <Route element={<FactoryLayout />}>
            <Route path="/factory/dashboard" element={<FactoryDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
