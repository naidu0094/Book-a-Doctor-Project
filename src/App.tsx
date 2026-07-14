import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard pages
import PatientDashboard from './pages/dashboard/PatientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import DoctorAppointmentsPage from './pages/dashboard/DoctorAppointmentsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import ReportsPage from './pages/dashboard/ReportsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import PatientsPage from './pages/dashboard/PatientsPage';
import PrescriptionsPage from './pages/dashboard/PrescriptionsPage';
import EarningsPage from './pages/dashboard/EarningsPage';
import AvailabilityPage from './pages/dashboard/AvailabilityPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            </Route>

            {/* Auth routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Patient dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['patient']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Doctor dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['doctor']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="prescriptions" element={<PrescriptionsPage />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="availability" element={<AvailabilityPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Admin dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}
