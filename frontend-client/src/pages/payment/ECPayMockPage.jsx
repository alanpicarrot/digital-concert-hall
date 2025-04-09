import React, { useState, useEffect } from 'react';
import ECPayCreditCardForm from '../../components/payment/ECPayCreditCardForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, X, CheckCircle, ArrowLeft, Lock, ShieldCheck, CreditCard as CreditCardIcon, AlertTriangle } from 'lucide-react';

/**
 * 綠界支付模擬頁面
 * 用於開發測試，模擬綠界的支付流程
 */
const ECPayMockPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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
    const mode = searchParams.get('mode') || 'default';
    
    // 如果是彈出模式，設置body的樣式使背景頁面無法滾動
    if (mode === 'popup') {
      document.body.style.overflow = 'hidden';
    }
    
    // 在全局環境中定義simulatePayment函數 - 即使是在多次載入時也確保它存在
    window.simulatePayment = function() {
      console.log('跳轉到模擬綠界支付頁面 - 從ECPayMockPage定義');
      navigate(`/payment/ecpay?orderNumber=${orderNumber || 'DCH-' + Date.now()}&amount=${amount || 1000}&mode=popup`);
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
    
    // 組件卸載時恢復body滾動狀態
    return () => {
      document.body.style.overflow = '';
    };
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
    setShowCancelConfirm(true);
  };

  // 確認取消
  const confirmCancel = () => {
    setShowCancelConfirm(false);
    navigate(`/payment/result?MerchantTradeNo=${orderDetails.orderNumber}&RtnCode=0&RtnMsg=使用者取消交易`);
  };
  
  // 關閉確認對話框
  const closeConfirmDialog = () => {
    setShowCancelConfirm(false);
  };

  // 返回前一頁
  const handleGoBack = () => {
    // 恢復滾動狀態再返回
    document.body.style.overflow = '';
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col fixed inset-0 z-50">
      {/* 頂部綠界標識 */}
      <header className="bg-green-600 text-white py-3 px-4 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center">
            <CreditCard size={22} className="mr-2" />
            <h1 className="text-lg font-semibold">ECPay 綠界支付</h1>
          </div>
          <button 
            onClick={handleGoBack}
            className="p-1.5 hover:bg-green-700 rounded-full"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </header>
      
      {/* 測試通知 - 修改為更明顯的樣式 */}
      <div className="bg-yellow-100 border-b border-yellow-300 py-2 px-4 text-sm text-yellow-800 text-center font-medium">
        <CheckCircle size={14} className="inline-block mr-1" />
        測試模式 - 僅用於開發環境
      </div>

      {/* 主要內容 */}
      <main className="flex-grow flex justify-center items-center p-4 py-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-md overflow-hidden">
          {/* 頂部標題區域 */}
          {/* 使用信用卡表單組件 */}
          <ECPayCreditCardForm orderDetails={orderDetails} />
        </div>
      </main>

      {/* 簡化版本 - 直接顯示兩個按鈕，與圖片更匹配 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center space-x-3">
        <button
          onClick={handleCancelPayment}
          className="w-1/2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消支付
        </button>
        <button
          onClick={handleConfirmPayment}
          className={`w-1/2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              處理中...
            </>
          ) : (
            '確認付款'
          )}
        </button>
      </div>
      
      {/* 自定義取消確認對話框 */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-[90%] p-4">
            <div className="flex items-center mb-4 text-amber-600">
              <AlertTriangle className="mr-2" size={22} />
              <h3 className="text-lg font-semibold">確認取消</h3>
            </div>
            <p className="mb-5 text-gray-600">確定要取消此次付款結帳嗎？</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={closeConfirmDialog}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                不取消
              </button>
              <button 
                onClick={confirmCancel}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              >
                確認取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頁腳 */}
      <footer className="py-2 bg-gray-100 border-t border-gray-200 text-gray-500 text-center text-xs mb-16">
        <p>© 2025 ECPay 綠界支付</p>
      </footer>
    </div>
  );
};

export default ECPayMockPage;