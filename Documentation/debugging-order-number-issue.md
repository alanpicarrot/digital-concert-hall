# 訂單號問題與重構文檔

## 原始問題描述

瀏覽器上出現下列錯誤訊息：
```
orderService.js:61 Error response status: 500
orderService.js:62 Error response data: { "message": "Order not found with number: DCH-17435871" }
PaymentResultPage.jsx:89 嘗試獲取訂單詳情失敗 (第 2/3 次):
1. *AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}*
contentInt.js:1 GET http://localhost:8081/api/orders/ORD1743587133188 500 (Internal Server Error)
authService.js:74 API 錯誤: 500
orderService.js:57 Error fetching order ORD1743587133188: Order not found with number: ORD1743587133188
1. *AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}*
orderService.js:61 Error response status: 500
orderService.js:62 Error response data: { "message": "Order not found with number: ORD1743587133188" }
contentInt.js:1 GET http://localhost:8081/api/orders/DCH-17435871 500 (Internal Server Error)
authService.js:74 API 錯誤: 500
orderService.js:57 Error fetching order DCH-17435871: Order not found with number: DCH-17435871
1. *AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}*
```

## 問題分析

根據錯誤訊息分析，主要問題為：

1. 訂單號格式不一致：系統同時使用兩種不同格式的訂單號
   - DCH-17435871（由 OrderServiceImpl.java 中生成）
   - ORD1743587133188（由 Order.java 的 onCreate() 方法生成）

2. 前端在訪問訂單時嘗試兩種格式但都失敗：
   - 查詢 ORD1743587133188 返回 500 錯誤
   - 查詢 DCH-17435871 也返回 500 錯誤 

3. 後端錯誤處理問題：
   - 當訂單不存在時，返回 500 內部伺服器錯誤，而不是更適合的 404 錯誤
   - 缺少針對特定錯誤類型的處理

4. 前端錯誤處理邏輯不夠健壯：
   - 訂單號格式轉換邏輯不精確
   - 無法區分"訂單不存在"與其他類型的服務器錯誤

## 解決方案：統一使用 ORD 格式

### 1. 後端更改

#### OrderServiceImpl.java 修改
- 統一使用 ORD 格式生成訂單號:
```java
private String generateOrderNumber() {
    // 生成一個訂單編號，格式：年月日+6位隨機數字
    LocalDateTime now = LocalDateTime.now();
    String dateStr = now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
    String randomNumber = String.format("%06d", (int) (Math.random() * 1000000));
    return "ORD" + dateStr + randomNumber;
    // 不再使用 DCH- 格式
    // return "DCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
}
```

- 改進訂單查詢邏輯，提供更好的向後兼容性:
```java
@Override
public Order getOrderEntityByOrderNumber(String orderNumber) {
    logger.debug("Finding order with number: {}", orderNumber);
    
    // 主要查找 ORD 格式
    if (orderNumber.startsWith("ORD")) {
        return orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> {
                logger.warn("Order not found with ORD number: {}", orderNumber);
                return new ResourceNotFoundException("Order not found with number: " + orderNumber);
            });
    }
    // 向後兼容 - 上面找不到且是 DCH 格式，嘗試轉換為 ORD 格式
    else if (orderNumber.startsWith("DCH-")) {
        // 首先嘗試直接掛 DCH 格式查找（歸頻案例）
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isPresent()) {
            return orderOpt.get();
        }
        
        // 如果找不到，創建可能的 ORD 格式
        String dchPart = orderNumber.substring(4);
        if (dchPart.length() == 8) { // DCH-格式通常是8位字母數字組合
            // 嘗試不同的日期組合，從今天開始往回看 30 天
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
            
            for (int i = 0; i < 30; i++) {
                LocalDateTime date = now.minusDays(i);
                String dateStr = date.format(formatter);
                String possibleOrderNumber = "ORD" + dateStr + dchPart; 
                
                logger.debug("Trying possible ORD format: {}", possibleOrderNumber);
                Optional<Order> possibleOrder = orderRepository.findByOrderNumber(possibleOrderNumber);
                if (possibleOrder.isPresent()) {
                    logger.info("Found matching ORD number for DCH-{}: {}", dchPart, possibleOrderNumber);
                    return possibleOrder.get();
                }
            }
        }
        
        logger.warn("Order not found with DCH number: {} and no matching ORD number found", orderNumber);
        throw new ResourceNotFoundException("Order not found with number: " + orderNumber +
                                         " (Tip: We now use ORD format for order numbers)");
    }
    // 不知道格式，直接查找
    else {
        logger.warn("Unknown order number format: {}", orderNumber);
        return orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber + 
                                                     " (Tip: Order numbers should start with 'ORD')"));
    }
}
```

