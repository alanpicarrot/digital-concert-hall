import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 sm:px-6 lg:px-8" style={{ paddingTop: '15vh' }}>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            數位音樂廳管理後台
          </h2>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
