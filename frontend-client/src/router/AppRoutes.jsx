import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import PaymentErrorBoundary from "../components/payment/PaymentErrorBoundary";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Page Imports
import HomePage from "../pages/home/HomePage";
import ConcertsPage from "../pages/concerts/ConcertsPage";
import ConcertDetailPage from "../pages/concerts/ConcertDetailPage";
// Correct the import path for TicketDetailPage
import TicketDetailPage from "../pages/tickets/TicketDetailPage.jsx"; // Renamed from TicketsDetailPage for consistency if needed, or keep as is if correct
import PerformanceTicketsPage from "../pages/tickets/PerformanceTicketsPage";
// Assuming TicketsDetailPage might be a typo or another component, check if it's used.
// If TicketsDetailPage is not used or was a typo for TicketDetailPage, you might remove this line:
// import TicketsDetailPage from '../pages/tickets/TicketsDetailPage';
import CartPage from "../pages/cart/CartPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import UserProfilePage from "../pages/user/UserProfilePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/error/NotFoundPage";

// Payment Pages
import PaymentStep1 from "../pages/payment/steps/PaymentStep1";
import PaymentStep2 from "../pages/payment/steps/PaymentStep2";
import ECPayMockPage from "../pages/payment/ECPayMockPage";
import PaymentResultPage from "../pages/payment/PaymentResultPage";

// Route Components
import PrivateRoute from "./PrivateRoute"; // Ensure this path is correct

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Main Layout Routes */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/concerts" element={<ConcertsPage />} />
          <Route path="/concerts/:id" element={<ConcertDetailPage />} />
          {/* Ensure this route uses the correct component and path */}
          <Route
            path="/tickets/performance/:id"
            element={<PerformanceTicketsPage />}
          />
          {/* Updated route for TicketDetailPage */}
          <Route
            path="/tickets/:performanceId/:ticketId"
            element={<TicketDetailPage />}
          />
          {/* Redirect for spring concert */}
          <Route
            path="/spring-concert"
            element={<Navigate to="/concerts/1" replace />}
          />
          <Route path="/cart" element={<CartPage />} />

          {/* Protected Routes */}
          <Route
            path="/checkout/:orderNumber"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />

          {/* Payment Routes - 使用專門的錯誤邊界 */}
          <Route
            path="/payment/*"
            element={
              <PaymentErrorBoundary>
                <Routes>
                  {/* Payment Steps Routes */}
                  <Route
                    path="steps/order"
                    element={
                      <PrivateRoute>
                        <PaymentStep1 />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="steps/payment"
                    element={
                      <PrivateRoute>
                        <PaymentStep2 />
                      </PrivateRoute>
                    }
                  />

                  {/* ECPay Mock Page - 模擬綠界支付頁面 */}
                  <Route
                    path="ecpay"
                    element={
                      <PrivateRoute>
                        <ECPayMockPage />
                      </PrivateRoute>
                    }
                  />

                  {/* Payment Result Page - 付款結果頁面 */}
                  <Route
                    path="result"
                    element={
                      <PrivateRoute>
                        <PaymentResultPage />
                      </PrivateRoute>
                    }
                  />

                  {/* Payment 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </PaymentErrorBoundary>
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
          {/* Add routes for user tickets if they exist */}
          {/* Example:
                     <Route
                        path="/user/tickets"
                        element={
                            <PrivateRoute>
                                <UserTicketsPage />
                            </PrivateRoute>
                        }
                     />
                     <Route
                        path="/user/tickets/:ticketId"
                        element={
                            <PrivateRoute>
                                <UserTicketDetailPage />
                            </PrivateRoute>
                        }
                     />
                     */}
        </Route>

        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Keep consistent auth paths */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Route>

        {/* 404 Page for unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
