import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CreditCard, ShoppingBag, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';
import authService from '../../services/authService';
import orderService from '../../services/orderService';
import { useToast } from '../../contexts/ToastContext';
import StepProgress from '../../components/ui/StepProgress';

const CheckoutPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [directCheckout, setDirectCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 全局暴露支付模擬函數，確保在開發環境中按鈕可以正常工作
  // 這個函數將在組件卸載時被清理
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.simulatePayment = () => {
        // 使用新的分步模式支付流程
        navigate(`/payment/steps/order?orderNumber=${orderNumber}&amount=${order?.totalAmount || directCheckout?.totalAmount || 1000}`);
      };
    }
    
    // 組件卸載時清理全局函數
    return () => {
      if (window.simulatePayment) {
        delete window.simulatePayment;
        if (process.env.NODE_ENV === 'development') {
          console.log('已清理模擬支付函數');
        }
      }
    };
  }, [orderNumber, navigate, order, directCheckout]);

  // 添加額外的認證驗證邏輯和專用於結帳頁面的強化驗證
  useEffect(() => {
    // 在首次載入時進行認證狀態檢查和日誌記錄
    const verifyAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      // 僅在開發模式下記錄詳細狀態
      if (process.env.NODE_ENV === 'development') {
        console.log('結帳頁面載入時詳細認證狀態:', { 
          tokenExists: !!token, 
          userExists: !!userStr,
          tokenLength: token?.length,
          locationState: JSON.stringify(location.state),
          locationPathname: location.pathname,
          fromDirect: location.state?.direct === true,
          authenticated: location.state?.authenticated === true
        });
      }
      
      // 如果從路由狀態中檢測到authenticated=true且token存在，強制確認認證狀態
      if (location.state?.authenticated === true && token && userStr) {
        if (process.env.NODE_ENV === 'development') {
          console.log('檢測到明確的認證狀態標記，跳過額外驗證');
        }
        return;
      }
      
      // 如果有token和用戶數據，強制重新寫入以確保數據一致性
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          // 重新寫入令牌和用戶數據
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          if (process.env.NODE_ENV === 'development') {
            console.log('已重新寫入令牌和用戶數據，確保數據一致性');
          }
        } catch (e) {
          console.error('解析用戶數據失敗:', e);
        }
      }
    };
    
    // 僅執行一次驗證
    verifyAuth();
  }, []); // 空依賴數組確保只在组件掛載時驗證一次
  
  // 確保獲取結帳數據並在卸載時清理全局函數
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (orderNumber) {
          // 如果有訂單號，從API獲取訂單信息
          if (process.env.NODE_ENV === 'development') {
            console.log('Fetching order data for order number:', orderNumber);
          }
          try {
            const orderData = await orderService.getOrderByNumber(orderNumber);
            if (process.env.NODE_ENV === 'development') {
              console.log('Order data fetched successfully');
            }
            
            // 顯示訂單加載成功的通知
            toast.showSuccess('訂單已就緒', `訂單 #${orderNumber} 已成功加載，請確認資訊後進行付款`);
            
            // 驗證訂單總價是否正確
            if (orderData && orderData.items) {
              // 使用購物車服務中的相同計算方法重新計算總價
              const cartService = await import('../../services/cartService');
              const calculatedTotal = cartService.default.calculateTotal(orderData.items);
              
              // 比較計算出的總價與API回傳的總價
              if (Math.abs(calculatedTotal - orderData.totalAmount) > 1) { // 允許 1 元誤差
                if (process.env.NODE_ENV === 'development') {
                  console.warn(
                    '訂單總價不一致，重新計算:', 
                    calculatedTotal, 
                    '但從API返回:', 
                    orderData.totalAmount
                  );
                }
                
                // 使用前端計算的總價(注意，在實際環境中可能需要將差異報告給後端)
                orderData.calculatedTotal = calculatedTotal;
              }
            }
            
            setOrder(orderData);
            setDirectCheckout(null);
          } catch (err) {
            console.error('Error fetching order:', err);
            setError('無法獲取訂單資訊，請返回重試');
          }
        } else {
          // 從sessionStorage中獲取直接購買信息
          if (process.env.NODE_ENV === 'development') {
            console.log('Checking for direct checkout info in sessionStorage');
          }
          const checkoutInfoStr = sessionStorage.getItem('checkoutInfo');
          
          if (checkoutInfoStr) {
            try {
              const checkoutInfo = JSON.parse(checkoutInfoStr);
              if (process.env.NODE_ENV === 'development') {
                console.log('Direct checkout info found');
              }
              setDirectCheckout(checkoutInfo);
              setOrder(null);
                
              // 顯示購票資訊已就緒的通知
              toast.showInfo('準備完成', '購票資訊已就緒，請確認後進行付款');
            } catch (err) {
              console.error('Error parsing checkout info:', err);
              setError('購票資訊無效，請返回重新選擇');
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('No checkout information found');
            }
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
  }, [orderNumber, toast]);

  // 使用 useCallback 包裝 handlePayment
  const handlePayment = useCallback(async () => {
    try {
      // 再次詳細檢查登入狀態
      const currentUser = authService.getCurrentUser();
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      // 僅在開發模式下記錄詳細狀態
      if (process.env.NODE_ENV === 'development') {
        console.log('支付處理 - 用戶登入詳細狀態:', {
          user: currentUser ? currentUser.username : '未登入',
          tokenExists: !!token,
          userDataExists: !!userStr,
          locationState: JSON.stringify(location.state)
        });
      }
      
      // 如果路由狀態中有authenticated標記且本地存儲有數據，则跳過驗證
      if (location.state?.authenticated === true && token && userStr) {
        if (process.env.NODE_ENV === 'development') {
          console.log('從路由得到認證標記，直接處理支付');
        }
      }
      // 如果沒有令牌或用戶數據，才需要重定向到登入頁面
      else if (!token || !userStr) {
        if (process.env.NODE_ENV === 'development') {
          console.log('用戶未登入，缺少令牌或用戶數據');
        }
        await authService.logout(); // 確保清理登入狀態
        
        // 導向登入並保留重定向信息
        const currentPath = location.pathname;
        toast.showInfo('需要登入', '我們將導引您登入後繼續結帳流程');
        
        // 使用延遲以確保通知消息可以顯示
        setTimeout(() => {
          navigate('/auth/login', { 
            state: { 
              from: currentPath, 
              message: '您需要先登入才能完成支付', 
              redirectAfterLogin: true
            } 
          });
        }, 500);
        return;
      }
      // 如果有令牌和用戶數據，強制重新寫入以確保數據一致性
      else if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          // 重新寫入令牌和用戶數據
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          if (process.env.NODE_ENV === 'development') {
            console.log('已重新寫入令牌和用戶數據，確保數據一致性');
          }
        } catch (e) {
          console.error('解析用戶數據失敗:', e);
        }
      }
      
      setPaymentLoading(true);
      toast.showInfo('準備付款', '正在將您導向付款頁面...');
      
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
          
          if (process.env.NODE_ENV === 'development') {
            console.log('創建直接購買訂單:', cartRequest);
          }
          
          // 調用後端API創建訂單
          const createdOrder = await orderService.createOrder(cartRequest);
          if (process.env.NODE_ENV === 'development') {
            console.log('直接購買訂單創建成功:', createdOrder);
          }
          
          // 使用實際創建的訂單號替代模擬訂單號
          const realOrderNumber = createdOrder.orderNumber;
          sessionStorage.removeItem('checkoutInfo'); // 清除結帳信息
          
          // 稍微延遲以確保訂單在數據庫中完全提交
          setTimeout(() => {
            // 在開發環境中使用模擬支付
            if (process.env.NODE_ENV === 'development') {
              navigate(`/payment/steps/order?orderNumber=${realOrderNumber}&amount=${createdOrder.totalAmount}`);
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
          if (process.env.NODE_ENV === 'development') {
            console.log('開發環境中，直接跳轉到模擬綠界支付頁面');
          }
          
          // 短暫延遲以提供用戶視覺反饋
          setTimeout(() => {
            // 使用已經定義好的全局simulatePayment函數跳轉
            if (typeof window.simulatePayment === 'function') {
              window.simulatePayment();
            } else {
              // 如果函數不存在，就直接跳轉到分步支付頁面
              navigate(`/payment/steps/order?orderNumber=${orderNumber}&amount=${order?.totalAmount || 1000}`);
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
  }, [directCheckout, orderNumber, navigate, location, toast, order]);

  // 渲染結帳頁面
  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-indigo-600 mb-2">訂單確認與付款</h1>
          <div className="text-gray-600 text-sm">確認以下訂單資訊並進行付款</div>
        </div>
        
        {/* 購票流程步驟指引 */}
        <div className="mb-6">
          <StepProgress
            steps={[
              { label: '選擇票券' },
              { label: '確認訂單' },
              { label: '付款' },
              { label: '完成' }
            ]}
            currentStep={1}
          />
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
            {/* 測試模式通知 */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-6">
              <div className="flex items-center text-yellow-800 text-sm">
                <ShieldCheck size={16} className="mr-2" />
                <div>測試環境：付款將使用模擬方式處理</div>
              </div>
            </div>
            
            {/* 卡片 - 訂單資訊 */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              <div className="bg-indigo-600 p-3 border-b">
                <h2 className="text-md font-medium text-white flex items-center">
                  <ShoppingBag size={18} className="mr-2" />
                  訂單資訊
                </h2>
              </div>
              
              <div className="p-4">
                {directCheckout ? (
                  <div className="space-y-3">
                    <div className="flex justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">{directCheckout.concertTitle}</h3>
                        <p className="text-gray-600 text-sm">{directCheckout.ticketType}</p>
                        {/* 添加時間和地點信息 */}
                        <p className="text-gray-600 text-sm flex items-center mt-1">
                          <Calendar size={14} className="mr-1" />
                          {directCheckout.performanceTime || '時間未指定'}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center mt-1">
                          <Calendar size={14} className="mr-1" />
                          {directCheckout.venue || '數位音樂廳'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{directCheckout.quantity} 張</p>
                        <p className="text-gray-600 text-sm">NT$ {directCheckout.ticketPrice} /張</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-medium">總計金額</span>
                      <span className="text-xl font-bold text-indigo-600">NT$ {directCheckout.totalAmount}</span>
                    </div>
                  </div>
                ) : order ? (
                  <div className="space-y-3">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="flex justify-between pb-3 border-b border-gray-100">
                        <div>
                          <h3 className="font-medium">{item.concertTitle}</h3>
                          <p className="text-gray-600 text-sm">{item.description || '標準票'}</p>
                          {/* 添加演出詳情 */}
                          {item.performanceTime && (
                            <p className="text-gray-600 text-sm flex items-center mt-1">
                              <Calendar size={14} className="mr-1" />
                              {item.performanceTime}
                            </p>
                          )}
                          {item.venue && (
                            <p className="text-gray-600 text-sm flex items-center mt-1">
                              <Calendar size={14} className="mr-1" />
                              {item.venue}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.quantity} 張</p>
                          <p className="text-gray-600 text-sm">NT$ {item.unitPrice} /張</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-medium">總計金額</span>
                      <span className="text-xl font-bold text-indigo-600">NT$ {order.calculatedTotal || order.totalAmount}</span>
                    </div>
                    {order.calculatedTotal && order.calculatedTotal !== order.totalAmount && (
                      <div className="mt-1 text-xs text-amber-600">
                        <p>已使用正確的計算金額</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">沒有可用的訂單資訊</p>
                )}
              </div>
            </div>

            {/* 卡片 - 付款方式 */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="bg-indigo-600 p-3 border-b">
                <h2 className="text-md font-medium text-white flex items-center">
                  <CreditCard size={18} className="mr-2" />
                  付款方式
                </h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-center border rounded p-3 mb-4 bg-gray-50">
                  <input
                    type="radio"
                    id="credit-card"
                    name="payment-method"
                    className="mr-3 text-indigo-600"
                    checked
                    readOnly
                  />
                  <label htmlFor="credit-card" className="flex items-center justify-between w-full">
                    <div>
                      <span className="font-medium">信用卡付款</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">VISA</div>
                      <div className="w-8 h-5 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">MC</div>
                      <div className="w-8 h-5 bg-gray-700 rounded text-white flex items-center justify-center text-xs font-bold">JCB</div>
                    </div>
                  </label>
                </div>
                
                <div className="bg-indigo-50 rounded p-3 border border-indigo-100 text-xs text-indigo-700">
                  <p>點擊「確認付款」後，系統將導引您至綠界金流進行安全支付。所有支付信息均使用SSL加密傳輸。</p>
                </div>
              </div>
            </div>
            
            {/* 按鈕區 */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate(-1)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg flex items-center text-sm transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" />
                返回
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentLoading || (!order && !directCheckout)}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg font-medium shadow-md hover:shadow-lg transition-all ${
                  paymentLoading || (!order && !directCheckout) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {paymentLoading ? (
                  <span className="flex items-center">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    處理中...
                  </span>
                ) : (
                  '確認付款'
                )}
              </button>
            </div>
            
            {/* 安全提示 */}
            <div className="text-center text-xs text-gray-500">
              <p>© 2025 Digital Concert Hall - 安全支付由 ECPay 綠界金流提供</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;