import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 導入頁面組件
import HomePage from '../pages/home/HomePage';
import ConcertDetailPage from '../pages/concerts/ConcertDetailPage';
import TicketDetailPage from '../pages/TicketDetailPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
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
                    {/* 公開路由 */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* 音樂會和票券路由 */}
                    <Route path="/concerts/:concertId" element={<ConcertDetailPage />} />
                    <Route 
                        path="/concerts/:concertId/tickets/:ticketType" 
                        element={<TicketDetailPage />} 
                    />
                    
                    {/* 需要登入的路由 */}
                    <Route 
                        path="/checkout" 
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
            </Routes>
        </ErrorBoundary>
    );
}

export default AppRoutes;
