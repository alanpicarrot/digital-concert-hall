import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User, ChevronDown, Music, Ticket, CalendarDays, Video, Mail } from 'lucide-react';

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 頂部導航 */}
      <header className="bg-indigo-900">
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          {/* 左側 Logo */}
          <div>
            <Link to="/" className="flex items-center text-2xl font-bold text-white">
              <Music size={28} className="mr-2" strokeWidth={2} />
              數位音樂廳
            </Link>
          </div>
          
          {/* 右側導航和使用者操作 */}
          <div className="flex items-center space-x-8">
            {/* 主要導航項目 */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="flex items-center text-white hover:text-indigo-300 text-sm font-medium">
                <Music size={16} className="mr-1" />
                首頁
              </Link>
              <Link to="/concerts" className="flex items-center text-white hover:text-indigo-300 text-sm font-medium">
                <CalendarDays size={16} className="mr-1" />
                音樂會
              </Link>
              <Link to="/tickets" className="flex items-center text-white hover:text-indigo-300 text-sm font-medium">
                <Ticket size={16} className="mr-1" />
                購票區
              </Link>
              <Link to="/livestreams" className="flex items-center text-white hover:text-indigo-300 text-sm font-medium">
                <Video size={16} className="mr-1" />
                直播
              </Link>
            </nav>

            {/* 購物車 */}
            <Link to="/cart" className="text-white hover:text-indigo-300">
              <ShoppingCart size={20} />
            </Link>

            {/* 使用者登入/註冊或下拉選單 */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={toggleMenu}
                  className="flex items-center text-white hover:text-indigo-300 text-sm font-medium"
                >
                  <User size={16} className="mr-1" />
                  {user?.username}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <Link 
                        to="/user/profile" 
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        個人資料
                      </Link>
                      <Link 
                        to="/user/orders" 
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        我的訂單
                      </Link>
                      <Link 
                        to="/user/tickets" 
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        我的票券
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
                      >
                        登出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth/login" className="text-white hover:text-indigo-300 text-sm font-medium">登入</Link>
                <Link to="/auth/register" className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-500 text-sm font-medium">註冊</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* 主要內容 */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* 頁腳 */}
      <footer className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">數位音樂廳</h3>
              <p className="text-gray-300 text-sm">
                為您提供最優質的線上音樂會與直播體驗，讓您隨時隨地欣賞世界級表演。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">關於我們</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white text-sm">關於數位音樂廳</Link></li>
                <li><Link to="/artists" className="text-gray-300 hover:text-white text-sm">合作藝術家</Link></li>
                <li><Link to="/press" className="text-gray-300 hover:text-white text-sm">媒體資訊</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white text-sm">聯絡我們</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">幫助中心</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-gray-300 hover:text-white text-sm">常見問題</Link></li>
                <li><Link to="/help" className="text-gray-300 hover:text-white text-sm">購票說明</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white text-sm">服務條款</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white text-sm">隱私政策</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">訂閱電子報</h3>
              <p className="text-gray-300 text-sm mb-4">
                獲取最新音樂會訊息和獨家優惠
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="您的電子郵件"
                  className="px-3 py-2 text-sm rounded-l text-gray-900 flex-grow"
                />
                <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-r text-sm flex items-center">
                  <Mail size={14} className="mr-1" />
                  訂閱
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">© 2025 數位音樂廳. 版權所有.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
