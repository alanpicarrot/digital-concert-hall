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
    const updatedCart = cartService.clearCart();
    setCart(updatedCart);
  };

  const handleCheckout = async () => {
    if (!authService.getCurrentUser()) {
      // 如果用戶未登錄，導向登錄頁面
      navigate('/login?redirect=cart');
      return;
    }

    if (cart.items.length === 0) {
      setCheckoutError('購物車是空的，請添加商品後再結帳');
      return;
    }

    try {
      setIsProcessing(true);
      setCheckoutError(null);
      
      // 創建訂單
      const orderData = await cartService.checkout();
      
      // 訂單創建成功，導向到結帳頁面
      navigate(`/checkout/${orderData.orderNumber}`);
    } catch (error) {
      console.error('結帳失敗:', error);
      setCheckoutError(error.response?.data?.message || '結帳過程中出現錯誤，請稍後再試');
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
