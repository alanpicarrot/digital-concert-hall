# 數位音樂廳支付功能修復對話記錄

## 問題描述

用戶在嘗試完成支付流程時，系統無法正確處理支付通知和獲取訂單詳情，主要表現為以下錯誤：

```
嘗試獲取訂單詳情失敗 (第 3/3 次): AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
            
GET http://localhost:8081/api/orders/ORD1743584510186 500 (Internal Server Error)

API 錯誤: 500

Error fetching order ORD1743584510186: AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
```

## 問題分析

通過檢查代碼和錯誤日誌，我們發現主要問題在於訂單號格式不匹配：

1. **訂單號格式不匹配**：
   - 系統內部使用 `DCH-XXXXXXXX` 格式的訂單號
   - 綠界支付系統返回 `ORD1743583601160` 格式的訂單號
   - 系統在嘗試查找和更新這些訂單時無法找到匹配的記錄，導致出現 500 錯誤

2. **缺少錯誤驗證**：
   - PaymentController 中的測試支付通知端點沒有先檢查訂單是否存在
   - 當訂單號不匹配時直接嘗試更新不存在的訂單，引發內部錯誤

3. **前端處理問題**：
   - PaymentResultPage.jsx 中缺少足夠的錯誤處理和重試機制
   - 當 API 調用失敗時，沒有適當的後備顯示或用戶提示

## 修改內容

### 1. 後端修改 (PaymentController.java)

1. 改進了 `normalizeOrderNumber` 方法，提高其處理多種訂單號格式的能力：
   ```java
   private String normalizeOrderNumber(String orderNumber) {
       if (orderNumber == null) {
           return null;
       }
       
       logger.info("Normalizing order number: {}", orderNumber);
       
       // 嘗試直接使用此訂單號查詢，無論格式如何
       try {
           Order order = orderService.getOrderEntityByOrderNumber(orderNumber);
           logger.info("Order found directly with number: {}", orderNumber);
           return orderNumber;
       } catch (ResourceNotFoundException e) {
           // 如果直接查詢失敗，嘗試轉換格式
           
           // 如果是綠界返回的ORD前綴訂單號，嘗試轉換為DCH格式
           if (orderNumber.startsWith("ORD")) {
               String numericPart = orderNumber.substring(3);
               String dchOrderNumber = "DCH-" + numericPart.substring(0, Math.min(numericPart.length(), 8)).toUpperCase();
               
               // 嘗試使用DCH格式
               try {
                   orderService.getOrderEntityByOrderNumber(dchOrderNumber);
                   return dchOrderNumber;
               } catch (ResourceNotFoundException ex) {
                   logger.warn("Order not found with DCH format either");
               }
           }
           
           // 如果是DCH格式，嘗試ORD格式
           else if (orderNumber.startsWith("DCH-")) {
               // 轉換邏輯...
           }
           
           // 如果都找不到，返回原始訂單號
           return orderNumber;
       }
   }
   ```

2. 改進了測試支付通知端點，添加多種訂單號格式支持：
   ```java
   @PostMapping("/ecpay/test-notify")
   @Transactional
   public ResponseEntity<ApiResponse> testPaymentNotification(@RequestParam String orderNumber, @RequestParam boolean success) {
       // 定義切換訂單號的所有可能格式
       List<String> possibleOrderNumbers = new ArrayList<>();
       
       // 添加原始訂單號
       possibleOrderNumbers.add(orderNumber);
       
       // 如果是ORD前綴，嘗試為DCH格式
       if (orderNumber.startsWith("ORD")) {
           possibleOrderNumbers.add("DCH-" + numericPart.substring(0, Math.min(numericPart.length(), 8)).toUpperCase());
       } 
       // 如果是DCH格式，嘗試ORD格式
       else if (orderNumber.startsWith("DCH-")) {
           possibleOrderNumbers.add("ORD" + numericPart);
       }
       
       // 嘗試所有可能的訂單號格式
       // ...
       
       // 更新訂單狀態
       // ...
   }
   ```

3. 相同的改進也應用於 `handlePaymentNotification` 和 `handlePaymentReturn` 方法

4. 修改了 `mockPayment` 方法，添加相同的多格式訂單號支持

### 2. 前端修改 (PaymentResultPage.jsx)

