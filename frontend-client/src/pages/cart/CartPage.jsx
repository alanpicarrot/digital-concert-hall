import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';
import cartService from '../../services/cartService';
import authService from '../../services/authService';

const CartPage = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 載入購物車數據
    const cartData = cartService.getCart();
    setCart(cartData);
    setLoading(false);
  }, []);

  const handleUpdateQuantity = (itemId, itemType, quantity) => {
    const updatedCart = cartService.updateQuantity(itemId, itemType, quantity);
    setCart(updatedCart);
  };

  const handleRemoveItem = (itemId, itemType) => {
    const updatedCart = cartService.removeFromCart(itemId, itemType);
    setCart(updatedCart);
  };

  const handleClearCart = () => {
    // 添加確認對話框以防止意外清空
    if (window.confirm('確定要清空購物車嗎？此操作不可撤銷。')) {
      const updatedCart = cartService.clearCart();
      setCart(updatedCart);
    }
  };

  const handleCheckout = async () => {
    try {
      // 首先，進行詳細的登入狀態檢查
      console.log('開始結帳流程 - 詳細檢查登入狀態');
      
      // 使用更可靠的方式檢查登入
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const isTokenValid = authService.isTokenValid();
      
      // 更全面的狀態記錄
      console.log('結帳時詳細認證狀態:', { 
        tokenExists: !!token, 
        userExists: !!userStr,
        tokenValid: isTokenValid,
        tokenLength: token?.length,
        userObject: userStr ? JSON.parse(userStr).username : null
      });
      
      // 如果沒有有效的令牌或用戶數據，則需要重新登入
      if (!token || !userStr) {
        console.log('認證令牌或用戶數據缺失，需要重新登入');
        alert('您需要先登入才能結帳，即將為您導向登入頁面');
        
        // 清理任何可能的過期認證
        await authService.logout();
        
        // 使用React Router的正確導航方式
        navigate('/auth/login', { 
          state: { from: '/cart', redirectAfterLogin: true }
        });
        return;
      }
      
      // 單獨處理令牌有效性，即使令牌可能無效也嘗試進行結帳
      // 這是因為令牌可能在前端檢查無效，但後端仍然認為有效
      if (!isTokenValid) {
        console.warn('令牌有效性檢查失敗，但仍嘗試進行結帳，後端將進行最終驗證');
      }
      
      // 在通過認證檢查後，確認購物車狀態
      if (cart.items.length === 0) {
        setCheckoutError('購物車是空的，請添加商品後再結帳');
        return;
      }

      // 開始處理結帳
      setIsProcessing(true);
      setCheckoutError(null);
      console.log('用戶已登入，開始處理結帳請求');

      // 創建訂單
      console.log('開始創建訂單...');
      const orderData = await cartService.checkout();
      
      console.log('訂單創建成功，訂單號:', orderData.orderNumber);
      
      // 確保訂單號存在
      if (!orderData || !orderData.orderNumber) {
        throw new Error('訂單創建成功但未獲得訂單號');
      }
      
      // 在重定向前再次確認登入狀態
      const isTokenStillValid = authService.isTokenValid();
      console.log('重定向前再次確認登入狀態:', isTokenStillValid ? '有效' : '無效');
      
      if (!isTokenStillValid) {
        alert('登入狀態已過期，將為您導向登入頁面');
        await authService.logout();
        navigate('/auth/login', { 
          state: { 
            from: `/checkout/${orderData.orderNumber}`, 
            redirectAfterLogin: true 
          } 
        });
        return;
      }
      
      // 使用正確的導航路徑，傳遞額外狀態確保認證已完成
      console.log('導向到結帳頁面:', `/checkout/${orderData.orderNumber}`);
      
      // 後端已經成功創建訂單，導向到結帳頁面並傳送必要的認證資訊
      // 在這裡添加延遲，確保認證狀態有足夠時間傳播
      // 增加延遲時間確保狀態完全更新
      console.log('會在5秒後重定向到結帳頁面，以確保認證狀態完全更新');
      alert('訂單創建成功，正在導向結帳頁面...');
      
      // 再次確保用戶數據已經儲存到localStorage
      const recheckToken = localStorage.getItem('token');
      const recheckUser = localStorage.getItem('user');
      console.log('重定向前再次確認用戶資料存在：', {
        tokenExists: !!recheckToken,
        userExists: !!recheckUser
      });
      
      setTimeout(() => {
        navigate(`/checkout/${orderData.orderNumber}`, { 
          state: { 
            authenticated: true,
            loginTimestamp: new Date().getTime(),
            from: '/cart',
            token: true,  // 只傳送有無token的標記，不傳送實際值
            direct: true // 添加直接導向標記
          }
        });
      }, 1000); // 增加延遲確保狀態完全更新
      
    } catch (error) {
      console.error('結帳失敗:', error);
      setCheckoutError(error.response?.data?.message || error.message || '結帳過程中出現錯誤，請稍後再試');
      setIsProcessing(false);
    }
  };

  const getItemTypeName = (type) => {
    const typeMap = {
      'concert': '音樂會',
      'livestream': '線上直播',
      'recording': '錄影',
      'merchandise': '周邊商品'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <ShoppingCart className="mr-2" />
        購物車
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      ) : cart.items.length === 0 ? (
        <div className="text-center py-10">
          <div className="mb-4">
            <ShoppingBag size={64} className="mx-auto text-gray-300" />
          </div>
          <h2 className="text-xl text-gray-600 mb-4">您的購物車是空的</h2>
          <Link 
            to="/concerts" 
            className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            繼續購物
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品資訊
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    類型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    單價
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    數量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    小計
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cart.items.map((item, index) => (
                  <tr key={`${item.id}-${item.type}-${index}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-16 w-16 object-cover mr-4"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 mr-4 flex items-center justify-center text-gray-500">
                            無圖片
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.date && (
                            <div className="text-sm text-gray-500">
                              {new Date(item.date).toLocaleDateString('zh-TW')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getItemTypeName(item.type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">NT$ {item.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button 
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                          onClick={() => handleUpdateQuantity(item.id, item.type, Math.max(1, item.quantity - 1))}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3">{item.quantity}</span>
                        <button 
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                          onClick={() => handleUpdateQuantity(item.id, item.type, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        NT$ {item.price * item.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveItem(item.id, item.type)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div>
              <button
                onClick={handleClearCart}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                清空購物車
              </button>
              
              <Link 
                to="/concerts" 
                className="ml-4 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                繼續購物
              </Link>
            </div>
            
            <div className="mt-4 md:mt-0 bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <span>商品數量:</span>
                <span>{cart.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between mb-4 text-xl font-bold">
                <span>總金額:</span>
                <span>NT$ {cart.total}</span>
              </div>
              
              {checkoutError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-start">
                  <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full ${isProcessing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold py-2 px-4 rounded flex items-center justify-center`}
              >
                {isProcessing ? '處理中...' : '前往結帳'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;