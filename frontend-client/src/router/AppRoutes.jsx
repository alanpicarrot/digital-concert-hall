import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout imports
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import UserLayout from '../layouts/UserLayout';

// Page imports
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import UserOrdersPage from '../pages/user/UserOrdersPage';
import UserOrderDetailPage from '../pages/user/UserOrderDetailPage';
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import PaymentResultPage from '../pages/payment/PaymentResultPage';
import ConcertsPage from '../pages/concerts/ConcertsPage';
import ConcertDetailPage from '../pages/concerts/ConcertDetailPage';

// Route protection
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 主頁面 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="concerts" element={<ConcertsPage />} />
        <Route path="concerts/:id" element={<ConcertDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        
        {/* 支付相關頁面 */}
        <Route path="checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
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
      
      {/* 未匹配的路由重定向到首頁 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
