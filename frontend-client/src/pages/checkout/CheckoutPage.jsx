import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CreditCard } from 'lucide-react';
import authService from '../../services/authService';

const CheckoutPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [directCheckout, setDirectCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 詳細檢查用戶登入狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();
    console.log('結帳頁面 - 用戶登入狀態:', {
      user: currentUser ? currentUser.username : '未登入',
      tokenValid: isTokenValid ? '有效' : '無效或過期',
      orderNumber: orderNumber || '無訂單編號',
      hasCheckoutInfo: !!sessionStorage.getItem('checkoutInfo')
    });
    
    // 檢查用戶是否已登入並且令牌有效
    if (!currentUser || !isTokenValid) {
      // 如果用戶未登入或令牌無效，導向登入頁面
      console.log('用戶未登入或令牌無效，重定向到登入頁面');
      
      // 先清除已經失效的登入狀態
      if (!isTokenValid && currentUser) {
        authService.logout();   
      } else {
        // 如果使用者沒登入，就先導到登入頁面
        alert('請先登入才能處理結帳');
        navigate('/auth/login?redirect=checkout' + (orderNumber ? `/${orderNumber}` : ''));
      }
      return;
    }

    // 檢查是否是直接從音樂會頁面導航過來的
    const checkoutInfo = sessionStorage.getItem('checkoutInfo');
    
    if (checkoutInfo) {
      // 如果存在 sessionStorage 中的資訊，表示是直接購買
      try {
        const parsedInfo = JSON.parse(checkoutInfo);
        setDirectCheckout(parsedInfo);
        setLoading(false);
        
        // 請注意：在實際應用中，這裡應該要先向後端建立訂單
        // 但在範例中，我們只顯示前端的資訊
      } catch (error) {
        console.error('Error parsing checkout info:', error);
        setError('處理購票資料時發生錯誤。');
        setLoading(false);
      }
    } else if (orderNumber) {
      // 如果是從訂單管理頁面導航過來的
      const fetchOrderDetails = async () => {
        try {
          setLoading(true);
          // 使用 authService 的 axiosInstance 來帶上授權信息
          const response = await authService.axiosInstance.get(`/api/users/me/orders/${orderNumber}`);
          setOrder(response.data);
          
          // 如果訂單已支付，直接導向到訂單詳情頁
          if (response.data.status === 'paid') {
            navigate(`/user/orders/${orderNumber}`);
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
          setError('無法載入訂單資訊，請稍後再試。');
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    } else {
      // 如果沒有 orderNumber 也沒有 checkoutInfo，則載入已完成
      setLoading(false);
    }
    
    // 在結帳完成後清除 sessionStorage
    return () => {
      sessionStorage.removeItem('checkoutInfo');
    };
  }, [orderNumber, navigate]);

  // 處理支付請求
  const handlePayment = async () => {
    // 再次檢查用戶登入狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();
    console.log('支付處理 - 用戶登入狀態:', {
      user: currentUser ? currentUser.username : '未登入',
      tokenValid: isTokenValid ? '有效' : '無效或過期'
    });
    
    // 檢查用戶是否已登入並且令牌有效
    if (!currentUser || !isTokenValid) {
      // 如果用戶未登入或令牌無效，導向登入頁面
      console.log('用戶未登入或令牌無效，重定向到登入頁面');
      
      // 先清除已經失效的登入狀態
      if (!isTokenValid && currentUser) {
        authService.logout();   
      }
      
      alert('您的登入已失效，請重新登入後再購買');
      navigate('/auth/login?redirect=checkout' + (orderNumber ? `/${orderNumber}` : ''));
      return;
    }
    
    try {
      setPaymentLoading(true);
      
      // 如果是直接購票，需要先在後端創建一個訂單
      if (directCheckout) {
        // 在實際應用中，我們應該先向後端 API 創建訂單
        // 例如：
        /*
        const orderResponse = await axios.post('/api/orders', {
          concertId: directCheckout.concertId,
          items: [{
            ticketTypeId: directCheckout.ticketTypeId,
            quantity: directCheckout.quantity
          }]
        });
        const orderNumber = orderResponse.data.orderNumber;
        */
        
        // 模擬創建訂單
        const mockOrderNumber = 'ORD' + Date.now();
        alert(`訂單已創建，訂單編號：${mockOrderNumber}`);
        
        // 模擬支付成功
        setTimeout(() => {
          navigate(`/payment/result?MerchantTradeNo=${mockOrderNumber}&RtnCode=1&RtnMsg=交易成功`);
          setPaymentLoading(false);
        }, 1500);
        
        return;
      }
      
      // 原本訂單支付部分
      if (orderNumber) {
        // 創建表單請求，返回HTML
        const response = await authService.axiosInstance.post(
          '/api/payment/ecpay/create',
          { orderNumber },
          { responseType: 'text' }
        );
        
        // 創建一個臨時的HTML元素來處理返回的表單
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response.data;
        
        // 將返回的HTML插入到body並提交表單
        document.body.appendChild(tempDiv);
        
        // 如果測試環境, 我們可以添加一個模擬的延遲
        if (process.env.NODE_ENV === 'development') {
          const testMode = true; // 設置為true以使用開發測試模式
          
          if (testMode) {
            // 模擬流程 - 僅在開發環境中
            setTimeout(() => {
              // 使用管理員測試API模擬支付成功
              authService.axiosInstance.post(`/api/payment/ecpay/test-notify?orderNumber=${orderNumber}&success=true`)
                .then(() => {
                  navigate(`/payment/result?MerchantTradeNo=${orderNumber}&RtnCode=1&RtnMsg=交易成功`);
                })
                .catch(error => {
                  console.error('Error simulating payment:', error);
                  setPaymentLoading(false);
                  setError('模擬支付失敗，請稍後再試。');
                });
            }, 2000);
            return;
          }
        }
        
        // 如果不是測試模式，自動提交表單
        const form = tempDiv.querySelector('form');
        if (form) {
          form.submit();
        } else {
          setError('無法處理支付表單，請稍後再試。');
          setPaymentLoading(false);
        }
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('建立支付請求失敗，請稍後再試。');
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-indigo-600 animate-spin mb-4" />
          <p className="text-xl text-gray-600">載入訂單資訊中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-center">發生錯誤</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/user/orders')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg"
            >
              返回訂單列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order && !directCheckout) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-bold mb-4">找不到購票資訊</h2>
          <p className="text-gray-600 mb-6">無法找到指定的訂單或購票資訊。</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">確認訂單並付款</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">訂單摘要</h2>
            
            {/* 直接購票模式 */}
            {directCheckout && (
              <>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">音樂會：</span>
                    <span className="font-medium">{directCheckout.concertTitle}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">購票日期：</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-3">購票明細</h3>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between mb-2">
                    <div className="flex-1">
                      <span className="font-medium">{directCheckout.ticketType}</span>
                      <span className="text-gray-500 text-sm ml-2">x {directCheckout.quantity}</span>
                    </div>
                    <div className="text-right">
                      <span>NT$ {directCheckout.ticketPrice} 元</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold">總計：</span>
                  <span className="text-xl font-bold text-indigo-600">NT$ {directCheckout.totalAmount} 元</span>
                </div>
              </>
            )}
            
            {/* 訂單模式 */}
            {order && (
              <>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">訂單編號：</span>
                    <span className="font-medium">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">訂單日期：</span>
                    <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">訂單狀態：</span>
                    <span className="font-medium">
                      {order.status === 'pending' ? '待付款' : 
                       order.status === 'paid' ? '已付款' : 
                       order.status === 'cancelled' ? '已取消' : order.status}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-3">訂購項目</h3>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between mb-2">
                      <div className="flex-1">
                        <span className="font-medium">{item.ticket.ticketType.name}</span>
                        <span className="text-gray-500 text-sm ml-2">x {item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span>NT$ {item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-600">小計：</span>
                  <span className="font-medium">NT$ {order.subtotalAmount}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-600">折扣：</span>
                    <span className="font-medium text-green-600">- NT$ {order.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold">總計：</span>
                  <span className="text-xl font-bold text-indigo-600">NT$ {order.totalAmount}</span>
                </div>
              </>
            )}
          </div>
        </div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">付款方式</h2>
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex items-center">
              <input
                type="radio"
                id="credit-card"
                name="payment-method"
                checked={true}
                readOnly
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="credit-card" className="ml-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium">信用卡支付</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  使用綠界金流處理，安全便捷
                </p>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-6 rounded-lg"
          >
            返回
          </button>
          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className={`flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-8 rounded-lg ${
              paymentLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {paymentLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                處理中...
              </>
            ) : (
              '確認付款'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
