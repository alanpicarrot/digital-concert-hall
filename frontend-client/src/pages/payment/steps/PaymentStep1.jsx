import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, CheckCircle, ArrowLeft, Shield } from "lucide-react";

/**
 * 支付步驟 1: 訂單確認與支付方式選擇
 */
const PaymentStep1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: "",
    productName: "", // 保持空字串，但會從真實資料動態設置
    amount: 0,
  });

  // 從URL參數獲取訂單資訊
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderNumber = searchParams.get("orderNumber");
    const amount = searchParams.get("amount");
    const productName = searchParams.get("productName");

    if (orderNumber) {
      // 如果有URL參數，優先使用URL參數（表示來自已創建的訂單）
      setOrderDetails({
        orderNumber,
        productName: productName || "VIP票 x 1", // 使用URL參數或預設值
        amount: parseInt(amount) || 2000,
      });
    } else {
      // 如果沒有URL參數，從sessionStorage中獲取直接購買的資料
      const storedDetails = sessionStorage.getItem("checkoutInfo");
      if (storedDetails) {
        try {
          const parsedDetails = JSON.parse(storedDetails);

          // 使用真實的票券資料組合商品名稱
          const realProductName =
            parsedDetails.ticketType && parsedDetails.quantity
              ? `${parsedDetails.ticketType} x ${parsedDetails.quantity}`
              : parsedDetails.concertTitle && parsedDetails.quantity
              ? `${parsedDetails.concertTitle} x ${parsedDetails.quantity}`
              : "VIP票 x 1";

          // 使用真實的價格數據
          const realAmount =
            parsedDetails.totalAmount ||
            (parsedDetails.ticketPrice && parsedDetails.quantity
              ? parsedDetails.ticketPrice * parsedDetails.quantity
              : 2000);

          setOrderDetails({
            orderNumber:
              parsedDetails.orderNumber ||
              "ORD" + Date.now().toString().slice(-8),
            productName: realProductName,
            amount: realAmount,
          });

          console.log("從sessionStorage獲取的真實票券資料:", {
            ticketType: parsedDetails.ticketType,
            quantity: parsedDetails.quantity,
            ticketPrice: parsedDetails.ticketPrice,
            totalAmount: parsedDetails.totalAmount,
            組合後商品名稱: realProductName,
            計算金額: realAmount,
          });
        } catch (err) {
          console.error("無法解析訂單詳情", err);
          // 提供預設值
          setOrderDetails({
            orderNumber: "ORD" + Date.now().toString().slice(-8),
            productName: productName || "VIP票 x 1",
            amount: parseInt(amount) || 2000,
          });
        }
      } else {
        // 如果沒有儲存的資料，使用預設值
        setOrderDetails({
          orderNumber: "ORD" + Date.now().toString().slice(-8),
          productName: productName || "VIP票 x 1",
          amount: parseInt(amount) || 2000,
        });
      }
    }
  }, [location.search]);

  // 處理繼續結帳
  const handleContinue = () => {
    navigate(
      `/payment/steps/payment?orderNumber=${orderDetails.orderNumber}&amount=${
        orderDetails.amount
      }&productName=${encodeURIComponent(orderDetails.productName)}`
    );
  };

  // 處理返回
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部標題區 */}
      <header className="bg-indigo-600 text-white py-3 px-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold">訂單確認</h1>
            </div>
            <button
              onClick={handleGoBack}
              className="p-1.5 hover:bg-indigo-700 rounded-full"
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
        測試模式 - 模擬支付流程
      </div>

      {/* 主要內容 */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* 步驟指示器 */}
          <div className="mb-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                  1
                </div>
                <div className="mx-2 text-indigo-600 font-medium">訂單確認</div>
              </div>
              <div className="w-12 h-1 bg-gray-300 mx-2"></div>
              <div className="flex items-center">
                <div className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
                  2
                </div>
                <div className="mx-2 text-gray-500">付款資訊</div>
              </div>
            </div>
          </div>

          {/* 訂單資訊卡片 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">訂單資訊</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">訂單編號:</span>
                  <span className="font-medium">
                    {orderDetails.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">商品名稱:</span>
                  <span className="font-medium">
                    {orderDetails.productName}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-700 font-medium">應付金額:</span>
                  <span className="font-bold text-xl text-indigo-600">
                    NT$ {orderDetails.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 支付方式卡片 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                選擇支付方式
              </h2>
            </div>
            <div className="p-5">
              {/* 支付選項 */}
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-indigo-50 border-indigo-200">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment-method"
                      className="form-radio text-indigo-600"
                      defaultChecked
                    />
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-800">
                            信用卡支付
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            使用Visa、MasterCard、JCB卡片支付
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                            VISA
                          </div>
                          <div className="w-8 h-5 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">
                            MC
                          </div>
                          <div className="w-8 h-5 bg-gray-700 rounded text-white flex items-center justify-center text-xs font-bold">
                            JCB
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="border rounded-lg p-4 border-gray-200">
                  <label className="flex items-center opacity-50 cursor-not-allowed">
                    <input
                      type="radio"
                      name="payment-method"
                      className="form-radio text-gray-400"
                      disabled
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-600">
                        Line Pay
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        測試環境暫不支援
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 安全提示 */}
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <div className="inline-flex items-center text-sm text-gray-500">
                  <Shield size={14} className="mr-1" />
                  您的支付資訊受到加密保護
                </div>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleGoBack}
              className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <ArrowLeft size={16} className="mr-1" />
                返回
              </div>
            </button>
            <button
              onClick={handleContinue}
              className="py-3 px-8 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <div className="flex items-center">
                <span>繼續結帳</span>
                <CreditCard size={16} className="ml-2" />
              </div>
            </button>
          </div>

          {/* 頁腳 */}
          <div className="mt-10 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>© 2025 Digital Concert Hall - 支付服務由綠界科技提供</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentStep1;
