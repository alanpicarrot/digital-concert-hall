import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router/AppRoutes.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;