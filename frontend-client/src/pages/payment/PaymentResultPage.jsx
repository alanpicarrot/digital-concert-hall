import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Home,
  ShoppingCart,
  User,
  AlertTriangle,
} from "lucide-react";
import orderService from "../../services/orderService";
import authService from "../../services/authService";
import FeatureFlags from "../../services/featureFlagService";

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [paymentNotified, setPaymentNotified] = useState(false);

  // 從URL參數獲取支付結果
  const queryParams = new URLSearchParams(location.search);

  // 支持兩種參數格式：綠界原始格式和模擬支付格式
  const merchantTradeNo =
    queryParams.get("MerchantTradeNo") || queryParams.get("orderNumber");
  const rtnCode = queryParams.get("RtnCode"); // 綠界格式：1 為成功
  const rtnMsg = queryParams.get("RtnMsg");
  const isSuccess = rtnCode === "1" || queryParams.get("success") === "true";
  const isSimulated = queryParams.get("simulatedPayment") === "true";

  // 更可靠的訂單獲取函數，包含重試邏輯和多種訂單號格式嘗試
  const fetchOrderDetails = async () => {
    let retryCount = 0;
    const maxRetries = 3;

    console.log(`嘗試獲取訂單詳情: ${merchantTradeNo}`);

    const tryFetch = async () => {
      try {
        // 檢查登入狀態
        if (!authService.isTokenValid()) {
          console.log("用戶未登入或令牌已過期，嘗試刷新登入狀態");
        }

        // 定義可能的訂單號格式
        let orderFormats = [merchantTradeNo];
        
        // 優先使用 ORD 格式
        // 如果是DCH格式，嘗試轉換為 ORD 格式 (更精確的轉換邏輯)
        if (merchantTradeNo && merchantTradeNo.startsWith("DCH-")) {
          const dchPart = merchantTradeNo.substring(4);
          if (dchPart.length == 8) { // DCH-格式通常是8位字母數字組合
            // 生成一個類似的 ORD 格式訂單號（日期加上隨機數）
            // 嘗試使用当天和前一天的日期
            const today = new Date();
            
            // 嘗試今天的日期
            const getDateString = (date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}${month}${day}`;
            };
            
            // 今天的日期
            const todayStr = getDateString(today);
            
            // 嘗試今天的日期
            orderFormats.push(`ORD${todayStr}${dchPart}`);
            console.log(`嘗試轉換 DCH 訂單號 ${merchantTradeNo} 為今天的 ORD 格式: ORD${todayStr}${dchPart}`);
            
            // 嘗試前一天的日期
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = getDateString(yesterday);
            orderFormats.push(`ORD${yesterdayStr}${dchPart}`);
            console.log(`嘗試轉換 DCH 訂單號 ${merchantTradeNo} 為昨天的 ORD 格式: ORD${yesterdayStr}${dchPart}`);
          }
        }

        // 嘗試所有可能的訂單號格式
        let data = null;
        let lastError = null;
        let allOrdersNotFound = true;
        
        for (const orderFormat of orderFormats) {
          console.log(`嘗試使用訂單號格式: ${orderFormat}`);
          try {
            data = await orderService.getOrderByNumber(orderFormat);
            console.log(`成功使用訂單號格式 ${orderFormat} 獲取訂單詳情`, data);
            allOrdersNotFound = false;
            break;
          } catch (error) {
            console.log(`使用訂單號格式 ${orderFormat} 獲取失敗:`, error.message);
            // 檢查是否為「找不到訂單」的錯誤
            if (!error.isOrderNotFound) {
              allOrdersNotFound = false; // 某個體是其他錯誤，非找不到訂單
            }
            lastError = error;
          }
        }
        
        if (data) {
          console.log('成功獲取訂單詳情:', data);
          setOrderDetails(data);
          setFetchError(null);
          return true;
        } else {
          // 如果所有訂單無法獲取是因為「訂單不存在」，則設置一個特定的錯誤
          if (allOrdersNotFound) {
            const notFoundError = new Error('找不到訂單編號，請稍後刷新頁面或繼續等待訂單處理');
            notFoundError.isOrderNotFound = true;
            throw notFoundError;
          } else {
            throw lastError || new Error('所有格式的訂單號均無法獲取成功');
          }
        }
      } catch (error) {
        console.error(
          `嘗試獲取訂單詳情失敗 (第 ${retryCount + 1}/${maxRetries} 次):`,
          error
        );

        if (retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`${retryCount}秒後重試... (${retryCount}/${maxRetries})`);
          await new Promise((resolve) =>
            setTimeout(resolve, retryCount * 1000)
          );
          return false;
        } else {
          setFetchError(error);
          return false;
        }
      }
    };

    let success = await tryFetch();

    // 重試循環
    while (!success && retryCount < maxRetries) {
      success = await tryFetch();
    }

    // 無論成功與否，都設置loading為false
    setLoading(false);
    return success;
  };

  // 更可靠的支付通知函數，包含重試邏輯和多種訂單號格式
  const notifyPaymentResult = async () => {
    if (isSimulated || !isSuccess || paymentNotified) {
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;

    const tryNotify = async () => {
      try {
        console.log(
          `嘗試通知後端支付結果: ${merchantTradeNo}, 成功: ${isSuccess}`
        );

        // 使用fetch替代axios，避免可能的令牌問題
        const apiBaseUrl =
          process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";
        const response = await fetch(
          `${apiBaseUrl}/api/payment/ecpay/test-notify?orderNumber=${merchantTradeNo}&success=true`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          console.log("支付結果通知成功");
          setPaymentNotified(true);
          return true;
        } else {
          console.error(
            "支付結果通知失敗:",
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.error("錯誤詳情:", errorText);
          
          // 如果是原始訂單號失敗，嘗試使用其他格式的訂單號
          // 如果是 DCH 格式，嘗試轉換為 ORD 格式
          if (merchantTradeNo && merchantTradeNo.startsWith("DCH-")) {
            const dchPart = merchantTradeNo.substring(4);
            if (dchPart.length == 8) { // DCH-格式通常是8位字母數字組合
              // 嘗試使用当天和前一天的日期
              const today = new Date();
              
              // 產生日期字串的輔助函數
              const getDateString = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}${month}${day}`;
              };
              
              // 嘗試今天的日期
              const todayStr = getDateString(today);
              const todayOrderNumber = `ORD${todayStr}${dchPart}`;
              
              console.log(`嘗試使用今天的 ORD 格式訂單號通知: ${todayOrderNumber}`);
              try {
                const todayResponse = await fetch(
                  `${apiBaseUrl}/api/payment/ecpay/test-notify?orderNumber=${todayOrderNumber}&success=true`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                  }
                );
                
                if (todayResponse.ok) {
                  console.log(`使用今天的 ORD 格式 ${todayOrderNumber} 通知成功`);
                  setPaymentNotified(true);
                  return true;
                }
              } catch (notifyError) {
                console.error(`使用今天的 ORD 格式通知失敗:`, notifyError);
              }
              
              // 嘗試前一天的日期
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = getDateString(yesterday);
              const yesterdayOrderNumber = `ORD${yesterdayStr}${dchPart}`;
              
              console.log(`嘗試使用昨天的 ORD 格式訂單號通知: ${yesterdayOrderNumber}`);
              try {
                const yesterdayResponse = await fetch(
                  `${apiBaseUrl}/api/payment/ecpay/test-notify?orderNumber=${yesterdayOrderNumber}&success=true`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                  }
                );
                
                if (yesterdayResponse.ok) {
                  console.log(`使用昨天的 ORD 格式 ${yesterdayOrderNumber} 通知成功`);
                  setPaymentNotified(true);
                  return true;
                }
              } catch (notifyError) {
                console.error(`使用昨天的 ORD 格式通知失敗:`, notifyError);
              }
            }
          }
          
          return false;
        }
      } catch (error) {
        console.error(
          `支付結果通知錯誤 (第 ${retryCount + 1}/${maxRetries} 次):`,
          error
        );

        if (retryCount < maxRetries - 1) {
          retryCount++;
          console.log(
            `${retryCount}秒後重試通知... (${retryCount}/${maxRetries})`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, retryCount * 1000)
          );
          return false;
        } else {
          return false;
        }
      }
    };

    let success = await tryNotify();

    // 重試循環
    while (!success && retryCount < maxRetries) {
      success = await tryNotify();
    }

    // 通知完成後，嘗試再次獲取訂單詳情
    if (success) {
      console.log("支付通知成功，2秒後重新獲取訂單詳情");
      setTimeout(() => {
        fetchOrderDetails();
      }, 2000);
    }
  };

  useEffect(() => {
    // 如果沒有訂單編號，重定向到首頁
    if (!merchantTradeNo) {
      console.error("找不到訂單編號，返回首頁");
      navigate("/", { replace: true });
      return;
    }

    // 創建重試函數，使用升級版的重試邏輯
    const fetchWithRetries = async () => {
      // 設置指數退避策略的延遲
      let delay = 1000; // 初始1秒
      let attempts = 0;
      const maxAttempts = 10; // 增加最大嘗試次數
      
      while (attempts < maxAttempts) {
        const success = await fetchOrderDetails();
        if (success) {
          console.log(`在第 ${attempts+1} 次嘗試時成功獲取訂單詳情`);
          // 成功獲取訂單後，嘗試通知支付結果
          notifyPaymentResult();
          return true;
        }
        
        // 如果還未達到最大嘗試次數，等待後再次嘗試
        if (attempts < maxAttempts - 1) {
          console.log(`第 ${attempts+1} 次嘗試失敗，將在 ${delay/1000} 秒後再次嘗試...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          // 使用指數退避策略增加延遲，但最大不超過8秒
          delay = Math.min(delay * 1.5, 8000);
        }
        
        attempts++;
      }
      
      console.warn(`經過 ${maxAttempts} 次嘗試後仍無法獲取訂單詳情`);
      // 即使獲取失敗，仍然嘗試通知支付結果
      notifyPaymentResult();
      return false;
    };
    
    // 啟動重試流程
    fetchWithRetries();

    // 如果支付成功，設置10秒後自動跳轉到我的訂單頁面
    if (isSuccess) {
      const timer = setTimeout(() => {
        // 增加時間戳作為查詢參數，確保不使用緩存
        navigate(`/user/orders?refresh=${Date.now()}`);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [merchantTradeNo, isSuccess, isSimulated, navigate]);

  // 顯示加載中狀態
  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="mx-auto text-indigo-600 animate-spin mb-4"
          />
          <p className="text-xl text-gray-600">正在處理您的付款結果...</p>
        </div>
      </div>
    );
  }

  // 即使獲取訂單細節失敗，也顯示支付結果頁面
  // 但會在頁面中顯示警告訊息
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* 頂部狀態條 */}
        <div
          className={`w-full h-2 ${isSuccess ? "bg-green-500" : "bg-red-500"}`}
        ></div>

        <div className="p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>

              <h2 className="text-2xl font-bold mb-3">付款成功</h2>
              <p className="text-gray-600 mb-6">
                您的訂單已成功付款處理，謝謝您的購買！
                {isSimulated && FeatureFlags.isEnabled("DEBUG_MODE") && (
                  <span className="block mt-2 text-xs bg-gray-100 text-gray-500 p-1 rounded">
                    (模擬支付模式)
                  </span>
                )}
              </p>

              {fetchError && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start">
                  <AlertTriangle
                    size={20}
                    className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-left text-sm text-yellow-700">
                    <p className="font-medium">獲取訂單詳情時遇到問題</p>
                    <p className="mt-1">
                      您的付款已成功處理，但我們無法載入訂單詳情。請稍後在「我的訂單」中查看。
                    </p>
                  </div>
                </div>
              )}

              {orderDetails && (
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-left font-medium text-gray-900 mb-3">
                    訂單資訊
                  </h3>
                  <div className="flex justify-between mb-2 pb-2 border-b border-gray-100">
                    <span className="text-gray-500">訂單編號</span>
                    <span className="font-medium">
                      {orderDetails.orderNumber}
                      {orderDetails.orderNumber && orderDetails.orderNumber.startsWith("DCH-") && (
                        <span className="ml-2 text-xs text-amber-600">(舊格式，系統已升級為 ORD 格式)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2 pb-2 border-b border-gray-100">
                    <span className="text-gray-500">訂單狀態</span>
                    <span className="font-medium text-green-600">
                      {orderDetails.status === "paid"
                        ? "已付款"
                        : orderDetails.paymentStatus === "paid"
                        ? "已付款"
                        : "處理中"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-500">總金額</span>
                    <span className="font-bold text-lg">
                      NT$ {orderDetails.totalAmount}
                    </span>
                  </div>
                </div>
              )}

              {!orderDetails && !fetchError && (
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-left font-medium text-gray-900 mb-3">
                    訂單資訊
                  </h3>
                  <div className="flex justify-between mb-2 pb-2 border-b border-gray-100">
                    <span className="text-gray-500">訂單編號</span>
                    <span className="font-medium">
                      {merchantTradeNo}
                      {merchantTradeNo && merchantTradeNo.startsWith("DCH-") && (
                        <span className="ml-2 text-xs text-amber-600">(舊格式，系統已升級為 ORD 格式)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2 pb-2 border-b border-gray-100">
                    <span className="text-gray-500">訂單狀態</span>
                    <span className="font-medium text-green-600">已付款</span>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 mb-6">
                頁面將在10秒後自動跳轉至訂單詳情...
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Home size={18} />
                  <span>返回首頁</span>
                </Link>

                <Link
                  to="/user/orders"
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors"
                >
                  <User size={18} />
                  <span>我的訂單</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                <XCircle size={40} className="text-red-600" />
              </div>

              <h2 className="text-2xl font-bold mb-3">付款未完成</h2>
              <p className="text-gray-600 mb-6">
                很抱歉，您的付款處理未能完成。
              </p>

              <div className="mb-8 p-5 bg-red-50 rounded-lg border border-red-100">
                <h3 className="text-left font-medium text-red-800 mb-2">
                  錯誤資訊
                </h3>
                <p className="text-red-600">
                  {rtnMsg || "處理您的付款時發生錯誤，請稍後再試。"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/cart"
                  className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart size={18} />
                  <span>返回購物車</span>
                </Link>

                <Link
                  to={`/checkout/${merchantTradeNo}`}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors"
                >
                  <ArrowRight size={18} />
                  <span>重新付款</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;