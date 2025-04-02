import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, X, CheckCircle, ArrowLeft } from 'lucide-react';

/**
 * 綠界支付模擬頁面
 * 用於開發測試，模擬綠界的支付流程
 */
const ECPayMockPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    productName: '',
    amount: 0
  });

  // 從URL參數或localStorage獲取訂單信息
  useEffect(() => {
    // 從URL參數中獲取訂單ID
    const searchParams = new URLSearchParams(location.search);
    const orderNumber = searchParams.get('orderNumber');
    const amount = searchParams.get('amount');
    const productName = searchParams.get('productName') || 'test x 1';
    
    // 在全局環境中定義simulatePayment函數 - 即使是在多次載入時也確保它存在
    window.simulatePayment = function() {
      console.log('跳轉到模擬綠界支付頁面 - 從ECPayMockPage定義');
      navigate(`/payment/ecpay?orderNumber=${orderNumber || 'DCH-' + Date.now()}&amount=${amount || 1000}`);
    };
    
    if (orderNumber) {
      setOrderDetails({
        orderNumber,
        productName,
        amount: amount || 1000
      });
    } else {
      // 如果沒有URL參數，嘗試從localStorage或sessionStorage中獲取
      const storedDetails = sessionStorage.getItem('checkoutInfo');
      if (storedDetails) {
        try {
          const parsedDetails = JSON.parse(storedDetails);
          setOrderDetails({
            orderNumber: parsedDetails.orderNumber || 'DCH-' + Date.now().toString().slice(-8),
            productName: parsedDetails.concertTitle + ' x ' + parsedDetails.quantity || 'test x 1',
            amount: parsedDetails.totalAmount || 1000
          });
        } catch (err) {
          console.error('無法解析訂單詳情', err);
        }
      }
    }
  }, [location.search, navigate]);

  // 處理支付確認 - 簡化版
  const handleConfirmPayment = () => {
    setLoading(true);
    
    // 定義全局simulatePayment函數
    window.simulatePayment = function() {
      navigate(`/payment/result?MerchantTradeNo=${orderDetails.orderNumber}&RtnCode=1&RtnMsg=交易成功`);
    };
    
    // 直接在組件中處理
    setTimeout(() => {
      navigate(`/payment/result?MerchantTradeNo=${orderDetails.orderNumber}&RtnCode=1&RtnMsg=交易成功`);
    }, 1500);
  };

  // 取消支付
  const handleCancelPayment = () => {
    if (window.confirm('確定要取消此次支付嗎？')) {
      navigate(`/payment/result?MerchantTradeNo=${orderDetails.orderNumber}&RtnCode=0&RtnMsg=使用者取消交易`);
    }
  };

  // 返回前一頁
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 頂部綠界標識 */}
      <header className="bg-green-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <CreditCard size={28} className="mr-2" />
            <h1 className="text-xl font-bold">綠界支付</h1>
          </div>
          <button 
            onClick={handleGoBack}
            className="p-2 hover:bg-green-700 rounded-full"
          >
            <ArrowLeft size={22} />
          </button>
        </div>
      </header>
      
      {/* 測試模式提示 - 移至頂部作為通知橫幅 */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-3 px-4" data-testid="ecpay-test-mode">
        <div className="container mx-auto">
          <div className="flex items-start">
            <div className="bg-yellow-100 rounded-full p-2 mr-3 flex-shrink-0">
              <CheckCircle size={18} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">測試模式提示</h3>
              <p className="text-yellow-700 text-sm">
                這是一個模擬的綠界支付頁面，僅用於開發測試。實際支付時將會跳轉到真實的綠界支付頁面。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <main className="flex-grow flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

          <h2 className="text-lg font-semibold mb-6 text-center">訂單支付</h2>
          
          <div className="space-y-4 border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">訂單編號:</span>
              <span className="font-medium">{orderDetails.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">商品名稱:</span>
              <span className="font-medium">{orderDetails.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">應付金額:</span>
              <span className="font-bold text-green-600">NT$ {orderDetails.amount}</span>
            </div>
          </div>

          <div className="px-6 py-3">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">支付方式</h3>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="credit-card" 
                  name="payment-method" 
                  checked 
                  readOnly 
                  className="h-4 w-4 text-green-600"
                />
                <label htmlFor="credit-card" className="text-sm text-gray-600">信用卡付款</label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelPayment}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                取消支付
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className={`flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex justify-center items-center ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    處理中...
                  </>
                ) : '確認付款'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 頁腳 */}
      <footer className="py-4 bg-gray-800 text-gray-400 text-center text-sm">
        <p>© 2025 模擬綠界支付. 此頁面僅供開發測試使用.</p>
      </footer>
    </div>
  );
};

export default ECPayMockPage;