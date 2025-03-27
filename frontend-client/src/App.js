import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