#### Order.java 修改
- 移除重複的訂單號生成邏輯:
```java
@PrePersist
protected void onCreate() {
    if (orderDate == null) {
        orderDate = LocalDateTime.now();
    }
    // 不再在這裡生成訂單編號
    // orderNumber 由 OrderServiceImpl 的 generateOrderNumber() 方法給出
}
```

#### GlobalExceptionHandler.java 修改
- 添加 ResourceNotFoundException 的專門處理，返回 404 而非 500:
```java
@ExceptionHandler(ResourceNotFoundException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
public ResponseEntity<MessageResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
    System.out.println("Resource not found exception: " + ex.getMessage());
    return new ResponseEntity<>(new MessageResponse(ex.getMessage()), HttpStatus.NOT_FOUND);
}
```

### 2. 前端更改

#### orderService.js 修改
- 改進錯誤處理:
```javascript
catch (error) {
  const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
  console.error(`Error fetching order ${orderNumber}: ${errorMessage}`, error);
  
  // 紀錄更詳細的错誤信息
  if (error.response) {
    console.error('Error response status:', error.response.status);
    console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
  }
  
  // 如果是 404 或 500 錯誤且錯誤信息中包含 'Order not found'，則創建一個帶有該信息的自定義錯誤
  if (error.response && 
      (error.response.status === 404 || error.response.status === 500) && 
      error.response.data?.message?.includes('Order not found')) {
    const customError = new Error('Order not found');
    customError.isOrderNotFound = true;
    throw customError;
  }
  
  throw error;
}
```

#### PaymentResultPage.jsx 修改
- 訂單號查詢邏輯優先使用 ORD 格式:
```javascript
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
```

- 提供視覺提示，告知用戶舊格式訂單:
```jsx
<div className="flex justify-between mb-2 pb-2 border-b border-gray-100">
  <span className="text-gray-500">訂單編號</span>
  <span className="font-medium">
    {orderDetails.orderNumber}
    {orderDetails.orderNumber && orderDetails.orderNumber.startsWith("DCH-") && (
      <span className="ml-2 text-xs text-amber-600">(舊格式，系統已升級為 ORD 格式)</span>
    )}
  </span>
</div>
```

## 應用程式購買流程總結

這個數位音樂廳應用程式的標準購買流程如下：

### 1. 瀏覽與選擇票券
- 用戶瀏覽數位音樂廳的演出資訊
- 選擇想要觀看的音樂會/演出
- 選擇票券類型及數量加入購物車

### 2. 購物車管理
- 用戶可以檢視購物車中的票券
- 可以調整票券數量或移除不需要的票券
- 確認購物車內容後進入結帳流程

### 3. 結帳流程
- 系統檢查用戶是否已登入
  - 未登入用戶將導向登入頁面
- 系統創建訂單（使用 `orderService.createOrder`）
  - 生成訂單號（現在統一使用 ORD 格式）
  - 計算訂單總金額
  - 初始狀態設為 "pending"（待處理）

### 4. 付款處理
- 用戶被導向至付款頁面
- 選擇付款方式（系統支援「線上付款」）
- 處理付款資訊（可能整合綠界支付系統）
- 系統確認付款後會：
  - 更新訂單狀態為 "paid"（已付款）
  - 更新付款狀態為 "paid"（已付款）
  - 減少相應票券的庫存數量

### 5. 付款結果頁面
- 用戶被導向至 `PaymentResultPage.jsx` 顯示付款結果
- 系統嘗試獲取訂單詳情（使用 `orderService.getOrderByNumber`）
- 顯示訂單資訊，包括：
  - 訂單編號
  - 訂單狀態
  - 總金額
  - 購買的票券資訊

### 6. 訂單確認
- 系統可能會發送訂單確認郵件給用戶
- 用戶可在「我的訂單」頁面查看所有訂單

### 7. 訂單後續處理
- 用戶可能會收到票券或觀看演出的相關資訊
- 系統會根據訂單狀態提供相應的服務（如提供觀看連結）

## 改進的優點

1. **與綠界支付系統兼容**：ORD 格式（年月日+數字）更適合作為商家訂單號與綠界支付進行整合

2. **統一了訂單號生成邏輯**：避免了多處生成訂單號可能導致的不一致問題

3. **平滑過渡**：保留了對舊 DCH 格式訂單的支持，避免了現有訂單無法訪問的問題

4. **明確的用戶提示**：讓用戶知道系統已經升級到 ORD 格式

5. **錯誤處理優化**：更精確地區分"訂單不存在"與其他錯誤類型

隨著系統向綠界支付系統整合，這個購買流程將更加完善和自動化，為用戶提供更順暢的購票體驗。
