import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 引入管理後台頁面
import DashboardPage from '../pages/DashboardPage';
import ConcertsPage from '../pages/ConcertsPage';
import PerformancesPage from '../pages/PerformancesPage';
import TicketTypesPage from '../pages/TicketTypesPage';
import TicketsPage from '../pages/TicketsPage';
import UsersPage from '../pages/UsersPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterAdminPage from '../pages/auth/RegisterAdminPage';

// 引入佈局元件
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// 權限控制HOC
// import AdminRoute from './AdminRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* 管理後台頁面 */}
      <Route path="/" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="concerts" element={<ConcertsPage />} />
        <Route path="performances" element={<PerformancesPage />} />
        <Route path="ticket-types" element={<TicketTypesPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>
      
      {/* 登入頁面 */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register-admin" element={<RegisterAdminPage />} />
      </Route>
      
      {/* 未匹配的路由重定向到登入頁面 */}
      <Route path="*" element={<Navigate to="/auth/login" />} />
    </Routes>
  );
};

export default AdminRoutes;