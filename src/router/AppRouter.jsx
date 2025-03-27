import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 引入頁面元件
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import UserOrdersPage from '../pages/user/UserOrdersPage';
import UserOrderDetailPage from '../pages/user/UserOrderDetailPage';
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import PaymentResultPage from '../pages/payment/PaymentResultPage';

// 引入管理後台頁面
import DashboardPage from '../pages/admin/DashboardPage';
import ConcertsPage from '../pages/admin/ConcertsPage';
import PerformancesPage from '../pages/admin/PerformancesPage';
import TicketTypesPage from '../pages/admin/TicketTypesPage';
import TicketsPage from '../pages/admin/TicketsPage';

// 引入佈局元件
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// 權限控制HOC
import PrivateRoute from './PrivateRoute';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* 主頁面 */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cart" element={<CartPage />} />
          
          {/* 支付相關頁面 */}
          <Route path="checkout/:orderNumber" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="payment/result" element={<PaymentResultPage />} />
        </Route>
        
        {/* 用戶相關頁面 */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="orders" element={<PrivateRoute><UserOrdersPage /></PrivateRoute>} />
          <Route path="orders/:orderNumber" element={<PrivateRoute><UserOrderDetailPage /></PrivateRoute>} />
        </Route>
        
        {/* 登入註冊頁面 */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        
        {/* 管理後台頁面 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="concerts" element={<ConcertsPage />} />
          <Route path="performances" element={<PerformancesPage />} />
          <Route path="ticket-types" element={<TicketTypesPage />} />
          <Route path="tickets" element={<TicketsPage />} />
        </Route>
        
        {/* 未匹配的路由重定向到首頁 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
