package com.digitalconcerthall.service.payment;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.apache.commons.codec.digest.DigestUtils;

@Service
public class ECPayService {

    @Value("${ecpay.merchant.id:2000132}")
    private String merchantId;

    @Value("${ecpay.hash.key:5294y06JbISpM5x9}")
    private String hashKey;

    @Value("${ecpay.hash.iv:v77hoKGq4kWxNNIS}")
    private String hashIv;

    @Value("${ecpay.payment.gateway.url:https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5}")
    private String paymentGatewayUrl;
    
    @Value("${ecpay.test.mode:true}")
    private Boolean testMode;

    @Value("${app.frontend.return.url:http://localhost:3000/payment/result}")
    private String frontendReturnUrl;

    @Value("${app.backend.notify.url:http://localhost:8080/api/payment/ecpay/notify}")
    private String backendNotifyUrl;

    /**
     * 創建支付表單
     */
    public String createPaymentForm(String orderId, int totalAmount, String itemName) {
        // 測試模式下，跳過真實綠界支付
        if (testMode) {
            return createTestModeForm(orderId, totalAmount, itemName);
        }
        // 生成交易時間
        String merchantTradeDate = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date());
        
        // 組裝支付參數
        Map<String, String> params = new HashMap<>();
        params.put("MerchantID", merchantId);
        params.put("MerchantTradeNo", orderId); // 使用訂單ID作為交易編號
        params.put("MerchantTradeDate", merchantTradeDate);
        params.put("PaymentType", "aio");
        params.put("TotalAmount", String.valueOf(totalAmount));
        params.put("TradeDesc", "數位音樂廳票券購買");
        params.put("ItemName", itemName);
        params.put("ReturnURL", backendNotifyUrl); // 後端接收交易結果的URL
        params.put("OrderResultURL", frontendReturnUrl); // 前端導向的URL
        params.put("ChoosePayment", "Credit"); // 使用信用卡支付
        params.put("EncryptType", "1"); // 使用SHA256加密

        // 計算檢查碼
        String checkMacValue = generateCheckMacValue(params);
        params.put("CheckMacValue", checkMacValue);

        // 生成自動提交的HTML表單
        StringBuilder autoSubmitForm = new StringBuilder();
        autoSubmitForm.append("<!DOCTYPE html>");
        autoSubmitForm.append("<html>");
        autoSubmitForm.append("<head>");
        autoSubmitForm.append("<meta charset=\"utf-8\">");
        autoSubmitForm.append("<title>處理中 - 數位音樂廳</title>");
        autoSubmitForm.append("</head>");
        autoSubmitForm.append("<body>");
        autoSubmitForm.append("<form id='ecpay-form' method='post' action='").append(paymentGatewayUrl).append("'>");
        
        for (Map.Entry<String, String> entry : params.entrySet()) {
            autoSubmitForm.append("<input type='hidden' name='").append(entry.getKey()).append("' value='").append(entry.getValue()).append("'>");
        }
        
        autoSubmitForm.append("</form>");
        autoSubmitForm.append("<div style='text-align:center; margin-top: 50px;'>");
        autoSubmitForm.append("<h2>正在將您導向到綠界支付頁面...</h2>");
        autoSubmitForm.append("<p>如果頁面沒有自動跳轉，請點擊下方按鈕</p>");
        autoSubmitForm.append("<button onclick=\"document.getElementById('ecpay-form').submit()\" style='padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;'>前往支付</button>");
        autoSubmitForm.append("</div>");
        autoSubmitForm.append("<script>document.getElementById('ecpay-form').submit();</script>");
        autoSubmitForm.append("</body>");
        autoSubmitForm.append("</html>");
        
