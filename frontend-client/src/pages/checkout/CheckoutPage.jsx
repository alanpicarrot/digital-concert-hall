import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CreditCard } from 'lucide-react';
import authService from '../../services/authService';

const CheckoutPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [directCheckout, setDirectCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);

  // 複製之前的 useEffect 代碼...

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
      
      // 統一的錯誤處理
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           '支付處理失敗，請稍後再試';
      
      setError(errorMessage);
      setPaymentLoading(false);
    }
  }, [directCheckout, orderNumber, navigate, location]);

  // 渲染部分保持不變
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 其他部分保持不變 */}
        
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