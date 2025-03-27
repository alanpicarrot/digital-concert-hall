import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 引入管理後台頁面
import DashboardPage from '../pages/DashboardPage';
import ConcertsPage from '../pages/ConcertsPage';
import PerformancesPage from '../pages/PerformancesPage';
import TicketTypesPage from '../pages/TicketTypesPage';
import TicketsPage from '../pages/TicketsPage';
import LoginPage from '../pages/auth/LoginPage';

// 引入佈局元件
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// 權限控制HOC
import AdminRoute from './AdminRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* 管理後台頁面 */}
      <Route path="/" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="concerts" element={<AdminRoute><ConcertsPage /></AdminRoute>} />
        <Route path="performances" element={<AdminRoute><PerformancesPage /></AdminRoute>} />
        <Route path="ticket-types" element={<AdminRoute><TicketTypesPage /></AdminRoute>} />
        <Route path="tickets" element={<AdminRoute><TicketsPage /></AdminRoute>} />
        <Route index element={<Navigate to="/dashboard" />} />
      </Route>
      
      {/* 登入頁面 */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
      </Route>
      
      {/* 未匹配的路由重定向到登入頁面 */}
      <Route path="*" element={<Navigate to="/auth/login" />} />
    </Routes>
  );
};

export default AdminRoutes;