        return autoSubmitForm.toString();
    }
    
    /**
     * 創建測試模式下的支付表單（開發環境使用）
     */
    public String createTestModeForm(String orderId, int totalAmount, String itemName) {
        StringBuilder testForm = new StringBuilder();
        testForm.append("<!DOCTYPE html>");
        testForm.append("<html>");
        testForm.append("<head>");
        testForm.append("<meta charset=\"utf-8\">");
        testForm.append("<title>測試模式 - 綠界支付</title>");
        testForm.append("<style>");
        testForm.append("body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; display: flex; justify-content: center; align-items: center; height: 100vh; }");
        testForm.append(".container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; width: 100%; }");
        testForm.append("h2 { color: #4f46e5; margin-top: 0; }");
        testForm.append(".info { margin: 20px 0; }");
        testForm.append(".price { font-size: 24px; font-weight: bold; color: #4f46e5; }");
        testForm.append(".item { margin-bottom: 10px; color: #666; }");
        testForm.append(".buttons { display: flex; justify-content: space-between; margin-top: 30px; }");
        testForm.append(".btn { padding: 10px 20px; border-radius: 5px; cursor: pointer; border: none; font-size: 16px; font-weight: bold; }");
        testForm.append(".btn-success { background-color: #4f46e5; color: white; }");
        testForm.append(".btn-cancel { background-color: #e5e7eb; color: #111827; }");
        testForm.append("</style>");
        testForm.append("</head>");
        testForm.append("<body>");
        testForm.append("<div class=\"container\">");
        testForm.append("<h2>測試模式 - 綠界支付</h2>");
        testForm.append("<p>這是一個模擬的綠界支付頁面，僅用於開發測試。</p>");
        testForm.append("<div class=\"info\">");
        testForm.append("<div class=\"item\">訂單編號: " + orderId + "</div>");
        testForm.append("<div class=\"item\">商品名稱: " + itemName + "</div>");
        testForm.append("<div class=\"price\">應付金額: NT$ " + totalAmount + "</div>");
        testForm.append("</div>");
        testForm.append("<div class=\"buttons\">");
        
        // 取消按鈕 - 跳轉到付款失敗結果頁
        testForm.append("<button class=\"btn btn-cancel\" onclick=\"window.location.href='" + 
                       frontendReturnUrl + "?MerchantTradeNo=" + orderId + "&RtnCode=0&RtnMsg=付款取消'\">");
        testForm.append("取消支付");
        testForm.append("</button>");
        
        // 確認付款按鈕 - 呼叫notify API並跳轉到成功頁
        testForm.append("<button class=\"btn btn-success\" onclick=\"simulatePayment()\">");
        testForm.append("確認付款");
        testForm.append("</button>");
        testForm.append("</div>");
        
        // 添加JavaScript以模擬支付過程
        testForm.append("<script>");
        testForm.append("function simulatePayment() {");
        testForm.append("  // 避免重複點擊");
        testForm.append("  document.querySelectorAll('.btn').forEach(btn => { btn.disabled = true; });");
        testForm.append("  document.querySelector('.btn-success').innerHTML = '處理中...';");
        
        // 呼叫後端通知API
        testForm.append("  fetch('" + backendNotifyUrl + "?RtnCode=1&MerchantTradeNo=" + orderId + "', {");
        testForm.append("    method: 'POST',");
        testForm.append("    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },");
        testForm.append("  })");
        
        // 延遲一下再跳轉，讓使用者感覺到在處理
        testForm.append("  setTimeout(() => {");
        testForm.append("    window.location.href = '" + frontendReturnUrl + "?MerchantTradeNo=" + orderId + "&RtnCode=1&RtnMsg=交易成功';");
        testForm.append("  }, 1500);");
        testForm.append("}");
        testForm.append("</script>");
        
        testForm.append("</div>");
        testForm.append("</body>");
        testForm.append("</html>");
        
        return testForm.toString();
    }

    /**
     * 生成檢查碼 (依照綠界的規則)
     */
    private String generateCheckMacValue(Map<String, String> params) {
        // 依字母順序排序參數
        String paramString = params.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(e -> e.getKey() + "=" + e.getValue())
            .collect(Collectors.joining("&"));
            
        // 在前後加上 HashKey 和 HashIV
        String checkValue = "HashKey=" + hashKey + "&" + paramString + "&HashIV=" + hashIv;
        
        // 進行 URL Encoding
        String urlEncodedValue;
        try {
            urlEncodedValue = URLEncoder.encode(checkValue, "UTF-8").toLowerCase();
            
            // 替換特殊字符，符合綠界規範
            urlEncodedValue = urlEncodedValue.replace("%2d", "-")
                .replace("%5f", "_")
                .replace("%2e", ".")
                .replace("%21", "!")
                .replace("%2a", "*")
                .replace("%28", "(")
                .replace("%29", ")");
                
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("URL encoding failed", e);
        }
        
        // 使用 SHA256 加密並轉為大寫
        return DigestUtils.sha256Hex(urlEncodedValue).toUpperCase();
    }

    /**
     * 驗證從綠界返回的通知
     */
    public boolean verifyPaymentNotification(Map<String, String> notifyParams) {
        // 獲取綠界傳來的檢查碼
        String checkMacValue = notifyParams.get("CheckMacValue");
        
        // 移除檢查碼後再計算
        Map<String, String> paramsForCheck = new HashMap<>(notifyParams);
        paramsForCheck.remove("CheckMacValue");
        
        // 計算檢查碼
        String calculatedCheckMacValue = generateCheckMacValue(paramsForCheck);
        
        // 比對檢查碼是否一致
        return checkMacValue.equals(calculatedCheckMacValue);
    }
}
