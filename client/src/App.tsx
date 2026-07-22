import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerRoute from './components/ManagerRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import { Spinner } from '@heroui/react';

import Login from './pages/Login';
import StaffDashboard from './pages/staff/Dashboard';
import CreateOrder from './pages/staff/CreateOrder';
import OrderHistory from './pages/staff/OrderHistory';
import AttendanceHistory from './pages/staff/AttendanceHistory';

import ManagerDashboard from './pages/manager/Dashboard';
import MenuManagement from './pages/manager/MenuManagement';
import InventoryManagement from './pages/manager/InventoryManagement';
import AccountManagement from './pages/manager/AccountManagement';
import AttendanceManagement from './pages/manager/AttendanceManagement';
import Reports from './pages/manager/Reports';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="orders/new" element={<CreateOrder />} />
        <Route path="orders/history" element={<OrderHistory />} />
        <Route path="attendance/history" element={<AttendanceHistory />} />

        <Route
          path="manager"
          element={
            <ManagerRoute>
              <ManagerDashboard />
            </ManagerRoute>
          }
        />
        <Route
          path="manager/menu"
          element={
            <ManagerRoute>
              <MenuManagement />
            </ManagerRoute>
          }
        />
        <Route
          path="manager/inventory"
          element={
            <ManagerRoute>
              <InventoryManagement />
            </ManagerRoute>
          }
        />
        <Route
          path="manager/accounts"
          element={
            <ManagerRoute>
              <AccountManagement />
            </ManagerRoute>
          }
        />
        <Route
          path="manager/attendance"
          element={
            <ManagerRoute>
              <AttendanceManagement />
            </ManagerRoute>
          }
        />
        <Route
          path="manager/reports"
          element={
            <ManagerRoute>
              <Reports />
            </ManagerRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
