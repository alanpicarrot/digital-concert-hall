import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminRoutes from './router/AdminRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AdminRoutes />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
