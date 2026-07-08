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
import RoleLevelListPage from './pages/role-levels/role-level-list.tsx'
import RoleLevelFormPage from './pages/role-levels/role-level-form.tsx'
import UserListPage from './pages/users/user-list.tsx'
import UserFormPage from './pages/users/user-form.tsx'

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
            <Route path="/hotel/role-levels" element={<RoleLevelListPage />} />
            <Route path="/hotel/role-levels/new" element={<RoleLevelFormPage />} />
            <Route path="/hotel/role-levels/:id/edit" element={<RoleLevelFormPage />} />
            <Route path="/hotel/users" element={<UserListPage />} />
            <Route path="/hotel/users/new" element={<UserFormPage />} />
            <Route path="/hotel/users/:id/edit" element={<UserFormPage />} />
          </Route>
        </Route>
        <Route
          element={<ProtectedRoute allowedRole="factory_super_admin" />}
        >
          <Route element={<FactoryLayout />}>
            <Route path="/factory/dashboard" element={<FactoryDashboard />} />
            <Route path="/factory/role-levels" element={<RoleLevelListPage />} />
            <Route path="/factory/role-levels/new" element={<RoleLevelFormPage />} />
            <Route path="/factory/role-levels/:id/edit" element={<RoleLevelFormPage />} />
            <Route path="/factory/users" element={<UserListPage />} />
            <Route path="/factory/users/new" element={<UserFormPage />} />
            <Route path="/factory/users/:id/edit" element={<UserFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
