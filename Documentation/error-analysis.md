# 數位音樂廳系統錯誤分析

## 發現的問題

根據提供的控制台日誌和截圖，目前系統在創建訂單時出現一個新的問題。

### 錯誤概述

當用戶嘗試通過直接購買流程創建訂單時，系統返回`500`錯誤，並顯示訊息：`Cannot parse null string`。

### 錯誤詳情

```
[LOG] 創建直接購買訂單: {"items":[{"quantity":1}]}
[LOG] 開始創建訂單...
[LOG] 請求攔截器 - 檢測令牌： 存在
[LOG] 已添加認證頭信息： Bearer eyJhbGciOi...
[LOG] 請求目標： /api/orders
[ERROR] API 錯誤: 500
[ERROR] 創建訂單時發生錯誤: {"message":"Request failed with status code 500",...}
[ERROR] 創建訂單失敗: {"status":500,"details":{"message":"Cannot parse null string"}}
```

### 截圖顯示

用戶界面顯示錯誤信息：
- **發生錯誤**
- **Cannot parse null string**

## 問題分析

1. **數據缺失問題**：購物車請求中可能缺少必要的ID數據。從日誌可以看到，請求中只有 `{"items":[{"quantity":1}]}`，缺少了商品的ID。

2. **空值解析問題**：後端在嘗試解析請求中的值時遇到了一個空（null）值，無法完成解析操作。

3. **參數不完整**：從完整的日誌來看，創建的訂單缺少了票券ID：
   ```json
   {"items":[{"quantity":1}]}
   ```
   正確的格式應該是：
   ```json
   {"items":[{"id":"TICKET_ID_HERE","quantity":1}]}
   ```

## 根本原因

在深入調查後，我們發現：

1. 在 `ConcertDetailPage.jsx` 中，當用戶點擊「立即購買」按鈕時，系統將票券信息存入 `sessionStorage`，但這個信息中缺少 `ticketId` 字段：

```javascript
// 將購票信息存入 sessionStorage，以便結帳頁面可以使用
const ticketInfo = {
  concertId: concert.id,
  concertTitle: concert.title,
  ticketType: selectedSeatingArea.name,
  ticketPrice: selectedSeatingArea.price,
  quantity: quantity,
  totalAmount: calculateTotal(),
  purchaseTime: new Date().toISOString() // 添加購買時間戳記錆跟蹤
};

// 缺少了 ticketId: selectedSeatingArea.id 這個關鍵欄位
```

2. 在 `CheckoutPage.jsx` 中，創建訂單時嘗試使用 `directCheckout.ticketId`，但該值不存在，導致向後端發送了不完整的請求：

```javascript
const cartRequest = {
  items: [
    {
      id: directCheckout.ticketId, // 這個值為 undefined
      quantity: directCheckout.quantity
    }
  ]
};
```

## 解決方案

### 1. 修復直接購買資料保存

修改 `ConcertDetailPage.jsx` 中的購票數據保存，確保存入 `ticketId` 欄位：

```javascript
// 將購票信息存入 sessionStorage，以便結帳頁面可以使用
const ticketInfo = {
  concertId: concert.id,
  concertTitle: concert.title,
  ticketId: selectedSeatingArea.id, // 添加票券ID
  ticketType: selectedSeatingArea.name,
  ticketPrice: selectedSeatingArea.price,
  quantity: quantity,
  totalAmount: calculateTotal(),
  purchaseTime: new Date().toISOString()
};
```

### 2. 增強前端驗證

在 `CheckoutPage.jsx` 中添加數據驗證，確保訂單創建前所有必要欄位都存在：

```javascript
// 在發送前驗證數據
if (!directCheckout.ticketId) {
  console.error('票券ID缺失，無法完成訂單');
  setError('票券數據不完整，請返回重新選擇門票');
  setPaymentLoading(false);
  return;
}
```

### 3. 改進後端錯誤處理

建議後端 `OrderServiceImpl.java` 中提供更詳細的錯誤信息：

```java
// 例如，在檢查票券時
if (cartItem.getId() == null) {
  throw new IllegalArgumentException("訂單項目缺少票券ID");
}
```

## 實施步驟

1. 修改 `ConcertDetailPage.jsx` 添加 `ticketId` 欄位
2. 在 `CheckoutPage.jsx` 中添加數據驗證
3. 改進後端錯誤處理提供更明確的錯誤信息
4. 添加更詳細的日誌記錄來追蹤訂單創建流程
5. 測試修改後的購票流程，確保訂單可以正確創建

## 後續改進建議

1. 添加全局錯誤處理機制，提供更友好的用戶錯誤提示
2. 完善前端數據驗證流程，避免向後端發送不完整的請求
3. 實施更完整的數據流日誌記錄，方便未來問題診斷
4. 考慮添加單元測試覆蓋訂單創建流程，確保數據完整性
