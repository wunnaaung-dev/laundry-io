import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import FactoryReceivingPage from './pages/receiving/factory-receiving.tsx'
import FactoryDispatchPage from './pages/dispatch/factory-dispatch.tsx'
import RoutePlanningListPage from './pages/dispatch/route-planning-list.tsx'
import RoutePlanningFormPage from './pages/dispatch/route-planning-form.tsx'
import RoutePlanningDetailPage from './pages/dispatch/route-planning-detail.tsx'
import LoadSheetPage from './pages/dispatch/load-sheet.tsx'
import DriverSchedulePage from './pages/dispatch/driver-schedule.tsx'
import LiveTrackingPage from './pages/dispatch/live-tracking.tsx'
import StopTimelinePage from './pages/dispatch/stop-timeline.tsx'
import ChangeRequestsPage from './pages/dispatch/change-requests.tsx'
import ReportingDashboardPage from './pages/dispatch/reporting-dashboard.tsx'
import DriverKPIPage from './pages/dispatch/driver-kpi.tsx'
import WarehouseDashboardPage from './pages/warehouse/warehouse-dashboard.tsx'
import WarehouseInventoryPage from './pages/warehouse/warehouse-inventory.tsx'
import WarehouseInventoryFormPage from './pages/warehouse/warehouse-inventory-form.tsx'
import WarehouseReceivingPage from './pages/warehouse/warehouse-receiving.tsx'
import WarehouseReceivingFormPage from './pages/warehouse/warehouse-receiving-form.tsx'
import WarehouseReturnsPage from './pages/warehouse/warehouse-returns.tsx'
import WarehouseEquipmentPage from './pages/warehouse/warehouse-equipment.tsx'
import WarehouseEquipmentFormPage from './pages/warehouse/warehouse-equipment-form.tsx'
import WarehouseStoragePage from './pages/warehouse/warehouse-storage.tsx'
import WarehouseZoneDetailPage from './pages/warehouse/warehouse-zone-detail.tsx'
import WarehouseTransactionsPage from './pages/warehouse/warehouse-transactions.tsx'
import WarehouseProductionPage from './pages/warehouse/warehouse-production.tsx'
import WarehouseListPage from './pages/warehouse/warehouse-list.tsx'
import WarehouseFormPage from './pages/warehouse/warehouse-form.tsx'
import WarehouseDetailPage from './pages/warehouse/warehouse-detail.tsx'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'
import HotelWarehouseDashboard from './pages/hotel-warehouse/hotel-warehouse-dashboard.tsx'
import HotelLinenInventory from './pages/hotel-warehouse/linen-inventory.tsx'
import HotelLinenScan from './pages/hotel-warehouse/linen-scan.tsx'
import HotelParLevels from './pages/hotel-warehouse/par-levels.tsx'
import HotelStandingOrders from './pages/hotel-warehouse/standing-orders.tsx'
import HotelRejectLog from './pages/hotel-warehouse/reject-log.tsx'
import HotelStoragePage from './pages/hotel-warehouse/hotel-storage.tsx'
import HotelZoneDetailPage from './pages/hotel-warehouse/hotel-zone-detail.tsx'
import HotelMovementLogPage from './pages/hotel-warehouse/hotel-movement-log.tsx'
import DriverLayout from './layouts/driver-layout.tsx'
import DriverDashboard from './pages/driver/driver-dashboard.tsx'
import DriverTasks from './pages/driver/driver-tasks.tsx'
import DriverScan from './pages/driver/driver-scan.tsx'
import DriverDeliveryProof from './pages/driver/driver-delivery-proof.tsx'
import DriverProfile from './pages/driver/driver-profile.tsx'
import DriverManagementListPage from './pages/drivers/driver-management-list.tsx'
import DriverManagementFormPage from './pages/drivers/driver-management-form.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
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
            <Route path="/hotel/warehouse" element={<HotelWarehouseDashboard />} />
            <Route path="/hotel/warehouse/linen-inventory" element={<HotelLinenInventory />} />
            <Route path="/hotel/warehouse/linen-scan" element={<HotelLinenScan />} />
            <Route path="/hotel/warehouse/par-levels" element={<HotelParLevels />} />
            <Route path="/hotel/warehouse/standing-orders" element={<HotelStandingOrders />} />
            <Route path="/hotel/warehouse/reject-log" element={<HotelRejectLog />} />
            <Route path="/hotel/warehouse/storage" element={<HotelStoragePage />} />
            <Route path="/hotel/warehouse/storage/movements" element={<HotelMovementLogPage />} />
            <Route path="/hotel/warehouse/zones/:zoneId" element={<HotelZoneDetailPage />} />
          </Route>
        </Route>
        <Route
          element={<ProtectedRoute allowedScopes={['factory']} />}
        >
          <Route element={<FactoryLayout />}>
            <Route path="/factory/dashboard" element={<FactoryDashboard />} />
            <Route path="/factory/receiving" element={<FactoryReceivingPage />} />
            <Route path="/factory/dispatch" element={<FactoryDispatchPage />} />
            <Route path="/factory/dispatch/routes" element={<RoutePlanningListPage />} />
            <Route path="/factory/dispatch/routes/new" element={<RoutePlanningFormPage />} />
            <Route path="/factory/dispatch/routes/:id" element={<RoutePlanningDetailPage />} />
            <Route path="/factory/dispatch/routes/:id/edit" element={<RoutePlanningFormPage />} />
            <Route path="/factory/dispatch/routes/:routeId/load-sheet" element={<LoadSheetPage />} />
            <Route path="/factory/dispatch/driver-schedule" element={<DriverSchedulePage />} />
            <Route path="/factory/dispatch/live-tracking" element={<LiveTrackingPage />} />
            <Route path="/factory/dispatch/routes/:routeId/timeline" element={<StopTimelinePage />} />
            <Route path="/factory/dispatch/change-requests" element={<ChangeRequestsPage />} />
            <Route path="/factory/dispatch/reports" element={<ReportingDashboardPage />} />
            <Route path="/factory/dispatch/driver-kpi" element={<DriverKPIPage />} />
            <Route path="/factory/drivers" element={<DriverManagementListPage />} />
            <Route path="/factory/drivers/new" element={<DriverManagementFormPage />} />
            <Route path="/factory/drivers/:id/edit" element={<DriverManagementFormPage />} />
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
            <Route element={<ProtectedRoute requiredModule="warehouse" />}>
              <Route path="/factory/warehouse" element={<WarehouseDashboardPage />} />
              <Route path="/factory/warehouse/manage" element={<WarehouseListPage />} />
              <Route path="/factory/warehouse/manage/new" element={<WarehouseFormPage />} />
              <Route path="/factory/warehouse/manage/:id" element={<WarehouseDetailPage />} />
              <Route path="/factory/warehouse/manage/:id/edit" element={<WarehouseFormPage />} />
              <Route path="/factory/warehouse/inventory" element={<WarehouseInventoryPage />} />
              <Route path="/factory/warehouse/inventory/new" element={<WarehouseInventoryFormPage />} />
              <Route path="/factory/warehouse/inventory/:id/edit" element={<WarehouseInventoryFormPage />} />
              <Route path="/factory/warehouse/receiving" element={<WarehouseReceivingPage />} />
              <Route path="/factory/warehouse/receiving/new" element={<WarehouseReceivingFormPage />} />
              <Route path="/factory/warehouse/returns" element={<WarehouseReturnsPage />} />
              <Route path="/factory/warehouse/equipment" element={<WarehouseEquipmentPage />} />
              <Route path="/factory/warehouse/equipment/new" element={<WarehouseEquipmentFormPage />} />
              <Route path="/factory/warehouse/equipment/:id/edit" element={<WarehouseEquipmentFormPage />} />
              <Route path="/factory/warehouse/storage" element={<WarehouseStoragePage />} />
              <Route path="/factory/warehouse/zones/:zoneId" element={<WarehouseZoneDetailPage />} />
              <Route path="/factory/warehouse/transactions" element={<WarehouseTransactionsPage />} />
              <Route path="/factory/warehouse/production" element={<WarehouseProductionPage />} />
            </Route>
          </Route>
        </Route>
        <Route
          element={<ProtectedRoute allowedScopes={['driver']} />}
        >
          <Route element={<DriverLayout />}>
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/tasks" element={<DriverTasks />} />
            <Route path="/driver/scan" element={<DriverScan />} />
            <Route path="/driver/scan/:orderId" element={<DriverScan />} />
            <Route path="/driver/delivery-proof/:orderId" element={<DriverDeliveryProof />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
            <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>,
)
