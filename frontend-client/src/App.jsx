import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ConcertsPage from "./pages/concerts/ConcertsPage";
import ConcertDetailPage from "./pages/concerts/ConcertDetailPage";
import TicketDetailPage from "./pages/tickets/TicketDetailPage.jsx"; // 使用新的票券詳情頁
import PrivateRoute from "./components/auth/PrivateRoute";
import AppInitializer from "./components/AppInitializer";

function App() {
  return (
    <AppInitializer>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/concerts" replace />} />
          <Route path="/concerts" element={<ConcertsPage />} />
          <Route path="/concerts/:id" element={<ConcertDetailPage />} />
          <Route path="/spring-concert" element={<Navigate to="/concerts/1" replace />} />

          {/* Protected Routes */}
          {/* 更新後的票券詳情頁路由 */}
          <Route
            path="/tickets/:performanceId/:ticketId" // 新的路由格式
            element={
              <PrivateRoute>
                <TicketDetailPage />
              </PrivateRoute>
            }
          />
          {/* 舊的路由已被移除 */}
        </Routes>
      </Router>
    </AppInitializer>
  );
}

export default App;
