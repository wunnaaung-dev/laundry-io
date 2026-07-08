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
import CustomerListPage from './pages/customers/customer-list.tsx'
import CustomerFormPage from './pages/customers/customer-form.tsx'
import CustomerDetailPage from './pages/customers/customer-detail.tsx'
import PricingTemplateListPage from './pages/pricing-templates/pricing-template-list.tsx'
import PricingTemplateFormPage from './pages/pricing-templates/pricing-template-form.tsx'
import ContractListPage from './pages/contracts/contract-list.tsx'
import ContractFormPage from './pages/contracts/contract-form.tsx'
import ProfilePage from './pages/profile/profile-page.tsx'
import HotelContractsPage from './pages/contracts/hotel-contracts.tsx'
import HotelOrderListPage from './pages/orders/hotel-order-list.tsx'
import HotelOrderFormPage from './pages/orders/hotel-order-form.tsx'
import HotelOrderDetailPage from './pages/orders/hotel-order-detail.tsx'
import FactoryOrderListPage from './pages/orders/factory-order-list.tsx'
import FactoryOrderDetailPage from './pages/orders/factory-order-detail.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={<ProtectedRoute allowedScopes={['hotel']} />}
        >
          <Route element={<HotelLayout />}>
            <Route path="/hotel/dashboard" element={<HotelDashboard />} />
            <Route path="/hotel/role-levels" element={<RoleLevelListPage />} />
            <Route path="/hotel/role-levels/new" element={<RoleLevelFormPage />} />
            <Route path="/hotel/role-levels/:id/edit" element={<RoleLevelFormPage />} />
            <Route path="/hotel/users" element={<UserListPage />} />
            <Route path="/hotel/users/new" element={<UserFormPage />} />
            <Route path="/hotel/users/:id/edit" element={<UserFormPage />} />
            <Route path="/hotel/profile" element={<ProfilePage />} />
            <Route path="/hotel/contracts" element={<HotelContractsPage />} />
            <Route element={<ProtectedRoute requiredModule="order_management" />}>
              <Route path="/hotel/orders" element={<HotelOrderListPage />} />
              <Route path="/hotel/orders/new" element={<HotelOrderFormPage />} />
              <Route path="/hotel/orders/:id" element={<HotelOrderDetailPage />} />
            </Route>
          </Route>
        </Route>
        <Route
          element={<ProtectedRoute allowedScopes={['factory']} />}
        >
          <Route element={<FactoryLayout />}>
            <Route path="/factory/dashboard" element={<FactoryDashboard />} />
            <Route path="/factory/role-levels" element={<RoleLevelListPage />} />
            <Route path="/factory/role-levels/new" element={<RoleLevelFormPage />} />
            <Route path="/factory/role-levels/:id/edit" element={<RoleLevelFormPage />} />
            <Route path="/factory/users" element={<UserListPage />} />
            <Route path="/factory/users/new" element={<UserFormPage />} />
            <Route path="/factory/users/:id/edit" element={<UserFormPage />} />
            <Route path="/factory/customers" element={<CustomerListPage />} />
            <Route path="/factory/customers/new" element={<CustomerFormPage />} />
            <Route path="/factory/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/factory/customers/:id/edit" element={<CustomerFormPage />} />
            <Route path="/factory/pricing-templates" element={<PricingTemplateListPage />} />
            <Route path="/factory/pricing-templates/new" element={<PricingTemplateFormPage />} />
            <Route path="/factory/pricing-templates/:id/edit" element={<PricingTemplateFormPage />} />
            <Route path="/factory/contracts" element={<ContractListPage />} />
            <Route path="/factory/contracts/new" element={<ContractFormPage />} />
            <Route path="/factory/contracts/:id/edit" element={<ContractFormPage />} />
            <Route element={<ProtectedRoute requiredModule="order_management" />}>
              <Route path="/factory/orders" element={<FactoryOrderListPage />} />
              <Route path="/factory/orders/:id" element={<FactoryOrderDetailPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
