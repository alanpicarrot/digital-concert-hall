import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Lock, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * 支付步驟 2: 信用卡付款資訊填寫與確認
 */
const PaymentStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: '',
    productName: 'VIP票 x 1',
    amount: 0
  });

  // 從URL參數獲取訂單資訊
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderNumber = searchParams.get('orderNumber');
    const amount = searchParams.get('amount');
    const productName = searchParams.get('productName') || 'VIP票 x 1';
    
    if (orderNumber) {
      setOrderDetails({
        orderNumber,
        productName,
        amount: parseInt(amount) || 2000
      });
    }
  }, [location.search]);

  // 處理返回
  const handleGoBack = () => {
    navigate(-1);
  };

  // 處理支付確認
  const handleConfirmPayment = () => {
    setLoading(true);
    
    // 模擬支付處理
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部標題區 */}
      <header className="bg-green-600 text-white py-3 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center">
              <CreditCard size={20} className="mr-2" />
              <h1 className="text-lg font-semibold">信用卡付款</h1>
            </div>
            <button 
              onClick={handleGoBack}
              className="p-1.5 hover:bg-green-700 rounded-full"
              aria-label="返回"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* 測試通知 */}
      <div className="bg-yellow-100 border-b border-yellow-200 py-1.5 px-4 text-sm text-yellow-800 text-center">
        <CheckCircle size={14} className="inline-block mr-1" />
        測試模式 - 僅用於開發環境
      </div>

      {/* 主要內容 */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* 步驟指示器 */}
          <div className="mb-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center">1</div>
                <div className="mx-2 text-gray-500">訂單確認</div>
              </div>
              <div className="w-12 h-1 bg-green-500 mx-2"></div>
              <div className="flex items-center">
                <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center">2</div>
                <div className="mx-2 text-green-600 font-medium">付款資訊</div>
              </div>
            </div>
          </div>

          {/* 信用卡支付表單 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* 訂單資訊 */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-600">訂單編號:</span>
                <span className="font-medium">{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">商品名稱:</span>
                <span className="font-medium">{orderDetails.productName}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600 font-medium">應付金額:</span>
                <span className="font-bold text-xl text-green-600">NT$ {orderDetails.amount}</span>
              </div>
            </div>
            
            {/* 信用卡資訊 */}
            <div className="p-5">
              {/* 信用卡類型 */}
              <div className="flex justify-center space-x-2 mb-6">
                <div className="w-12 h-7 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">VISA</div>
                <div className="w-12 h-7 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">MC</div>
                <div className="w-12 h-7 bg-gray-700 rounded text-white flex items-center justify-center text-xs font-bold">JCB</div>
              </div>
              
              {/* 信用卡輸入表單 */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">信用卡號碼</label>
                  <input 
                    type="text" 
                    className="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                    placeholder="4311-2222-3333-4444" 
                    defaultValue="4311-2222-3333-4444"
                    readOnly 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">到期日期</label>
                    <input 
                      type="text" 
                      className="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                      placeholder="MM/YY"
                      defaultValue="12/25" 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV 安全碼</label>
                    <input 
                      type="text" 
                      className="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                      placeholder="123" 
                      defaultValue="123"
                      readOnly 
                    />
                  </div>
                </div>
                
                {/* 安全提示 */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                  <div className="inline-flex items-center text-sm text-gray-500">
                    <ShieldCheck size={14} className="mr-1" />
                    測試環境：不會實際處理信用卡交易
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleCancelPayment}
              className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消支付
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className={`py-3 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 size={18} className="animate-spin mr-2" />
                  處理中...
                </span>
              ) : (
                '確認付款'
              )}
            </button>
          </div>
        </div>
      </main>

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
      <footer className="container mx-auto px-4 py-3 border-t border-gray-200 mt-8">
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 ECPay 綠界支付</p>
        </div>
      </footer>
    </div>
  );
};

export default PaymentStep2;