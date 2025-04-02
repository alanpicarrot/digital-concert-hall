# 數位音樂廳票券購買流程問題修復記錄

## 問題概述

在數位音樂廳系統中，用戶在直接購買票券時遇到 HTTP 500 錯誤，錯誤訊息為 "Cannot parse null string"。後端無法處理前端發送的訂單請求，導致購票流程中斷。

## 錯誤診斷

通過檢查前端控制台日誌，我們發現：

```
[LOG] 創建直接購買訂單: {"items":[{"quantity":1}]}
[ERROR] API 錯誤: 500
[ERROR] 創建訂單時發生錯誤: {"message":"Request failed with status code 500",...}
[ERROR] 創建訂單失敗: {"status":500,"details":{"message":"Cannot parse null string"}}
```

訂單請求中，僅包含了數量 (quantity)，但缺少了關鍵的票券 ID。

## 根本原因

經過代碼審查，發現：

1. 在 `ConcertDetailPage.jsx` 中，當用戶點擊「立即購買」按鈕時，系統將票券信息存入 sessionStorage：

```javascript
const ticketInfo = {
  concertId: concert.id,
  concertTitle: concert.title,
  ticketType: selectedSeatingArea.name,
  ticketPrice: selectedSeatingArea.price,
  quantity: quantity,
  totalAmount: calculateTotal(),
  purchaseTime: new Date().toISOString()
};
```

這裡缺少了 `ticketId` 字段，導致後續步驟無法獲取票券 ID。

2. 在 `CheckoutPage.jsx` 中，創建訂單時嘗試使用 `directCheckout.ticketId`：

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

由於 `ticketId` 不存在，後端收到的請求中缺少必要的 ID 欄位，導致解析錯誤。

## 解決方案

針對這個問題，我們做了以下修改：

### 1. 修復 ConcertDetailPage.jsx

在票券信息中添加 `ticketId` 欄位：

```javascript
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

### 2. 增強 CheckoutPage.jsx 中的數據驗證

在發送請求前檢查 `ticketId` 是否存在：

```javascript
// 驗證必要的票券數據
if (!directCheckout.ticketId) {
  console.error('票券ID缺失，無法完成訂單', directCheckout);
  setError('票券數據不完整，請返回重新選擇門票');
  setPaymentLoading(false);
  return;
}
```

## 修復效果

在實施上述修改後，系統可以成功創建訂單並完成購票流程。用戶選擇票券並點擊「立即購買」後：

1. 完整的票券信息（包含 ticketId）被保存到 sessionStorage
2. 結帳頁面讀取票券信息並進行驗證
3. 前端發送包含完整信息的請求到後端
4. 後端成功創建訂單並返回訂單 ID
5. 用戶被導向到支付頁面

## 學習與改進建議

從這次問題修復中，我們學到了以下經驗：

1. **數據完整性檢查**：在關鍵流程中，應確保所有必要欄位都存在且有效
2. **錯誤處理增強**：前端應更好地驗證數據，提供明確的錯誤訊息
3. **日誌記錄完善**：增加關鍵操作的日誌記錄，方便問題診斷
4. **數據流追蹤**：完整記錄從用戶選擇到訂單創建的數據傳遞
5. **防禦性編程**：實施更多的防禦性檢查，避免依賴假設

## 後續建議

為了進一步提高系統的穩定性，建議：

1. 添加更詳細的日誌記錄
2. 增加更全面的前端數據驗證
3. 增強後端的錯誤處理與回饋
4. 實施單元測試覆蓋關鍵流程
5. 建立更全面的錯誤監控機制

## 對話紀錄摘要

**診斷階段：**
- 分析日誌和錯誤訊息，確認創建訂單時缺少票券 ID
- 追蹤前端代碼，發現 `ConcertDetailPage.jsx` 中保存的票券信息缺少 `ticketId`
- 確認 `CheckoutPage.jsx` 中嘗試使用不存在的 `ticketId` 欄位

**解決方案：**
- 修改 `ConcertDetailPage.jsx` 添加 `ticketId` 欄位
- 在 `CheckoutPage.jsx` 中添加數據驗證
- 創建詳細的錯誤分析文檔

**後續測試：**
- 確認系統現在可以成功購買票券
- 總結問題原因和解決方案
