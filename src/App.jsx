import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { initParkingRealtime } from './realtime/parkingRealtime';

import Providers from './components/Providers';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import AdminDashboard from './pages/admin/dashboard';
import AdminReports from './pages/admin/reports/ReportsPage';
import AdminSlots from './pages/admin/slots/SlotsPage';
import AdminStatics from './pages/admin/statistics';

import UserDashboard from './pages/user/dashboard/UserDashboard';
import UserReservations from './pages/user/reservations/UserReservationsPage';
import UserVehicle from './pages/user/vehicle/UserVehiclePage';



export default function App() {
  useEffect(() => {
    initParkingRealtime();
  }, []);
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