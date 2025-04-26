import React, { useState, useEffect, useCallback } from "react";
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
          // 使用新的分步模式支付流程
          navigate(
            `/payment/steps/order?orderNumber=${orderNumber}&amount=${
              order?.totalAmount || directCheckout?.totalAmount || 1000
            }`
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
  }, [orderNumber, navigate, order, directCheckout]);

  // 添加額外的認證驗證邏輯和專用於結帳頁面的強化驗證
  useEffect(() => {
    // 在首次載入時進行認證狀態檢查和日誌記錄
    const verifyAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      // 僅在開發模式下記錄詳細狀態
      if (process.env.NODE_ENV === "development") {
        console.log("結帳頁面載入時詳細認證狀態:", {
          tokenExists: !!token,
          userExists: !!userStr,
          tokenLength: token?.length,
          locationState: JSON.stringify(location.state),
          locationPathname: location.pathname,
          fromDirect: location.state?.direct === true,
          authenticated: location.state?.authenticated === true,
        });
      }

      // 如果從路由狀態中檢測到authenticated=true且token存在，強制確認認證狀態
      if (location.state?.authenticated === true && token && userStr) {
        if (process.env.NODE_ENV === "development") {
          console.log("檢測到明確的認證狀態標記，跳過額外驗證");
        }
        return;
      }

      // 如果有token和用戶數據，強制重新寫入以確保數據一致性
      if (token && userStr) {
        try {
          // 嘗試從已經存在的資料中讀取，但不重新寫入，避免觸發其他元件的更新
          const userData = JSON.parse(userStr);
          if (process.env.NODE_ENV === "development") {
            console.log("用戶資料正常，無需重新寫入");
          }
        } catch (e) {
          console.error("解析用戶數據失敗:", e);
        }
      }
    };

    // 僅執行一次驗證
    verifyAuth();
  }, []); // 空依賴數組確保只在组件掛載時驗證一次

  // 確保獲取結帳數據並在卸載時清理全局函數
  useEffect(() => {
    // 為避免無窮迴圈，在組件初次載入或訂單號變更時才執行
    const hasDataLoaded = Boolean(order || directCheckout);
    const isFirstLoad = loading && !error && !hasDataLoaded;

    // 如果已經有數據且訂單號未變更，則跳過重複加載
    if (!isFirstLoad && !orderNumber) {
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
            toast.showSuccess(
              "訂單已就緒",
              `訂單 #${orderNumber} 已成功加載，請確認資訊後進行付款`
            );

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
              // 使用購物車服務中的相同計算方法重新計算總價
              const cartService = await import("../../services/cartService");
              const calculatedTotal = cartService.default.calculateTotal(
                orderData.items
              );

              // 比較計算出的總價與API回傳的總價
              if (Math.abs(calculatedTotal - orderData.totalAmount) > 1) {
                // 允許 1 元誤差
                if (process.env.NODE_ENV === "development") {
                  console.warn(
                    "訂單總價不一致，重新計算:",
                    calculatedTotal,
                    "但從API返回:",
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

              // 顯示購票資訊已就緒的通知
              toast.showInfo("準備完成", "購票資訊已就緒，請確認後進行付款");

              // 為直接購買建立訂單摘要
              const summary = {
                totalItems: checkoutInfo.quantity,
                subtotal: checkoutInfo.ticketPrice * checkoutInfo.quantity,
                discount: 0,
                totalAmount: checkoutInfo.totalAmount,
              };

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
              }

              setOrderSummary(summary);
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
  }, [orderNumber, toast]);

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
          const cartRequest = {
            items: [
              {
                id: directCheckout.ticketId,
                quantity: directCheckout.quantity,
                concertId: directCheckout.concertId, // 添加音樂會ID
                type: directCheckout.ticketType, // 添加票券類型
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
              navigate(
                `/payment/steps/order?orderNumber=${realOrderNumber}&amount=${createdOrder.totalAmount}`
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
          // 確保認證頭部設置正確
          authService.setupPreRequestAuth();

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
            // 在開發環境中直接跳轉到模擬綠界支付頁面，簡化整個流程
            if (process.env.NODE_ENV === "development") {
              console.log("開發環境中，直接跳轉到模擬綠界支付頁面");
            }

            // 短暫延遲以提供用戶視覺反饋
            setTimeout(() => {
              // 使用已經定義好的全局simulatePayment函數跳轉
              if (typeof window.simulatePayment === "function") {
                window.simulatePayment();
              } else {
                // 如果函數不存在，就直接跳轉到分步支付頁面
                navigate(
                  `/payment/steps/order?orderNumber=${orderNumber}&amount=${
                    order?.totalAmount || 1000
                  }`
                );
              }
              setPaymentLoading(false);
            }, 1000);

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
