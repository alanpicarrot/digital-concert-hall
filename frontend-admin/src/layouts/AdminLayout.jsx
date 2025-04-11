import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../services/authService';
import { Menu, X, LogOut, Home, Music, Calendar, Ticket, UserCheck } from 'lucide-react';

const AdminLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 每次渲染時檢查認證狀態
  useEffect(() => {
    // 延遲檢查，避免在路由切換過程中高頻率觸發
    const timer = setTimeout(() => {
      const checkAuth = () => {
        if (!AuthService.isAdminAuthenticated()) {
          console.log('管理面板檢測到無效登入狀態，重定向到登入頁面');
          logout();
          navigate('/auth/login');
        } else {
          console.log('管理員權限驗證通過');
        }
      };

      checkAuth();
    }, 300); // 300ms 延遲，避免頂端重定向

    return () => clearTimeout(timer);
  }, [logout, navigate, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 側邊欄 - 移動版 */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200'}`} onClick={() => setSidebarOpen(false)}></div>
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-teal-800 transition ease-in-out duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">關閉側邊欄</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-white text-2xl font-bold">數位音樂廳後台</span>
          </div>
          
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              <Link to="/dashboard" className="text-white group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-teal-700">
                <Home className="mr-3 h-6 w-6" />
                儀表板
              </Link>
              <Link to="/concerts" className="text-white group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-teal-700">
                <Music className="mr-3 h-6 w-6" />
                音樂會管理
              </Link>
              <Link to="/performances" className="text-white group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-teal-700">
                <Calendar className="mr-3 h-6 w-6" />
                演出場次管理
              </Link>
              <Link to="/ticket-types" className="text-white group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-teal-700">
                <Ticket className="mr-3 h-6 w-6" />
                票種管理
              </Link>
              <Link to="/tickets" className="text-white group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-teal-700">
                <Ticket className="mr-3 h-6 w-6" />
                票券管理
              </Link>
              <Link to="/users" className="text-white group flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-teal-700">
                <UserCheck className="mr-3 h-6 w-6" />
                用戶管理
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14"></div>
      </div>

      {/* 側邊欄 - 桌面版 */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-teal-800">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-teal-900">
              <span className="text-white text-xl font-bold">數位音樂廳後台</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                <Link to="/dashboard" className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-teal-700">
                  <Home className="mr-3 h-6 w-6" />
                  儀表板
                </Link>
                <Link to="/concerts" className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-teal-700">
                  <Music className="mr-3 h-6 w-6" />
                  音樂會管理
                </Link>
                <Link to="/performances" className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-teal-700">
                  <Calendar className="mr-3 h-6 w-6" />
                  演出場次管理
                </Link>
                <Link to="/ticket-types" className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-teal-700">
                  <Ticket className="mr-3 h-6 w-6" />
                  票種管理
                </Link>
                <Link to="/tickets" className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-teal-700">
                  <Ticket className="mr-3 h-6 w-6" />
                  票券管理
                </Link>
                <Link to="/users" className="text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-teal-700">
                  <UserCheck className="mr-3 h-6 w-6" />
                  用戶管理
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* 主要內容區域 */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">開啟側邊欄</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                管理後台
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <div className="relative flex items-center">
                  <span className="hidden md:inline-block text-gray-700 mr-3">
                    {user?.username || '管理員'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-teal-100 p-1 rounded-full text-teal-800 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
                  >
                    <LogOut className="h-6 w-6" />
                    <span className="ml-2 hidden md:inline-block">登出</span>
                  </button>
                </div>
              ) : (
                <div className="relative flex items-center">
                  <Link to="/auth/login"
                    className="bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center px-4 py-2 font-medium"
                  >
                    <span>登入</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 頁面內容 */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