1. 改進了 `fetchOrderDetails` 方法，添加多種訂單號格式支持：
   ```javascript
   const fetchOrderDetails = async () => {
       // ...
       
       const tryFetch = async () => {
           try {
               // 定義可能的訂單號格式
               let orderFormats = [merchantTradeNo];
               
               // 如果是ORD前綴，嘗試DCH格式
               if (merchantTradeNo && merchantTradeNo.startsWith("ORD")) {
                   orderFormats.push(`DCH-${numericPart.substring(0, Math.min(numericPart.length, 8)).toUpperCase()}`);
               } 
               // 如果是DCH格式，嘗試ORD格式
               else if (merchantTradeNo && merchantTradeNo.startsWith("DCH-")) {
                   orderFormats.push(`ORD${numericPart}`);
               }

               // 嘗試所有可能的訂單號格式
               let data = null;
               
               for (const orderFormat of orderFormats) {
                   try {
                       data = await orderService.getOrderByNumber(orderFormat);
                       if (data) break;
                   } catch (error) {
                       // 繼續嘗試下一個格式
                   }
               }
               
               if (data) {
                   setOrderDetails(data);
                   return true;
               } else {
                   throw new Error('所有格式的訂單號均無法獲取成功');
               }
           } catch (error) {
               // 錯誤處理和重試
           }
       };
       
       // ...
   };
   ```

2. 改進了 `notifyPaymentResult` 方法，添加類似的多格式支持
3. 增強了錯誤處理，即使無法獲取訂單詳情也能顯示基本的支付成功信息

### 3. 服務修改 (orderService.js)

改進了錯誤處理：
```javascript
const getOrderByNumber = async (orderNumber) => {
  try {
    const path = validateApiPath(`${API_BASE_PATH}/${orderNumber}`);
    const response = await axiosInstance.get(path);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    console.error(`Error fetching order ${orderNumber}: ${errorMessage}`, error);
    
    // 紀錄更詳細的錯誤信息
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
};
```

## 系統架構分析

在修復過程中，我們分析了系統的支付架構，發現系統已經實現了「Feature Flag + 模擬支付閘道」方案：

1. **Feature Flag 架構**：
   - 前端通過 `featureFlagService.js` 實現了特性標誌系統
   - 關鍵支付標誌：`USE_REAL_PAYMENT` 默認設置為 `false`
   - 支持本地覆蓋設置，便於開發測試

2. **雙重支付模式**：
   - **真實支付模式（綠界支付）**：由 `ECPayService` 實現
   - **模擬支付模式**：由 `PaymentController.mockPayment()` 實現
   - 通過 Feature Flag 控制使用哪種模式

3. **模擬支付流程**：
   ```javascript
   // 在 paymentService.js 中
   if (FeatureFlags.isEnabled('USE_REAL_PAYMENT')) {
     // 使用真實綠界支付
     const path = `${API_BASE_PATH}/ecpay/create?orderNumber=${orderNumber}`;
     const response = await axiosInstance.post(path);
     return response.data;
   } else {
     // 使用模擬支付
     const path = `${API_BASE_PATH}/mock-payment?orderNumber=${orderNumber}`;
     // ...
   }
   ```

4. **後端綠界支付控制**：
   - `ECPayService` 中的 `testMode` 參數控制是否使用綠界測試環境
   - 當 `testMode = true` 時，使用內部測試頁面而非實際呼叫綠界 API

## 結論與建議

1. **問題解決**：
   - 我們成功修復了訂單號格式不匹配問題
   - 系統現在能夠處理 DCH- 和 ORD 格式的訂單號，無論是在後端還是前端
   - 增強了錯誤處理和用戶體驗

2. **關於暫時關閉綠界支付**：
   - 系統已經具備完整的模擬支付功能
   - 可以通過保持前端 Feature Flag `USE_REAL_PAYMENT = false` 來使用模擬支付
   - 不需要修改代碼，只需通過配置控制

3. **未來建議**：
   - 繼續使用現有的 Feature Flag 架構控制支付模式
   - 在開發和測試環境使用模擬支付
   - 待綠界支付問題完全解決後，再通過 Feature Flag 啟用真實支付

通過這些修改，數位音樂廳的支付流程已經更加健壯，能夠處理各種訂單號格式和錯誤情況，並為用戶提供一致良好的體驗。