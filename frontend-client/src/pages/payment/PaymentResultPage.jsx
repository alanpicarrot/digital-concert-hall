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
  RefreshCw,
  Clock,
  CreditCard,
  Receipt,
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
  const [retryCount, setRetryCount] = useState(0);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(10);

  // 從URL參數獲取支付結果
  const queryParams = new URLSearchParams(location.search);

  // 支持兩種參數格式：綠界原始格式和模擬支付格式
  const merchantTradeNo =
    queryParams.get("MerchantTradeNo") || queryParams.get("orderNumber");
  const rtnCode = queryParams.get("RtnCode"); // 綠界格式：1 為成功
  const rtnMsg = queryParams.get("RtnMsg");
  const isSuccess = rtnCode === "1" || queryParams.get("success") === "true";
  const isCancelled = rtnCode === "0" || rtnMsg === "使用者取消交易";
  const isSimulated = queryParams.get("simulatedPayment") === "true";

  // 自動重定向倒計時
  useEffect(() => {
    if (isSuccess && !loading && orderDetails && autoRedirectCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoRedirectCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isSuccess && autoRedirectCountdown === 0) {
      navigate("/profile"); // 或者導向到訂單列表頁面
    }
  }, [isSuccess, loading, orderDetails, autoRedirectCountdown, navigate]);

  // 更可靠的訂單獲取函數，包含重試邏輯和多種訂單號格式嘗試
  const fetchOrderDetails = async (retryAttempt = 0) => {
    if (!merchantTradeNo) {
      setFetchError("找不到訂單編號");
      setLoading(false);
      return false;
    }

    try {
      console.log(
        `嘗試獲取訂單詳情: ${merchantTradeNo} (第${retryAttempt + 1}次嘗試)`
      );

      let orderData = null;

      // 首先嘗試使用原始訂單號
      try {
        orderData = await orderService.getOrderByNumber(merchantTradeNo);
        console.log("成功獲取訂單詳情:", orderData);
      } catch (error) {
        console.log("使用原始訂單號失敗，嘗試其他格式...");

        // 如果是 DCH- 格式，嘗試轉換為 ORD 格式
        if (merchantTradeNo.startsWith("DCH-")) {
          const ordFormatNumber = merchantTradeNo.replace("DCH-", "ORD");
          try {
            orderData = await orderService.getOrderByNumber(ordFormatNumber);
            console.log("使用 ORD 格式成功獲取訂單詳情:", orderData);
          } catch (ordError) {
            console.log("ORD 格式也失敗，嘗試其他方法...");
            throw error; // 使用原始錯誤
          }
        } else {
          throw error;
        }
      }

      if (orderData) {
        setOrderDetails(orderData);
        setFetchError(null);
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error(`第${retryAttempt + 1}次嘗試獲取訂單失敗:`, error);

      if (retryAttempt < 2) {
        // 最多重試3次
        console.log(`等待2秒後進行第${retryAttempt + 2}次嘗試...`);
        setTimeout(() => {
          fetchOrderDetails(retryAttempt + 1);
        }, 2000);
        return false;
      } else {
        setFetchError(
          error.response?.data?.message ||
            error.message ||
            "無法獲取訂單詳情，但您的付款可能已經成功處理"
        );
        setLoading(false);
        return false;
      }
    }
  };

  // 手動重試獲取訂單
  const handleRetryFetch = () => {
    setRetryCount((prev) => prev + 1);
    setLoading(true);
    setFetchError(null);
    fetchOrderDetails(0);
  };

  // 更可靠的支付通知函數，包含重試邏輯和多種訂單號格式
  const notifyPaymentResult = async () => {
    if (isSimulated || !isSuccess || paymentNotified) {
      return;
    }

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
        // 通知成功後，重新獲取訂單詳情
        setTimeout(() => {
          fetchOrderDetails();
        }, 1000);
      }
    } catch (error) {
      console.error("支付結果通知失敗:", error);
    }
  };

  useEffect(() => {
    // 如果沒有訂單編號，重定向到首頁
    if (!merchantTradeNo) {
      console.error("找不到訂單編號，返回首頁");
      navigate("/", { replace: true });
      return;
    }

    // 如果是取消交易，直接設置loading為已完成
    if (isCancelled) {
      console.log("交易已取消，跳過訂單獲取");
      setLoading(false);
      return;
    }

    // 開始獲取訂單詳情
    fetchOrderDetails();

    // 如果支付成功，嘗試通知後端
    if (isSuccess) {
      notifyPaymentResult();
    }
  }, [merchantTradeNo, isSuccess, isCancelled, navigate]);

  // 載入中狀態
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="w-full h-2 bg-blue-500 animate-pulse"></div>

          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
              <Loader2 size={40} className="text-blue-600 animate-spin" />
            </div>

            <h2 className="text-2xl font-bold mb-3">處理中...</h2>
            <p className="text-gray-600 mb-4">正在確認您的付款狀態，請稍候</p>

            {retryCount > 0 && (
              <p className="text-sm text-amber-600 mb-4">
                正在重試獲取訂單詳情... (第 {retryCount + 1} 次嘗試)
              </p>
            )}

            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              這可能需要幾秒鐘的時間
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* 頂部狀態條 */}
        <div
          className={`w-full h-2 ${
            isSuccess
              ? "bg-green-500"
              : isCancelled
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
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
                    <button
                      onClick={handleRetryFetch}
                      className="mt-2 text-yellow-800 hover:text-yellow-900 font-medium flex items-center"
                    >
                      <RefreshCw size={14} className="mr-1" />
                      重新獲取
                    </button>
                  </div>
                </div>
              )}

              {orderDetails && (
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-left font-medium text-gray-900 mb-3 flex items-center">
                    <Receipt size={18} className="mr-2" />
                    訂單資訊
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-500">訂單編號</span>
                      <span className="font-medium font-mono">
                        {orderDetails.orderNumber}
                        {orderDetails.orderNumber &&
                          orderDetails.orderNumber.startsWith("DCH-") && (
                            <span className="ml-2 text-xs text-amber-600">
                              (舊格式，系統已升級為 ORD 格式)
                            </span>
                          )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-500">訂單狀態</span>
                      <span className="font-medium text-green-600 flex items-center">
                        <CheckCircle size={16} className="mr-1" />
                        {orderDetails.status === "paid"
                          ? "已付款"
                          : orderDetails.paymentStatus === "paid"
                          ? "已付款"
                          : "處理中"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500">總金額</span>
                      <span className="font-bold text-lg text-green-600">
                        NT$ {orderDetails.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!orderDetails && !fetchError && (
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-left font-medium text-gray-900 mb-3 flex items-center">
                    <Receipt size={18} className="mr-2" />
                    訂單資訊
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-500">訂單編號</span>
                      <span className="font-medium font-mono">
                        {merchantTradeNo}
                        {merchantTradeNo &&
                          merchantTradeNo.startsWith("DCH-") && (
                            <span className="ml-2 text-xs text-amber-600">
                              (舊格式，系統已升級為 ORD 格式)
                            </span>
                          )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-500">訂單狀態</span>
                      <span className="font-medium text-green-600 flex items-center">
                        <CheckCircle size={16} className="mr-1" />
                        已付款
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 自動重定向提示 */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 flex items-center justify-center">
                  <Clock size={16} className="mr-2" />
                  {autoRedirectCountdown > 0
                    ? `頁面將在 ${autoRedirectCountdown} 秒後自動跳轉至個人中心...`
                    : "正在跳轉..."}
                </p>
              </div>

              {/* 操作按鈕 */}
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                >
                  <User size={20} className="inline mr-2" />
                  查看我的訂單
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/concerts"
                    className="block bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                  >
                    <ShoppingCart size={16} className="inline mr-1" />
                    繼續購票
                  </Link>
                  <Link
                    to="/"
                    className="block bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                  >
                    <Home size={16} className="inline mr-1" />
                    返回首頁
                  </Link>
                </div>
              </div>
            </div>
          ) : isCancelled ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
                <XCircle size={40} className="text-yellow-600" />
              </div>

              <h2 className="text-2xl font-bold mb-3">付款已取消</h2>
              <p className="text-gray-600 mb-6">
                您已取消此次付款，未產生任何費用。您可以隨時重新進行購票。
              </p>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <CreditCard size={16} className="mr-1" />
                  重新購票說明：
                </h3>
                <ul className="text-sm text-blue-700 text-left space-y-1">
                  <li>• 您的購物車內容已保留</li>
                  <li>• 可以隨時重新選購票券</li>
                  <li>• 熱門演出票券有限，建議盡快完成購買</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link
                  to="/concerts"
                  className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                >
                  <ShoppingCart size={20} className="inline mr-2" />
                  重新選購票券
                </Link>

                <Link
                  to="/"
                  className="block w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors text-center"
                >
                  <Home size={20} className="inline mr-2" />
                  返回首頁
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                <XCircle size={40} className="text-red-600" />
              </div>

              <h2 className="text-2xl font-bold mb-3">付款失敗</h2>
              <p className="text-gray-600 mb-6">
                很抱歉，您的付款未能成功處理。請重新嘗試或聯繫客服協助。
              </p>

              {rtnMsg && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>錯誤訊息：</strong> {rtnMsg}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw size={20} className="inline mr-2" />
                  重新嘗試付款
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/concerts"
                    className="block bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                  >
                    重新選購
                  </Link>
                  <Link
                    to="/"
                    className="block bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                  >
                    返回首頁
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 頁腳資訊 */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>交易時間：{new Date().toLocaleString("zh-TW")}</p>
            <p>© 2025 數位音樂廳 | 客服專線：02-2655-0115</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
