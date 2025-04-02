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
import UserTicketsPage from '../pages/user/UserTicketsPage';
import UserTicketDetailPage from '../pages/user/UserTicketDetailPage';
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import PaymentResultPage from '../pages/payment/PaymentResultPage';
import ECPayMockPage from '../pages/payment/ECPayMockPage';
import ConcertsPage from '../pages/concerts/ConcertsPage';
import ConcertDetailPage from '../pages/concerts/ConcertDetailPage';
import DevToolsPage from '../pages/developer/DevToolsPage';

// Route protection
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  // 根據路徑設置測試UI標誌
  React.useEffect(() => {
    const hideTestUIOnPages = (pathname) => {
      if (pathname.includes('/user/') && !pathname.includes('/payment/')) {
        document.body.classList.add('hide-test-ui');
      } else if (pathname.includes('/payment/ecpay') || pathname.includes('/checkout')) {
        document.body.classList.remove('hide-test-ui');
      }
    };
    
    // 當前路徑處理
    hideTestUIOnPages(window.location.pathname);
    
    // 監聽路由變化
    const handleRouteChange = () => {
      hideTestUIOnPages(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('pushstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('pushstate', handleRouteChange);
    };
  }, []);
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
        <Route path="payment/ecpay" element={<ECPayMockPage />} />
        
        {/* 開發者工具頁面 - 僅在開發環境中可見 */}
        {process.env.NODE_ENV === 'development' && (
          <Route path="developer/tools" element={<DevToolsPage />} />
        )}
      </Route>
      
      {/* 用戶相關頁面 */}
      <Route path="/user" element={<UserLayout />}>
        <Route path="orders" element={<PrivateRoute><UserOrdersPage /></PrivateRoute>} />
        <Route path="orders/:orderNumber" element={<PrivateRoute><UserOrderDetailPage /></PrivateRoute>} />
        <Route path="tickets" element={<PrivateRoute><UserTicketsPage /></PrivateRoute>} />
        <Route path="tickets/:ticketId" element={<PrivateRoute><UserTicketDetailPage /></PrivateRoute>} />
      </Route>
      
      {/* 登入註冊頁面 */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      
      {/* 支援舊路徑，避免已存在的連結失效 */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      
      {/* 未匹配的路由重定向到首頁 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;