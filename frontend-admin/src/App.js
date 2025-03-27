import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminRoutes from './router/AdminRoutes';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AdminRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
