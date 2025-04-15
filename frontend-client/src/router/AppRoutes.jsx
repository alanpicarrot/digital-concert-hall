import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 導入布局組件
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// 導入頁面組件
import HomePage from '../pages/home/HomePage';
import ConcertDetailPage from '../pages/concerts/ConcertDetailPage';
import ConcertsPage from '../pages/concerts/ConcertsPage';
import TicketDetailPage from '../pages/TicketDetailPage';
import PerformanceTicketsPage from '../pages/tickets/PerformanceTicketsPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import CartPage from '../pages/cart/CartPage';
import UserProfilePage from '../pages/user/UserProfilePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// 導入錯誤邊界和保護路由
import ErrorBoundary from '../components/ui/ErrorBoundary';
import PrivateRoute from './PrivateRoute';

function AppRoutes() {
    return (
        <ErrorBoundary>
            <Routes>
                {/* 主頁面布局 */}
                <Route element={<MainLayout />}>
                    {/* 公開路由 */}
                    <Route path="/" element={<HomePage />} />
                    
                    {/* 音樂會和票券路由 */}
                    <Route path="/concerts" element={<ConcertsPage />} />
                    <Route path="/concerts/:id" element={<ConcertDetailPage />} />
                    <Route path="/concerts/:concertId/tickets/:ticketType" element={<TicketDetailPage />} />
                    {/* 票券演出場次路由 */}
                    <Route path="/tickets/performance/:id" element={<PerformanceTicketsPage />} />
                    {/* 定向給 ID=1 的的春季交響音樂會 */}
                    <Route path="/spring-concert" element={<Navigate to="/concerts/1" replace />} />
                    
                    {/* 購物車路由 */}
                    <Route path="/cart" element={<CartPage />} />
                    
                    {/* 需要登入的路由 */}
                    <Route 
                        path="/checkout/:orderNumber" 
                        element={
                            <PrivateRoute>
                                <CheckoutPage />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={
                            <PrivateRoute>
                                <UserProfilePage />
                            </PrivateRoute>
                        } 
                    />
                </Route>
                
                {/* 認證相關頁面 */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
                
                {/* 舊路徑重定向 */}
                <Route path="/auth/login" element={<Navigate to="/login" replace />} />
                <Route path="/auth/register" element={<Navigate to="/register" replace />} />
            </Routes>
        </ErrorBoundary>
    );
}

export default AppRoutes;
