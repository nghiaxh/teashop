import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerRoute from './components/ManagerRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import { Spinner } from '@heroui/react';

import Login from './pages/Login';
import NotFound from './pages/NotFound';
import StaffDashboard from './pages/staff/Dashboard';
import CreateOrder from './pages/staff/CreateOrder';
import OrderHistory from './pages/staff/OrderHistory';
import AttendanceHistory from './pages/staff/AttendanceHistory';
import Profile from './pages/staff/Profile';

import ManagerDashboard from './pages/manager/Dashboard';
import MenuManagement from './pages/manager/MenuManagement';
import InventoryManagement from './pages/manager/InventoryManagement';
import AccountManagement from './pages/manager/AccountManagement';
import AttendanceManagement from './pages/manager/AttendanceManagement';
import Reports from './pages/manager/Reports';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageTransition><StaffDashboard /></PageTransition>} />
          <Route path="orders/new" element={<PageTransition><CreateOrder /></PageTransition>} />
          <Route path="orders/history" element={<PageTransition><OrderHistory /></PageTransition>} />
          <Route path="attendance/history" element={<PageTransition><AttendanceHistory /></PageTransition>} />
          <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />

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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AnimatedRoutes />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
