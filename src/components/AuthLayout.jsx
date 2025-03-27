import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Music } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 簡化的頁首 */}
      <header className="bg-indigo-900 text-white p-4">
        <div className="container mx-auto">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <Music className="mr-2" size={24} />
            數位音樂廳
          </Link>
        </div>
      </header>
      
      {/* 主要內容 */}
      <main className="flex-grow py-12">
        <Outlet />
      </main>
      
      {/* 簡化的頁尾 */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 數位音樂廳. 版權所有.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="text-gray-400 hover:text-white">
              使用條款
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white">
              隱私政策
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-white">
              聯絡我們
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
