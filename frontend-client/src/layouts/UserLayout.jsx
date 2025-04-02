import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'bg-indigo-50 text-indigo-800' : 'text-gray-700 hover:bg-gray-50';
  };

  // 確保測試模式元素不會影響用戶頁面
  useEffect(() => {
    // 移除任何可能存在的測試模式HTML元素（更全面的清理方法）
    const cleanupTestElements = () => {
      // 針對性移除綠界支付相關元素
      document.querySelectorAll('[data-testid="ecpay-test-mode"]').forEach(el => el.remove());
      
      // 查找並移除測試模式元素（不依賴於data-testid）
      const testModeBanners = Array.from(document.querySelectorAll('*')).filter(el => {
        // 通過內容查找測試模式元素
        const content = el.textContent || '';
        return (content.includes('測試模式') || content.includes('綠界支付')) && 
               (el.className?.includes('rounded-lg') || el.className?.includes('shadow'));
      });
      
      testModeBanners.forEach(el => {
        console.log('移除測試模式元素:', el);
        el.remove();
      });
      
      // 移除可能由simulatePayment留下的全局函數
      if (window.simulatePayment) {
        delete window.simulatePayment;
      }
    };
    
    // 頁面加載時立即清理
    cleanupTestElements();
    
    // 設置觀察器持續監視並移除測試模式元素
    const observer = new MutationObserver(() => {
      // 當DOM變化時檢查是否有測試模式元素
      cleanupTestElements();
    });
    
    // 啟動觀察器
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 組件卸載時停止觀察並再次清理
    return () => {
      observer.disconnect();
      cleanupTestElements();
    };
  }, [location.pathname]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左側側邊欄 */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* 用戶資訊 */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            
            {/* 選單 */}
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/user/profile" 
                    className={`block px-4 py-2 rounded-md ${isActive('/profile')}`}
                  >
                    個人資料
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/orders" 
                    className={`block px-4 py-2 rounded-md ${isActive('/orders')}`}
                  >
                    訂單記錄
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/tickets" 
                    className={`block px-4 py-2 rounded-md ${isActive('/tickets')}`}
                  >
                    我的票券
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/favorites" 
                    className={`block px-4 py-2 rounded-md ${isActive('/favorites')}`}
                  >
                    收藏清單
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/change-password" 
                    className={`block px-4 py-2 rounded-md ${isActive('/change-password')}`}
                  >
                    修改密碼
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* 右側內容 */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
