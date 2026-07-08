import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentDetail from './pages/equipment/EquipmentDetail';
import EquipmentForm from './pages/equipment/EquipmentForm';
import Bookings from './pages/Bookings';
import WorkerList from './pages/workers/WorkerList';
import WorkerDetail from './pages/workers/WorkerDetail';
import WorkerProfile from './pages/workers/WorkerProfile';
import HiringRequests from './pages/HiringRequests';
import Predictions from './pages/Predictions';
import FeedbackPage from './pages/FeedbackPage';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminProducts from './pages/admin/AdminProducts';
import ProductList from './pages/marketplace/ProductList';
import ProductDetail from './pages/marketplace/ProductDetail';
import ProductForm from './pages/marketplace/ProductForm';
import MyOrders from './pages/marketplace/MyOrders';
import IncomingOrders from './pages/marketplace/IncomingOrders';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return null;
  }

  const homePath = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={homePath} replace /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Equipment Routes */}
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route
          path="/equipment/new"
          element={
            <ProtectedRoute roles={['EQUIPMENT_OWNER', 'ADMIN']}>
              <EquipmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment/:id/edit"
          element={
            <ProtectedRoute roles={['EQUIPMENT_OWNER', 'ADMIN']}>
              <EquipmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment/mine"
          element={
            <ProtectedRoute roles={['EQUIPMENT_OWNER', 'ADMIN']}>
              <EquipmentList />
            </ProtectedRoute>
          }
        />
        <Route path="/bookings" element={<Bookings />} />

        {/* Worker Routes */}
        <Route path="/workers" element={<WorkerList />} />
        <Route path="/workers/:id" element={<WorkerDetail />} />
        <Route
          path="/workers/me"
          element={
            <ProtectedRoute roles={['WORKER']}>
              <WorkerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-profile"
          element={
            <ProtectedRoute roles={['WORKER']}>
              <WorkerProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/hiring" element={<HiringRequests />} />
        <Route
          path="/workers/hiring/worker"
          element={
            <ProtectedRoute roles={['WORKER']}>
              <HiringRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workers/hiring/farmer"
          element={
            <ProtectedRoute roles={['FARMER']}>
              <HiringRequests />
            </ProtectedRoute>
          }
        />

        {/* Prediction & Feedback */}
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/equipment"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/workers"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminWorkers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />

        {/* Marketplace Routes */}
        <Route path="/marketplace" element={<ProductList />} />
        <Route path="/marketplace/:id" element={<ProductDetail />} />
        <Route
          path="/marketplace/new"
          element={
            <ProtectedRoute roles={['FARMER', 'ADMIN']}>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace/:id/edit"
          element={
            <ProtectedRoute roles={['FARMER', 'ADMIN']}>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace/my"
          element={
            <ProtectedRoute roles={['FARMER', 'ADMIN']}>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={['BUYER', 'FARMER', 'EQUIPMENT_OWNER', 'WORKER', 'ADMIN']}>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incoming-orders"
          element={
            <ProtectedRoute roles={['FARMER', 'ADMIN']}>
              <IncomingOrders />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
