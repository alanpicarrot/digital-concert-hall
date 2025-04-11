import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ConcertsPage from "./pages/concerts/ConcertsPage";
import ConcertDetailPage from "./pages/concerts/ConcertDetailPage";
import TicketingPage from "./pages/tickets/TicketingPage";
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
          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <TicketingPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AppInitializer>
  );
}

export default App;
