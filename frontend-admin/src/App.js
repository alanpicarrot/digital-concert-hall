import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AdminRoutes from './router/AdminRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/">
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <AdminRoutes />
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
