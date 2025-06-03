/**
 * 精簡版測試模式修復腳本
 * 只專注於必要功能，避免過度處理
 */
(function () {
  // 全局定義simulatePayment函數
  window.simulatePayment = function () {
    // 從URL中提取訂單號和金額參數
    var currentUrl = window.location.href;
    var orderNumberMatch = currentUrl.match(/orderNumber=([^&]*)/);
    var amountMatch = currentUrl.match(/amount=([^&]*)/);

    var orderNumber = orderNumberMatch ? orderNumberMatch[1] : "ORD_DEFAULT";
    var amount = amountMatch ? amountMatch[1] : "1000";

    // 跳轉到正確的付款步驟頁面
    var paymentUrl =
      "/payment/steps/order?orderNumber=" + orderNumber + "&amount=" + amount;
    console.log("FixTestUI simulatePayment: 跳轉到", paymentUrl);
    window.location.href = paymentUrl;
  };
})();
