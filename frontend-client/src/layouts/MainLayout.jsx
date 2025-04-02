import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User, ChevronDown, Music, Ticket, CalendarDays, Video, Mail } from 'lucide-react';
import cartService from '../services/cartService';

const MainLayout = () => {
  const { isAuthenticated, user, logout, updateAuthState } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [cartItemsCount, setCartItemsCount] = useState(0);

  // 載入購物車數據並監聽更新
  useEffect(() => {
    // 初始載入購物車數量
    const cart = cartService.getCart();
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    setCartItemsCount(itemCount);
    
    // 監聽購物車變化
    const handleCartChange = () => {
      const updatedCart = cartService.getCart();
      const updatedCount = updatedCart.items.reduce((total, item) => total + item.quantity, 0);
      setCartItemsCount(updatedCount);
    };
    
    // 監聽自定義的購物車更新事件 (用於當前頁面的變化)
    window.addEventListener('cartUpdated', handleCartChange);
    
    // 監聽 storage 事件 (用於不同頁面或標籤頁的變化)
    window.addEventListener('storage', (e) => {
      if (e.key === 'digital_concert_hall_cart') {
        handleCartChange();
      }
    });
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartChange);
      window.removeEventListener('storage', handleCartChange);
    };
  }, []);
  
  // 監聽 localStorage 更新與認證狀態
  useEffect(() => {
    console.log('MainLayout 渲染，當前認證狀態:', { 
      isAuthenticated, 
      username: user?.username
    });

    // 設置顯示名稱
    if (isAuthenticated && user) {
      setUserDisplayName(user.username || '用戶');
    }

    // 檢查 localStorage 中是否有認證資料但未在狀態中反映
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr && !isAuthenticated) {
      console.log('發現 localStorage 有認證資料但狀態未更新，嘗試更新');
      updateAuthState();
    }
    
    // 監聽 storage 事件，處理在其他標籤頁登入/登出
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('檢測到 localStorage 認證資料變更');
        updateAuthState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, user, updateAuthState]);
  
  // 確保測試模式不會影響一般頁面 - 清理測試元素
  useEffect(() => {
    // 只有在非支付相關頁面才需要清理測試元素
    if (!location.pathname.includes('/payment/') && !location.pathname.includes('/checkout')) {
      const cleanupTestElements = () => {
        // 移除可能存在的測試模式HTML元素
        const testElements = document.querySelectorAll('[data-testid="ecpay-test-mode"]');
        if (testElements.length > 0) {
          testElements.forEach(el => el.remove());
        }
        
        // 移除模擬支付相關的全局變數
        if (window.simulatePayment) {
          delete window.simulatePayment;
        }
      };
      
      // 在頁面變更時執行清理
      cleanupTestElements();
    }
  }, [location.pathname]);

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
            <Link to="/cart" className="text-white hover:text-indigo-300 relative">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* 使用者登入/註冊或下拉選單 */}
            {console.log('渲染使用者選單狀態:', {isAuthenticated, hasUser: !!user, username: user?.username})}
            {(isAuthenticated && user) ? (
              <>
                {console.log('顯示已登入用戶選單')}
                <div className="relative">
                  <button 
                    onClick={toggleMenu}
                    className="flex items-center text-white hover:text-indigo-300 text-sm font-medium"
                  >
                    <User size={16} className="mr-1" />
                    {userDisplayName || user?.username || '使用者'}
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
              </>
            ) : (
              <>
                {console.log('顯示登入按鈕')}
                <div className="flex items-center space-x-4">
                  <Link to="/auth/login" className="text-white hover:text-indigo-300 text-sm font-medium">登入</Link>
                  <Link to="/auth/register" className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-500 text-sm font-medium">註冊</Link>
                </div>
              </>
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