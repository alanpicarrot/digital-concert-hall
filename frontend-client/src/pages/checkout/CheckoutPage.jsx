import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Loader2,
  CreditCard,
  ShoppingBag,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Info,
  Receipt,
} from "lucide-react";
import authService from "../../services/authService";
import orderService from "../../services/orderService";
import { useToast } from "../../contexts/ToastContext";
import StepProgress from "../../components/ui/StepProgress";
import DiscountBadge from "../../components/ui/DiscountBadge";

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
  const [orderSummary, setOrderSummary] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // 使用useRef追踪數據載入狀態，避免useEffect重複執行
  const dataLoadedRef = useRef(false);
  const lastOrderNumberRef = useRef(null);
  // 追踪Toast是否已經顯示過
  const toastShownRef = useRef(false);

  // 全局暴露支付模擬函數，確保在開發環境中按鈕可以正常工作
  // 這個函數將在組件卸載時被清理
  useEffect(() => {
    const setupSimulatePayment = () => {
      if (process.env.NODE_ENV === "development") {
        // 先檢查並清除可能存在的舊函數
        if (window.simulatePayment) {
          delete window.simulatePayment;
        }

        // 創建新的模擬支付函數
        window.simulatePayment = () => {
          // 使用新的分步模式支付流程，延遲獲取金額以避免循環依賴
          const getCurrentAmount = () => {
            return order?.totalAmount || directCheckout?.totalAmount || 1000;
          };

          navigate(
            `/payment/steps/order?orderNumber=${orderNumber}&amount=${getCurrentAmount()}`
          );
        };

        if (process.env.NODE_ENV === "development") {
          console.log("已設置模擬支付函數");
        }
      }
    };

    setupSimulatePayment();

    // 組件卸載時清理全局函數
    return () => {
      if (window.simulatePayment) {
        delete window.simulatePayment;
        if (process.env.NODE_ENV === "development") {
          console.log("已清理模擬支付函數");
        }
      }
    };
  }, [orderNumber, navigate]); // 移除order和directCheckout依賴項

  // 簡化的認證檢查
  useEffect(() => {
    const verifyAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("結帳頁面認證檢查:", {
        hasToken: !!token,
        hasUser: !!userStr,
        fromState: location.state?.authenticated,
      });

      // 如果有基本認證數據或從狀態中標記為已認證，則通過
      if ((token && userStr) || location.state?.authenticated) {
        console.log("認證檢查通過");
        return;
      }

      // 否則重定向到登入
      console.log("認證檢查失敗，重定向到登入");
      navigate("/auth/login", {
        state: { from: location.pathname },
      });
    };

    verifyAuth();
  }, [location, navigate]);

  // 確保獲取結帳數據並在卸載時清理全局函數
  useEffect(() => {
    // 檢查是否需要載入數據
    const shouldLoadData = () => {
      // 如果訂單號變更了，需要重新載入
      if (lastOrderNumberRef.current !== orderNumber) {
        lastOrderNumberRef.current = orderNumber;
        dataLoadedRef.current = false;
        toastShownRef.current = false; // 重置Toast狀態
        return true;
      }

      // 如果已經載入過且訂單號沒變，跳過
      if (dataLoadedRef.current) {
        return false;
      }

      // 初次載入
      return true;
    };

    if (!shouldLoadData()) {
      console.log("Skip loading - data already loaded for current order");
      return;
    }

    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (orderNumber) {
          // 如果有訂單號，從API獲取訂單信息
          if (process.env.NODE_ENV === "development") {
            console.log("Fetching order data for order number:", orderNumber);
          }
          try {
            const orderData = await orderService.getOrderByNumber(orderNumber);
            if (process.env.NODE_ENV === "development") {
              console.log("Order data fetched successfully");
            }

            // 顯示訂單加載成功的通知
            if (!toastShownRef.current) {
              toast.showSuccess(
                "訂單已就緒",
                `訂單 #${orderNumber} 已成功加載，請確認資訊後進行付款`
              );
              toastShownRef.current = true; // 標記Toast已顯示
            }

            // 處理訂單摘要信息
            const summary = {
              totalItems: orderData.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              ),
              subtotal: orderData.items.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0
              ),
              discount: 0,
              totalAmount: orderData.totalAmount,
            };

            // 檢查是否有折扣
            if (orderData.discountCode || orderData.discountAmount > 0) {
              summary.discount = orderData.discountAmount || 0;
              setAppliedDiscount({
                code: orderData.discountCode || "自動折扣",
                amount: orderData.discountAmount || 0,
                percentage: orderData.discountPercentage || null,
              });
            }

            setOrderSummary(summary);

            // 驗證訂單總價是否正確
            if (orderData && orderData.items) {
              // 修復：直接使用後端返回的總額，不進行前端重新計算
              // 因為前端計算邏輯與後端可能不一致（price vs unitPrice等）
              if (process.env.NODE_ENV === "development") {
                console.log("使用後端返回的訂單總額:", orderData.totalAmount);
              }

              // 不再進行前端重新計算，直接使用後端數據
              // 這樣可以避免 calculateTotal 函數中 price vs unitPrice 的問題
            }

            setOrder(orderData);
            setDirectCheckout(null);
            dataLoadedRef.current = true; // 標記數據已載入
          } catch (err) {
            console.error("Error fetching order:", err);
            setError("無法獲取訂單資訊，請返回重試");
          }
        } else {
          // 從sessionStorage中獲取直接購買信息
          if (process.env.NODE_ENV === "development") {
            console.log("Checking for direct checkout info in sessionStorage");
          }
          const checkoutInfoStr = sessionStorage.getItem("checkoutInfo");

          if (checkoutInfoStr) {
            try {
              const checkoutInfo = JSON.parse(checkoutInfoStr);
              if (process.env.NODE_ENV === "development") {
                console.log("Direct checkout info found");
              }
              // 清理購物車數據，避免重複處理
              const wasCleanupPerformed = sessionStorage.getItem(
                "checkoutInfoProcessed"
              );
              if (!wasCleanupPerformed) {
                if (process.env.NODE_ENV === "development") {
                  console.log("已清理暫時之付款數");
                }
                sessionStorage.setItem("checkoutInfoProcessed", "true");
              }

              setDirectCheckout(checkoutInfo);
              setOrder(null);

              if (!toastShownRef.current) {
                toast.showInfo("準備完成", "購票資訊已就绪，請確認後進行付款");
                toastShownRef.current = true; // 標記Toast已顯示
              }

              // 為直接購買建立訂單摘要 - 使用健壯的數據處理方式
              const summary = {
                // 確保有默認值，避免 undefined * number = NaN
                totalItems: checkoutInfo.quantity || 0,
                subtotal:
                  (checkoutInfo.ticketPrice || 0) *
                  (checkoutInfo.quantity || 0),
                discount: checkoutInfo.discountAmount || 0,
                // 總金額計算優先使用傳入的值，否則基於小計和折扣計算
                totalAmount:
                  checkoutInfo.totalAmount ||
                  (checkoutInfo.ticketPrice || 0) *
                    (checkoutInfo.quantity || 0) -
                    (checkoutInfo.discountAmount || 0),
              };

              // 如果存在 subtotal，優先使用它
              if (checkoutInfo.subtotal && !isNaN(checkoutInfo.subtotal)) {
                summary.subtotal = checkoutInfo.subtotal;
              }

              // 檢查是否有折扣
              if (
                checkoutInfo.discountCode ||
                checkoutInfo.discountAmount > 0
              ) {
                summary.discount = checkoutInfo.discountAmount || 0;
                setAppliedDiscount({
                  code: checkoutInfo.discountCode || "自動折扣",
                  amount: checkoutInfo.discountAmount || 0,
                  percentage: checkoutInfo.discountPercentage || null,
                });
                // 如果有折扣，重新計算總金額
                summary.totalAmount = summary.subtotal - summary.discount;
              }

              setOrderSummary(summary);
              dataLoadedRef.current = true; // 標記數據已載入
            } catch (err) {
              console.error("Error parsing checkout info:", err);
              setError("購票資訊無效，請返回重新選擇");
            }
          } else {
            if (process.env.NODE_ENV === "development") {
              console.log("No checkout information found");
            }
            setError("找不到結帳資訊，請返回選擇音樂會");
          }
        }
      } catch (error) {
        console.error("Checkout error:", error);
        setError("發生錯誤，請稍後重試");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();

    // 組件卸載時清除臨時狀態標記
    return () => {
      sessionStorage.removeItem("checkoutInfoProcessed");
    };
  }, [orderNumber]); // 移除toast依賴項，只依賴orderNumber

  // 使用 useCallback 包裝 handlePayment
  const handlePayment = useCallback(async () => {
    try {
      setPaymentLoading(true);
      toast.showInfo("準備付款", "正在將您導向付款頁面...");

      // 確保登入狀態正確
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        if (process.env.NODE_ENV === "development") {
          console.log("未登入狀態下嘗試結帳，將導向至登入");
        }

        // 將用戶導向到登入頁面，並記錄要返回的頁面
        setPaymentLoading(false);
        toast.showWarning("需要登入", "我們將導引您登入後繼續結帳流程");

        // 使用小延遲以等待提示顯示
        setTimeout(() => {
          const currentPath = location.pathname;
          navigate("/auth/login", {
            state: {
              from: currentPath,
              message: "您需要先登入才能完成支付",
              redirectAfterLogin: true,
              isCheckout: true, // 添加標記表明這是來自結帳頁面
            },
          });
        }, 500);
        return;
      }

      // 如果是直接購票，需要先在後端創建一個訂單
      if (directCheckout) {
        try {
          // 驗證必要的票券數據
          if (!directCheckout.ticketId) {
            console.error("票券ID缺失，無法完成訂單", directCheckout);
            setError("票券數據不完整，請返回重新選擇門票");
            setPaymentLoading(false);
            return;
          }

          // 建立購物車對象
          // 建立更完整的購物車請求對象
          const cartRequest = {
            items: [
              {
                id: directCheckout.ticketId,
                quantity: directCheckout.quantity || 1, // 確保數量至少為1
                concertId: directCheckout.concertId,
                type: "ticket", // 確保類型始終是ticket
                ticketType: directCheckout.ticketType, // 票券類型名稱
                ticketTypeId: directCheckout.ticketTypeId, // 如果有提供票券類型ID
                performanceId: directCheckout.performanceId, // 演出場次ID很重要
                price: directCheckout.ticketPrice, // 確保價格也包含在內
              },
            ],
          };

          // 添加日誌以確認數據
          if (process.env.NODE_ENV === "development") {
            console.log(
              "創建直接購買訂單:",
              JSON.stringify(cartRequest, null, 2)
            );
          }

          // 調用後端 API 創建訂單
          const createdOrder = await orderService.createOrder(cartRequest);
          if (process.env.NODE_ENV === "development") {
            console.log("直接購買訂單創建成功:", createdOrder);
          }

          // 使用實際創建的訂單號替代模擬訂單號
          const realOrderNumber = createdOrder.orderNumber;
          sessionStorage.removeItem("checkoutInfo"); // 清除結帳信息

          // 稍微延遲以確保訂單在數據庫中完全提交
          setTimeout(() => {
            // 在開發環境中使用模擬支付
            if (process.env.NODE_ENV === "development") {
              // 構建商品名稱
              const productName =
                directCheckout.ticketType && directCheckout.quantity
                  ? `${directCheckout.ticketType} x ${directCheckout.quantity}`
                  : `${directCheckout.concertTitle} x ${
                      directCheckout.quantity || 1
                    }`;

              navigate(
                `/payment/steps/order?orderNumber=${realOrderNumber}&amount=${
                  createdOrder.totalAmount
                }&productName=${encodeURIComponent(productName)}`
              );
              setPaymentLoading(false);
              return;
            }

            // 正式環境則重定向到真實支付頁面
            navigate(`/checkout/${realOrderNumber}`);
            setPaymentLoading(false);
          }, 1000);
          return;
        } catch (error) {
          console.error("創建訂單失敗:", error);

          // 檢查是否為認證錯誤
          if (error.response && error.response.status === 401) {
            toast.showWarning("登入狀態失效", "您的登入已過期，將重新登入");
            setTimeout(() => {
              navigate("/auth/login", {
                state: {
                  from: location.pathname,
                  isCheckout: true,
                },
              });
            }, 500);
            return;
          }

          setError(error.message || "創建訂單時發生錯誤，請稍後再試");
          setPaymentLoading(false);
          return;
        }
      }

      // 原本訂單支付部分
      if (orderNumber) {
        try {
          // 創建表單請求，返回HTML
          const response = await authService.axiosInstance.post(
            "/api/payment/ecpay/create",
            { orderNumber },
            { responseType: "text" }
          );

          // 創建一個臨時的HTML元素來處理返回的表單
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = response.data;

          // 將返回的HTML插入到body並提交表單
          document.body.appendChild(tempDiv);

          // 如果測試環境, 直接跳轉到模擬支付頁面
          if (process.env.NODE_ENV === "development") {
            // 在開發環境中直接跳轉到模擬支付頁面
            console.log("開發環境：直接跳轉到模擬支付頁面");
            console.log("訂單號:", orderNumber, "金額:", order?.totalAmount);

            // 簡化邏輯：直接跳轉到分步支付頁面
            setTimeout(() => {
              // 構建商品名稱（從訂單資料中獲取）
              let productName = "票券 x 1"; // 預設值
              if (order && order.items && order.items.length > 0) {
                const firstItem = order.items[0];
                const itemName =
                  firstItem.concertTitle || firstItem.description || "票券";
                const totalQuantity = order.items.reduce(
                  (sum, item) => sum + (item.quantity || 1),
                  0
                );
                productName = `${itemName} x ${totalQuantity}`;
              }

              const paymentUrl = `/payment/steps/order?orderNumber=${orderNumber}&amount=${
                order?.totalAmount || 1000
              }&productName=${encodeURIComponent(productName)}`;
              console.log("跳轉到付款頁面:", paymentUrl);
              navigate(paymentUrl);
              setPaymentLoading(false);
            }, 500); // 縮短延遲時間

            return;
          }

          // 如果不是測試模式，自動提交表單
          const form = tempDiv.querySelector("form");
          if (form) {
            form.submit();
          } else {
            setError("無法處理支付表單，請稍後再試。");
            setPaymentLoading(false);
          }
        } catch (error) {
          console.error("提交訂單支付失敗:", error);

          // 檢查是否為認證錯誤
          if (error.response && error.response.status === 401) {
            toast.showWarning("登入狀態失效", "您的登入已過期，將重新登入");
            setTimeout(() => {
              navigate("/auth/login", {
                state: {
                  from: location.pathname,
                  isCheckout: true,
                },
              });
            }, 500);
            return;
          }

          setError(error.message || "處理支付請求時發生錯誤");
          setPaymentLoading(false);
        }
      }
    } catch (error) {
      console.error("Error initiating payment:", error);

      // 統一的錯誤處理
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "支付處理失敗，請稍後再試";

      setError(errorMessage);
      setPaymentLoading(false);
    }
  }, [directCheckout, orderNumber, navigate, location, toast, order]);

  // 渲染結帳頁面
  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-indigo-600 mb-2">
            訂單確認與付款
          </h1>
          <div className="text-gray-600 text-sm">
            確認以下訂單資訊並進行付款
          </div>
        </div>

        {/* 購票流程步驟指引 */}
        <div className="mb-6">
          <StepProgress
            steps={[
              { label: "選擇票券" },
              { label: "確認訂單" },
              { label: "付款" },
              { label: "完成" },
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
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              發生錯誤
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/concerts")}
              className="flex items-center text-red-700 hover:text-red-900"
            >
              <ArrowLeft size={18} className="mr-1" />
              返回音樂會列表
            </button>
          </div>
        ) : (
          <>
            {/* 購票狀態提示 */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4 flex items-start">
              <Info size={16} className="text-indigo-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-indigo-700 mb-1">
                  購票流程提示
                </h3>
                <p className="text-sm text-indigo-600">
                  您正在進行票券購買，請確認以下訂單資訊，確認無誤後點擊「確認付款」按鈕進行支付。支付完成後，系統將自動發送電子票券到您的電子信箱。
                </p>
              </div>
            </div>
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
                        <h3 className="font-medium">
                          {directCheckout.concertTitle}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {directCheckout.ticketType}
                        </p>
                        {/* 添加時間和地點信息 */}
                        <p className="text-gray-600 text-sm flex items-center mt-1">
                          <Calendar size={14} className="mr-1" />
                          {directCheckout.performanceTime || "時間未指定"}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center mt-1">
                          <Calendar size={14} className="mr-1" />
                          {directCheckout.venue || "數位音樂廳"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {directCheckout.quantity} 張
                        </p>
                        <p className="text-gray-600 text-sm">
                          NT$ {directCheckout.ticketPrice} /張
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-medium">總計金額</span>
                      <span className="text-xl font-bold text-indigo-600">
                        NT$ {directCheckout.totalAmount}
                      </span>
                      {appliedDiscount && (
                        <DiscountBadge
                          code={appliedDiscount.code}
                          amount={appliedDiscount.amount}
                          percentage={appliedDiscount.percentage}
                          className="ml-2"
                        />
                      )}
                    </div>
                  </div>
                ) : order ? (
                  <div className="space-y-3">
                    {order.items &&
                      order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between pb-3 border-b border-gray-100"
                        >
                          <div>
                            <h3 className="font-medium">{item.concertTitle}</h3>
                            <p className="text-gray-600 text-sm">
                              {item.description || "標準票"}
                            </p>
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
                            <p className="text-gray-600 text-sm">
                              NT$ {item.unitPrice} /張
                            </p>
                          </div>
                        </div>
                      ))}
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-medium">總計金額</span>
                      <span className="text-xl font-bold text-indigo-600">
                        NT$ {order.calculatedTotal || order.totalAmount}
                      </span>
                      {appliedDiscount && (
                        <DiscountBadge
                          code={appliedDiscount.code}
                          amount={appliedDiscount.amount}
                          percentage={appliedDiscount.percentage}
                          className="ml-2"
                        />
                      )}
                    </div>
                    {order.calculatedTotal &&
                      order.calculatedTotal !== order.totalAmount && (
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

            {/* 卡片 - 訂單摘要 */}
            {orderSummary && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                <div className="bg-indigo-600 p-3 border-b">
                  <h2 className="text-md font-medium text-white flex items-center">
                    <Receipt size={18} className="mr-2" />
                    訂單摘要
                  </h2>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">票券數量</span>
                      <span>{orderSummary.totalItems} 張</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">小計</span>
                      <span>NT$ {orderSummary.subtotal}</span>
                    </div>
                    {orderSummary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>折扣</span>
                        <span>- NT$ {orderSummary.discount}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>總計金額</span>
                        <span>NT$ {orderSummary.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* 收據預覽切換 */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setShowReceiptPreview(!showReceiptPreview)}
                      className="text-indigo-600 text-sm flex items-center hover:text-indigo-800 transition-colors"
                    >
                      <Info size={16} className="mr-2" />
                      {showReceiptPreview ? "隱藏收據預覽" : "查看收據預覽"}
                    </button>

                    {showReceiptPreview && (
                      <div className="mt-3 border border-dashed border-gray-300 rounded p-3 bg-gray-50">
                        <h4 className="font-medium text-sm mb-2">
                          電子收據預覽
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>
                            購買者：
                            {localStorage.getItem("user")
                              ? JSON.parse(localStorage.getItem("user")).name
                              : "未登入用戶"}
                          </p>
                          <p>商品：數位音樂廳票券</p>
                          <p>訂單號：{orderNumber || "處理中"}</p>
                          <p>
                            開立日期：{new Date().toLocaleDateString("zh-TW")}
                          </p>
                          <p>付款完成後，正式電子收據將發送至您的電子信箱</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                  <label
                    htmlFor="credit-card"
                    className="flex items-center justify-between w-full"
                  >
                    <div>
                      <span className="font-medium">信用卡付款</span>
                      <p className="text-xs text-gray-500 mt-1">
                        安全、快速的付款方式
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
                  </label>
                </div>

                <div className="flex items-center border rounded p-3 mb-4 bg-gray-50 opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    id="atm-transfer"
                    name="payment-method"
                    className="mr-3 text-gray-400"
                    disabled
                  />
                  <label
                    htmlFor="atm-transfer"
                    className="flex items-center justify-between w-full"
                  >
                    <div>
                      <span className="font-medium text-gray-500">
                        ATM 轉帳付款
                      </span>
                      <p className="text-xs text-gray-500 mt-1">目前暫不支援</p>
                    </div>
                  </label>
                </div>

                <div className="bg-indigo-50 rounded p-3 border border-indigo-100 text-xs text-indigo-700">
                  <p className="mb-1">
                    點擊「確認付款」後，系統將導引您至綠界金流進行安全支付。所有支付信息均使用SSL加密傳輸。
                  </p>
                  <p>
                    完成付款後，您將立即收到電子票券與收據到您的電子信箱，也可以在「我的訂單」中查看。
                  </p>
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
                  paymentLoading || (!order && !directCheckout)
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {paymentLoading ? (
                  <span className="flex items-center">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    處理中...
                  </span>
                ) : (
                  "確認付款"
                )}
              </button>
            </div>

            {/* 安全提示 */}
            <div className="text-center text-xs text-gray-500">
              <p className="mb-1">本交易受數位音樂廳退款政策保障</p>
              <p>© 2025 Digital Concert Hall - 安全支付由 ECPay 綠界金流提供</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
