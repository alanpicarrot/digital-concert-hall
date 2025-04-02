import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Music } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 頂部導航 - 使用與MainLayout相似的樣式 */}
      <header className="bg-indigo-900">
        <div className="container mx-auto px-8 py-4">
          <Link to="/" className="flex items-center text-2xl font-bold text-white">
            <Music size={28} className="mr-2" strokeWidth={2} />
            數位音樂廳
          </Link>
        </div>
      </header>
      
      {/* 主要內容 */}
      <main className="flex-grow bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Outlet />
        </div>
      </main>
      
      {/* 簡化版頁腳，但保持相同的顏色主題 */}
      <footer className="bg-indigo-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300 text-sm">© 2025 數位音樂廳. 版權所有.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
