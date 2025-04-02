import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CreditCard, ShoppingBag, Calendar, ArrowLeft } from 'lucide-react';
import authService from '../../services/authService';
import orderService from '../../services/orderService';

const CheckoutPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [directCheckout, setDirectCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 全局暴露支付模擬函數，確保在開發環境中按鈕可以正常工作
  // 這個函數將在組件卸載時被清理
  if (process.env.NODE_ENV === 'development') {
    window.simulatePayment = () => {
      navigate(`/payment/ecpay?orderNumber=${orderNumber}&amount=${order?.totalAmount || directCheckout?.totalAmount || 1000}`);
    };
  }

  // 確保獲取結帳數據並在卸載時清理全局函數
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (orderNumber) {
          // 如果有訂單號，從API獲取訂單信息
          console.log('Fetching order data for order number:', orderNumber);
          try {
            const orderData = await orderService.getOrderByNumber(orderNumber);
            console.log('Order data fetched successfully:', orderData);
            setOrder(orderData);
            setDirectCheckout(null);
          } catch (err) {
            console.error('Error fetching order:', err);
            setError('無法獲取訂單資訊，請返回重試');
          }
        } else {
          // 從sessionStorage中獲取直接購買信息
          console.log('Checking for direct checkout info in sessionStorage');
          const checkoutInfoStr = sessionStorage.getItem('checkoutInfo');
          
          if (checkoutInfoStr) {
            try {
              const checkoutInfo = JSON.parse(checkoutInfoStr);
              console.log('Direct checkout info found:', checkoutInfo);
              setDirectCheckout(checkoutInfo);
              setOrder(null);
            } catch (err) {
              console.error('Error parsing checkout info:', err);
              setError('購票資訊無效，請返回重新選擇');
            }
          } else {
            console.log('No checkout information found');
            setError('找不到結帳資訊，請返回選擇音樂會');
          }
        }
      } catch (error) {
        console.error('Checkout error:', error);
        setError('發生錯誤，請稍後重試');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
    
    // 組件卸載時清理全局函數
    return () => {
      if (window.simulatePayment) {
        delete window.simulatePayment;
        console.log('已清理模擬支付函數');
      }
    };
  }, [orderNumber]);

  // 使用 useCallback 包裝 handlePayment
  const handlePayment = useCallback(async () => {
    try {
      // 再次詳細檢查登入狀態
      const currentUser = authService.getCurrentUser();
      const isTokenValid = authService.isTokenValid();
      
      console.log('支付處理 - 用戶登入狀態:', {
        user: currentUser ? currentUser.username : '未登入',
        tokenValid: isTokenValid ? '有效' : '無效或過期'
      });
      
      if (!currentUser || !isTokenValid) {
        console.log('用戶未登入或令牌無效');
        await authService.logout(); // 確保清理登入狀態
        
        // 導向登入並保留重定向信息
        navigate('/auth/login', { 
          state: { 
            from: location.pathname, 
            message: '您的登入已過期，請重新登入' 
          } 
        });
        return;
      }
      
      setPaymentLoading(true);
      
      // 如果是直接購票，需要先在後端創建一個訂單
      if (directCheckout) {
        try {
          // 驗證必要的票券數據
          if (!directCheckout.ticketId) {
            console.error('票券ID缺失，無法完成訂單', directCheckout);
            setError('票券數據不完整，請返回重新選擇門票');
            setPaymentLoading(false);
            return;
          }
          
          // 建立購物車對象
          const cartRequest = {
            items: [
              {
                id: directCheckout.ticketId,
                quantity: directCheckout.quantity
              }
            ]
          };
          
          console.log('創建直接購買訂單:', cartRequest);
          
          // 調用後端API創建訂單
          const createdOrder = await orderService.createOrder(cartRequest);
          console.log('直接購買訂單創建成功:', createdOrder);
          
          // 使用實際創建的訂單號替代模擬訂單號
          const realOrderNumber = createdOrder.orderNumber;
          sessionStorage.removeItem('checkoutInfo'); // 清除結帳信息
          
          // 稍微延遲以確保訂單在數據庫中完全提交
          setTimeout(() => {
            // 在開發環境中使用模擬支付
            if (process.env.NODE_ENV === 'development') {
              navigate(`/payment/ecpay?orderNumber=${realOrderNumber}&amount=${createdOrder.totalAmount}`);
              setPaymentLoading(false);
              return;
            }
            
            // 正式環境則重定向到真實支付頁面
            navigate(`/checkout/${realOrderNumber}`);
            setPaymentLoading(false);
          }, 1000);
          return;
        } catch (error) {
          console.error('創建訂單失敗:', error);
          setError(error.message || '創建訂單時發生錯誤，請稍後再試');
          setPaymentLoading(false);
          return;
        }
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
        
        // 如果測試環境, 直接跳轉到模擬支付頁面
        if (process.env.NODE_ENV === 'development') {
          // 在開發環境中直接跳轉到模擬綠界支付頁面，簡化整個流程
          console.log('開發環境中，直接跳轉到模擬綠界支付頁面');
          
          // 短暫延遲以提供用戶視覺反饋
          setTimeout(() => {
            // 使用已經定義好的全局simulatePayment函數跳轉
            if (typeof window.simulatePayment === 'function') {
              window.simulatePayment();
            } else {
              // 如果函數不存在，就直接跳轉
              navigate(`/payment/ecpay?orderNumber=${orderNumber}&amount=${order?.totalAmount || 1000}`);
            }
            setPaymentLoading(false);
          }, 1000);
          
          return;
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
      
      // 統一的錯誤處理
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           '支付處理失敗，請稍後再試';
      
      setError(errorMessage);
      setPaymentLoading(false);
    }
  }, [directCheckout, orderNumber, navigate, location]);

  // 渲染結帳頁面
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">結帳</h1>
          <div className="flex items-center text-sm text-gray-500">
            <span>確認訂單詳情並進行付款</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">發生錯誤</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/concerts')}
              className="flex items-center text-red-700 hover:text-red-900"
            >
              <ArrowLeft size={18} className="mr-1" />
              返回音樂會列表
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="bg-gray-50 p-4 border-b">
                <h2 className="text-lg font-medium flex items-center">
                  <ShoppingBag size={20} className="mr-2 text-indigo-600" />
                  訂單詳情
                </h2>
              </div>
              
              <div className="p-6">
                {directCheckout ? (
                  <div className="space-y-4">
                    <div className="flex justify-between pb-4 border-b">
                      <div>
                        <h3 className="font-medium text-lg">{directCheckout.concertTitle}</h3>
                        <p className="text-gray-600">{directCheckout.ticketType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{directCheckout.quantity} 張</p>
                        <p className="text-gray-600">NT$ {directCheckout.ticketPrice} /張</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>總計金額</span>
                      <span>NT$ {directCheckout.totalAmount}</span>
                    </div>
                  </div>
                ) : order ? (
                  <div className="space-y-4">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="flex justify-between pb-4 border-b">
                        <div>
                          <h3 className="font-medium">{item.concertTitle}</h3>
                          <p className="text-gray-600">{item.description || '標準票'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.quantity} 張</p>
                          <p className="text-gray-600">NT$ {item.unitPrice} /張</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-semibold">
                      <span>總計金額</span>
                      <span>NT$ {order.totalAmount}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">沒有可用的訂單資訊</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="bg-gray-50 p-4 border-b">
                <h2 className="text-lg font-medium flex items-center">
                  <CreditCard size={20} className="mr-2 text-indigo-600" />
                  付款方式
                </h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-center border rounded-lg p-3 bg-indigo-50 border-indigo-200">
                  <input
                    type="radio"
                    id="credit-card"
                    name="payment-method"
                    className="mr-3"
                    checked
                    readOnly
                  />
                  <label htmlFor="credit-card" className="flex items-center">
                    <span className="font-medium">信用卡付款</span>
                    <span className="ml-2 text-gray-600 text-sm">(透過綠界金流)</span>
                  </label>
                </div>
                
                <p className="mt-4 text-sm text-gray-600">
                  點擊「確認付款」後，系統將引導您至綠界金流進行安全支付。
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-6 rounded-lg flex items-center"
              >
                <ArrowLeft size={18} className="mr-1" />
                返回
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentLoading || (!order && !directCheckout)}
                className={`flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-8 rounded-lg ${
                  paymentLoading || (!order && !directCheckout) ? 'opacity-70 cursor-not-allowed' : ''
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
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;