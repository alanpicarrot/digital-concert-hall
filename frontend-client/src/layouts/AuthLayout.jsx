import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頂部導航 - 精簡版 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Link to="/" className="text-2xl font-bold text-indigo-600">數位音樂廳</Link>
        </div>
      </header>
      
      {/* 主要內容 */}
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <Outlet />
        </div>
      </main>
      
      {/* 頁腳 - 精簡版 */}
      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 數位音樂廳. 版權所有.
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
