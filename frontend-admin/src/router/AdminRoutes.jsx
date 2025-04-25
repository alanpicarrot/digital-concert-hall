import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// 引入管理後台頁面
import DashboardPage from '../pages/DashboardPage';
import ConcertsPage from '../pages/ConcertsPage';
import PerformancesPage from '../pages/PerformancesPage';
import TicketTypesPage from '../pages/TicketTypesPage';
import TicketsPage from '../pages/TicketsPage';
import UsersPage from '../pages/UsersPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterAdminPage from '../pages/auth/RegisterAdminPage';
import NotFoundPage from '../pages/NotFoundPage';

// 引入佈局元件
// import AdminLayout from '../layouts/AdminLayout';
// import AuthLayout from '../layouts/AuthLayout';
// import ProtectedRoute from './ProtectedRoute';

const AdminRoutes = () => (
  <Routes>
    {/* 公開路由 */}
    <Route path="/auth/login" element={<AuthLayout />}>
      <Route index element={<LoginPage />} />
    </Route>

    <Route path="/auth/register-admin" element={<AuthLayout />}>
      <Route index element={<RegisterAdminPage />} />
    </Route>

    {/* 受保護的管理員路由 */}
    <Route element={<ProtectedRoute adminOnly />}>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/concerts" element={<ConcertsPage />} />
        <Route path="/performances" element={<PerformancesPage />} />
        <Route path="/ticket-types" element={<TicketTypesPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AdminRoutes;
