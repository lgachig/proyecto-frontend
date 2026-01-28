import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Providers from './components/Providers';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import AdminSlots from './pages/AdminSlots';
import AdminStatics from './pages/AdminStatics';

import UserDashboard from './pages/UserDashboard';
import UserReservations from './pages/UserReservations';
import UserVehicle from './pages/UserVehicle';

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="slots" element={<AdminSlots />} />
            <Route path="statics" element={<AdminStatics />} />
          </Route>

          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="reservations" element={<UserReservations />} />
            <Route path="vehicle" element={<UserVehicle />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
