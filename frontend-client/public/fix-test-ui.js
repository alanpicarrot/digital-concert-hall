/**
 * 精簡版測試模式修復腳本
 * 只專注於必要功能，避免過度處理
 */
(function() {
  // 全局定義simulatePayment函數
  window.simulatePayment = function() {
    var orderNumber = window.location.pathname.split('/').pop();
    window.location.href = '/payment/ecpay?orderNumber=' + orderNumber + '&amount=1000';
  };
})();