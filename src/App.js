import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// 佈局組件
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import DataProvider, { useData } from "./components/DataProvider";

// 身份驗證組件
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./components/auth/Profile";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// 頁面組件
import HomePage from "./pages/HomePage";
import ConcertsPage from "./pages/ConcertsPage";
import ConcertDetailPage from "./pages/ConcertDetailPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import LivestreamsPage from "./pages/LivestreamsPage";
import LivestreamPage from "./pages/LivestreamPage";
import NotFoundPage from "./pages/NotFoundPage";
import TestUsersPage from "./pages/TestUsersPage"; // 導入測試用戶頁面
import TestAuthPage from "./pages/TestAuthPage"; // 導入身份驗證測試頁面

// 會員相關頁面
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// 訂單和票券頁面
import MyOrdersPage from "./pages/orders/MyOrdersPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import MyTicketsPage from "./pages/tickets/MyTicketsPage";
import TicketDetailPage from "./pages/tickets/TicketDetailPage";

// 購物車和結帳頁面
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import PaymentResultPage from "./pages/payment/PaymentResultPage";

// 數據消費者組件，用於向頁面傳遞數據
const HomePageWithData = () => {
  const { upcomingConcerts, pastConcerts } = useData();
  return <HomePage upcomingConcerts={upcomingConcerts} pastConcerts={pastConcerts} />;
};

const ConcertsPageWithData = () => {
  const { upcomingConcerts, pastConcerts } = useData();
  return <ConcertsPage upcomingConcerts={upcomingConcerts} pastConcerts={pastConcerts} />;
};

const ConcertDetailPageWithData = () => {
  const { upcomingConcerts, pastConcerts } = useData();
  return <ConcertDetailPage upcomingConcerts={upcomingConcerts} pastConcerts={pastConcerts} />;
};

const ArtistsPageWithData = () => {
  const { artists } = useData();
  return <ArtistsPage artists={artists} />;
};

const ArtistDetailPageWithData = () => {
  const { artists, upcomingConcerts, pastConcerts } = useData();
  return <ArtistDetailPage artists={artists} upcomingConcerts={upcomingConcerts} pastConcerts={pastConcerts} />;
};

const LivestreamsPageWithData = () => {
  const { livestreams } = useData();
  return <LivestreamsPage livestreams={livestreams} />;
};

const LivestreamPageWithData = () => {
  const { livestreams } = useData();
  return <LivestreamPage livestreams={livestreams} />;
};

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          {/* 需要共用布局的頁面 */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePageWithData />} />
            <Route path="/concerts" element={<ConcertsPageWithData />} />
            <Route path="/concert/:id" element={<ConcertDetailPageWithData />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/artists" element={<ArtistsPageWithData />} />
            <Route path="/artist/:id" element={<ArtistDetailPageWithData />} />
            <Route path="/livestreams" element={<LivestreamsPageWithData />} />
            <Route path="/livestream/:id" element={<LivestreamPageWithData />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/:orderNumber" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/payment/result" element={<PaymentResultPage />} />
            <Route path="/user/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/user/orders/:orderNumber" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/user/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
            <Route path="/user/tickets/:ticketId" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
            <Route path="/test-users" element={<TestUsersPage />} />
            <Route path="/test-auth" element={<TestAuthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          
          {/* 授權頁面，使用AuthLayout組件 */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
