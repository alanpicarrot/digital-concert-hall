import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  X,
  CheckCircle,
  ArrowLeft,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Receipt,
  Info,
  Building,
} from "lucide-react";

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
    orderNumber: "",
    productName: "",
    amount: 0,
  });

  // 從URL參數或localStorage獲取訂單信息
  useEffect(() => {
    // 從URL參數中獲取訂單ID
    const searchParams = new URLSearchParams(location.search);
    const orderNumber = searchParams.get("orderNumber");
    const amount = searchParams.get("amount");
    const productName = searchParams.get("productName") || "test x 1";
    const mode = searchParams.get("mode") || "default";

    // 如果是彈出模式，設置body的樣式使背景頁面無法滾動
    if (mode === "popup") {
      document.body.style.overflow = "hidden";
    }

    // 在全局環境中定義simulatePayment函數 - 即使是在多次載入時也確保它存在
    window.simulatePayment = function () {
      console.log("跳轉到模擬綠界支付頁面 - 從ECPayMockPage定義");
      navigate(
        `/payment/ecpay?orderNumber=${
          orderNumber || "DCH-" + Date.now()
        }&amount=${amount || 1000}&mode=popup`
      );
    };

    if (orderNumber) {
      setOrderDetails({
        orderNumber,
        productName,
        amount: parseInt(amount) || 1000,
      });
    } else {
      // 如果沒有URL參數，從localStorage中獲取
      const storedDetails = sessionStorage.getItem("checkoutInfo");
      if (storedDetails) {
        try {
          const parsedDetails = JSON.parse(storedDetails);
          setOrderDetails({
            orderNumber: parsedDetails.orderNumber || "DCH-" + Date.now(),
            productName: parsedDetails.productName || "票券 x 1",
            amount: parsedDetails.totalAmount || 1000,
          });
        } catch (err) {
          console.error("無法解析訂單詳情", err);
          setOrderDetails({
            orderNumber: "DCH-" + Date.now(),
            productName: "票券 x 1",
            amount: 1000,
          });
        }
      } else {
        setOrderDetails({
          orderNumber: "DCH-" + Date.now(),
          productName: "票券 x 1",
          amount: 1000,
        });
      }
    }

    // 清理函數
    return () => {
      if (mode === "popup") {
        document.body.style.overflow = "auto";
      }
    };
  }, [location.search, navigate]);

  const handleConfirmPayment = () => {
    setLoading(true);

    // 模擬支付處理進度
    const simulateProgress = () => {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(progressInterval);
          // 跳轉到付款結果頁面
          navigate(
            `/payment/result?MerchantTradeNo=${orderDetails.orderNumber}&RtnCode=1&RtnMsg=交易成功&simulatedPayment=true`
          );
        }
      }, 200); // 每200ms增加10%進度
    };

    // 開始模擬進度
    setTimeout(simulateProgress, 500);
  };

  const handleCancelPayment = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    navigate(
      `/payment/result?MerchantTradeNo=${orderDetails.orderNumber}&RtnCode=0&RtnMsg=使用者取消交易&simulatedPayment=true`
    );
  };

  const closeConfirmDialog = () => {
    setShowCancelConfirm(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部標題區 - 綠界品牌色彩 */}
      <header className="bg-green-600 text-white py-4 px-4 shadow-lg">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building size={24} className="mr-3" />
              <div>
                <h1 className="text-xl font-bold">ECPay 綠界科技</h1>
                <p className="text-green-100 text-sm">
                  安全可信賴的第三方支付平台
                </p>
              </div>
            </div>
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-green-700 rounded-full transition-colors"
              aria-label="返回"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 測試環境提示 */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-center text-amber-800">
            <Info size={16} className="mr-2" />
            <span className="font-medium">測試模式</span>
            <span className="mx-2">•</span>
            <span className="text-sm">
              這是一個模擬支付頁面，僅用於開發測試
            </span>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <main className="container mx-auto px-6 lg:px-12 xl:px-16 py-8">
        <div className="grid xl:grid-cols-5 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* 左側：訂單資訊 */}
          <div className="xl:col-span-2 lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Receipt size={20} className="mr-2" />
                  訂單資訊
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">訂單編號</span>
                  <span className="font-mono text-sm font-medium">
                    {orderDetails.orderNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">商品名稱</span>
                  <span className="font-medium text-sm">
                    {orderDetails.productName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4 -mx-2">
                  <span className="text-gray-700 font-medium">應付金額</span>
                  <span className="text-2xl font-bold text-green-600">
                    NT$ {orderDetails.amount?.toLocaleString()}
                  </span>
                </div>

                {/* 安全保障提示 */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <ShieldCheck size={16} className="mr-2 text-green-600" />
                    <span>SSL 加密保護</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Lock size={16} className="mr-2 text-green-600" />
                    <span>符合 PCI DSS 安全標準</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：支付表單 */}
          <div className="xl:col-span-3 lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <CreditCard size={24} className="mr-3" />
                  信用卡支付
                </h2>
                <p className="text-green-100 text-sm mt-1">
                  請填寫您的信用卡資訊以完成付款
                </p>
              </div>

              {/* 支持的卡片類型 */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-3">支持的信用卡類型：</p>
                <div className="flex space-x-3">
                  <div className="w-12 h-8 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    VISA
                  </div>
                  <div className="w-12 h-8 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    MC
                  </div>
                  <div className="w-12 h-8 bg-gray-700 rounded text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    JCB
                  </div>
                  <div className="w-12 h-8 bg-blue-800 rounded text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    AE
                  </div>
                </div>
              </div>

              {/* 信用卡表單 */}
              <div className="p-6">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      信用卡號碼 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-lg"
                      placeholder="0000 0000 0000 0000"
                      defaultValue="4311-2222-3333-4444"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      測試環境：預填測試卡號
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        到期日期 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-lg"
                        placeholder="MM/YY"
                        defaultValue="12/25"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV 安全碼 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-lg"
                        placeholder="123"
                        defaultValue="123"
                        readOnly
                      />
                    </div>
                    <div className="lg:col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        持卡人姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                        placeholder="請輸入持卡人姓名"
                        defaultValue="測試 用戶"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* 測試模式說明 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <Info size={20} className="text-blue-600 mr-3 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">測試環境說明</p>
                        <p className="leading-relaxed">
                          此為模擬支付環境，不會產生實際費用。表單已預填測試資料，點擊「確認付款」即可模擬支付成功流程。
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作按鈕 */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-6 w-full max-w-lg">
            <button
              onClick={handleCancelPayment}
              className="flex-1 py-4 px-8 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
            >
              取消支付
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className={`flex-1 py-4 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  處理中...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Lock size={20} className="mr-2" />
                  確認付款
                </span>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* 頁腳 */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 text-center">
          <p className="text-sm text-gray-600">
            © 2025 綠界科技股份有限公司 |<span className="mx-2">•</span>
            客服專線：02-2655-0115
          </p>
        </div>
      </footer>

      {/* 取消確認對話框 */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4 text-amber-600">
                <AlertTriangle className="mr-3" size={24} />
                <h3 className="text-lg font-semibold">確認取消付款</h3>
              </div>
              <p className="mb-6 text-gray-600">
                您確定要取消此次付款嗎？取消後將返回上一頁，您可以稍後再完成付款。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConfirmDialog}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  繼續付款
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  確認取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ECPayMockPage;
