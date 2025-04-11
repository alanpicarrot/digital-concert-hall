import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

/**
 * AppInitializer component ensures the application has the necessary data
 * It performs a health check and seeds initial data if needed
 */
const AppInitializer = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing application...');
        
        // First check if API is accessible
        try {
          const healthCheck = await axios.get(`${API_URL}/api/concerts/health-check`);
          console.log('API Health check:', healthCheck.data);
        } catch (healthError) {
          console.warn('API health check failed:', healthError.message);
          // Continue anyway, as the data seeding endpoint might still work
        }
        
        // Check and seed data if needed
        try {
          console.log('Checking and seeding data...');
          const seedResponse = await axios.get(`${API_URL}/api/concerts/check-and-seed`);
          console.log('Data check result:', seedResponse.data);
        } catch (seedError) {
          console.error('Data seeding failed:', seedError.message);
          // We'll continue even if seeding fails, as the app might still work with existing data
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Application initialization error:', error);
        setError(error.message || 'Failed to initialize application');
        // Still mark as initialized to avoid blocking the app
        setInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Simple loading indicator while initializing
  if (!initialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show error message if initialization failed
  if (error) {
    console.warn('App continuing despite initialization error:', error);
    // We don't block the app here, just continue and let the individual components handle errors
  }

  // Once initialized, render the children
  return <>{children}</>;
};

export default AppInitializer;
