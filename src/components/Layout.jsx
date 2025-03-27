import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogIn, Music } from "lucide-react";
import AuthNav from "./common/AuthNav";
import cartService from "../services/cartService";

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    // 檢查用戶登入狀態
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    
    // 檢查購物車商品數量
    const cart = cartService.getCart();
    const count = cart.items.reduce((total, item) => total + item.quantity, 0);
    setCartItemCount(count);
    
    // 每當localStorage發生變化時，重新計算購物車數量
    const handleStorageChange = () => {
      const updatedCart = cartService.getCart();
      const updatedCount = updatedCart.items.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(updatedCount);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 創建一個輪詢機制，定期檢查購物車
    const interval = setInterval(() => {
      const updatedCart = cartService.getCart();
      const updatedCount = updatedCart.items.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(updatedCount);
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-indigo-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <Music className="mr-2" size={24} />
            數位音樂廳
          </Link>
          <div className="hidden md:flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) => 
                `px-3 py-2 rounded ${isActive ? "bg-indigo-700" : ""}`
              }
              end
            >
              首頁
            </NavLink>
            <NavLink
              to="/concerts"
              className={({ isActive }) => 
                `px-3 py-2 rounded ${isActive ? "bg-indigo-700" : ""}`
              }
            >
              音樂會
            </NavLink>
            <NavLink
              to="/artists"
              className={({ isActive }) => 
                `px-3 py-2 rounded ${isActive ? "bg-indigo-700" : ""}`
              }
            >
              藝術家
            </NavLink>
            <NavLink
              to="/livestreams"
              className={({ isActive }) => 
                `px-3 py-2 rounded ${isActive ? "bg-indigo-700" : ""}`
              }
            >
              直播
            </NavLink>
            <NavLink
              to="/cart"
              className="px-3 py-2 relative"
            >
              <ShoppingCart className="inline" size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </NavLink>
            
            <AuthNav />
          </div>
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 行動裝置選單 */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4">
            <nav className="flex flex-col space-y-2">
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `px-3 py-2 rounded text-left ${isActive ? "bg-indigo-700" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
                end
              >
                首頁
              </NavLink>
              <NavLink
                to="/concerts"
                className={({ isActive }) => 
                  `px-3 py-2 rounded text-left ${isActive ? "bg-indigo-700" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                音樂會
              </NavLink>
              <NavLink
                to="/artists"
                className={({ isActive }) => 
                  `px-3 py-2 rounded text-left ${isActive ? "bg-indigo-700" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                藝術家
              </NavLink>
              <NavLink
                to="/livestreams"
                className={({ isActive }) => 
                  `px-3 py-2 rounded text-left ${isActive ? "bg-indigo-700" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                直播
              </NavLink>
              <div className="flex flex-col space-y-2 pt-2">
                <NavLink 
                  to="/cart" 
                  className="px-3 py-2 flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center relative">
                    <ShoppingCart className="inline mr-2" size={20} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                    <span>購物車</span>
                  </div>
                </NavLink>
                
                {!currentUser ? (
                  <NavLink 
                    to="/login" 
                    className="px-3 py-2 flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="inline mr-2" size={20} /> 登入
                  </NavLink>
                ) : (
                  <NavLink 
                    to="/profile" 
                    className="px-3 py-2 flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="inline mr-2" size={20} /> 會員中心
                  </NavLink>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">數位音樂廳</h3>
              <p className="text-gray-400">
                為您提供優質的線上音樂欣賞體驗，隨時隨地享受頂級音樂會。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">關於我們</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white">
                    關於數位音樂廳
                  </Link>
                </li>
                <li>
                  <Link to="/artists" className="hover:text-white">
                    合作藝術家
                  </Link>
                </li>
                <li>
                  <Link to="/jobs" className="hover:text-white">
                    徵才資訊
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    聯絡我們
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">幫助中心</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/faq" className="hover:text-white">
                    常見問題
                  </Link>
                </li>
                <li>
                  <Link to="/how-to-buy" className="hover:text-white">
                    購票說明
                  </Link>
                </li>
                <li>
                  <Link to="/viewing-guide" className="hover:text-white">
                    觀看指南
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-white">
                    退款政策
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">訂閱電子報</h3>
              <p className="text-gray-400 mb-2">獲取最新音樂會資訊和優惠</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="您的電子郵件"
                  className="px-4 py-2 rounded-l text-black w-full"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-r">
                  訂閱
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; 2025 數位音樂廳. 版權所有.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
