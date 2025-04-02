# 數位音樂廳專案 - 付款狀態更新問題除錯記錄

## 問題描述

用戶在完成支付後，訂單狀態沒有正確更新為"已付款"，導致訂單在訂單列表的"已付款"選項卡下無法顯示。

## 問題排查過程

### 1. 系統了解與分析

首先通過查看專案結構，了解了數位音樂廳專案的架構：

- 專案分為三個獨立應用：
  - backend (後端 API 服務)
  - frontend-client (用戶前台)
  - frontend-admin (管理員後台)

通過查看截圖確認了問題現象：
1. 第一張圖顯示付款已成功完成，系統顯示「付款成功」消息
2. 第二張圖顯示在「已付款」標籤下顯示「沒有已付款的訂單」，與付款成功的狀態相矛盾

### 2. 程式碼審查

查看了以下關鍵文件：

#### 後端部分：

1. **PaymentController.java**

在支付成功時，PaymentController 會調用更新訂單狀態的方法：

```java
if ("1".equals(paymentStatus)) {
    // 更新訂單狀態為已支付
    orderService.updateOrderStatus(merchantTradeNo, "paid");
    
    // 產生票券
    ticketService.generateTicketsForOrder(merchantTradeNo);
}
```

2. **OrderServiceImpl.java**

發現問題所在：訂單狀態更新方法在處理"paid"時，將 paymentStatus 設置為"completed"：

```java
@Override
public OrderSummaryResponse updateOrderStatus(String orderNumber, String status) {
    logger.info("Updating order status: {} to {}", orderNumber, status);
    Order order = getOrderEntityByOrderNumber(orderNumber);
    order.setStatus(status);
    
    // 同時更新付款狀態
    if ("paid".equals(status)) {
        order.setPaymentStatus("completed");  // 這裡用了不一致的狀態值!
        logger.info("Also updating payment status to 'completed'");
    } else if ("pending".equals(status)) {
        order.setPaymentStatus("pending");
        logger.info("Also updating payment status to 'pending'");
    } else if ("failed".equals(status)) {
        order.setPaymentStatus("failed");
        logger.info("Also updating payment status to 'failed'");
    }
    
    Order updatedOrder = orderRepository.save(order);
    logger.info("Order updated successfully: {}", order.getOrderNumber());
    return convertToOrderSummary(updatedOrder);
}
```

3. **Order.java**

訂單模型中的狀態欄位定義：

```java
@Column(nullable = false, length = 20)
private String status; // pending, paid, cancelled

@Column(name = "payment_status", nullable = false, length = 20)
private String paymentStatus; // pending, completed, failed
```

#### 前端部分：

1. **UserOrdersPage.jsx**

前端過濾訂單的邏輯只檢查了 order.status，沒有檢查 order.paymentStatus：

```javascript
const filterOrders = (status) => {
  setActiveFilter(status);
  
  if (status === 'all') {
    setFilteredOrders(orders);
  } else {
    const filtered = orders.filter(order => order.status === status);
    setFilteredOrders(filtered);
  }
};
```

2. **PaymentResultPage.jsx**

支付結果頁面在成功後會調用測試通知 API，但缺少刷新機制：

```javascript
// 設置10秒後自動跳轉到我的訂單頁面
const timer = setTimeout(() => {
  navigate('/user/orders');
}, 10000);
```

## 解決方案

### 1. 後端修復

修改 OrderServiceImpl.java 中的 updateOrderStatus 方法，確保狀態一致性：

```java
@Override
public OrderSummaryResponse updateOrderStatus(String orderNumber, String status) {
    logger.info("Updating order status: {} to {}", orderNumber, status);
    Order order = getOrderEntityByOrderNumber(orderNumber);
    
    // 更新訂單狀態
    order.setStatus(status);
    
    // 同時更新付款狀態 - 保持一致性
    if ("paid".equals(status)) {
        order.setPaymentStatus("paid");  // 使用一致的狀態值
        logger.info("Also updating payment status to 'paid'");
    } else if ("pending".equals(status)) {
        order.setPaymentStatus("pending");
        logger.info("Also updating payment status to 'pending'");
    } else if ("failed".equals(status)) {
        order.setPaymentStatus("failed");
        logger.info("Also updating payment status to 'failed'");
    }
    
    // 確保數據被及時寫入數據庫 - 增加同步
    orderRepository.flush();
    
    Order updatedOrder = orderRepository.save(order);
    logger.info("Order updated successfully: {}", order.getOrderNumber());
    return convertToOrderSummary(updatedOrder);
}
```

### 2. 前端修復

1. **修改 UserOrdersPage.jsx 中的過濾邏輯**：

```javascript
// 過濾訂單 - 修改以同時檢查訂單狀態和付款狀態
const filterOrders = (status) => {
  setActiveFilter(status);
  
  if (status === 'all') {
    setFilteredOrders(orders);
  } else if (status === 'paid') {
    // 檢查 status === 'paid' 或 paymentStatus === 'paid'
    const filtered = orders.filter(order => 
      order.status === 'paid' || order.paymentStatus === 'paid'
    );
    setFilteredOrders(filtered);
  } else {
    // 對其他狀態同時檢查 status 和 paymentStatus
    const filtered = orders.filter(order => 
      order.status === status || order.paymentStatus === status
    );
    setFilteredOrders(filtered);
  }
  
  // 偵錯日誌
  console.log(`過濾訂單，狀態: ${status}，結果數量: ${filtered?.length || 0}`);
};
```

2. **修改訂單顯示條件**：

```javascript
{/* 訂單狀態標籤 - 修改以同時檢查訂單狀態和付款狀態 */}
<div className="ml-3">
  {order.status === 'paid' || order.paymentStatus === 'paid' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle size={12} className="mr-1" />
      已付款
    </span>
  ) : order.status === 'pending' || order.paymentStatus === 'pending' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <Clock size={12} className="mr-1" />
      待付款
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <AlertCircle size={12} className="mr-1" />
      已取消
    </span>
  )}
</div>
```

3. **修改付款按鈕顯示邏輯**：

```javascript
{/* 訂單操作 - 修改以同時檢查訂單狀態和付款狀態 */}
<div className="px-6 py-3 flex justify-end space-x-3">
  {(order.status === 'pending' || order.paymentStatus === 'pending') && 
   (order.status !== 'paid' && order.paymentStatus !== 'paid') && (
    <Link 
      to={`/checkout/${order.orderNumber}`}
      className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
    >
      <CreditCard size={16} className="mr-1.5" />
      前往付款
    </Link>
  )}
```

4. **改進 PaymentResultPage.jsx 中的刷新機制**：

```javascript
// 設置10秒後自動跳轉到我的訂單頁面 - 增加刷新參數確保從伺服器重新獲取數據
const timer = setTimeout(() => {
  // 增加時間戳作為查詢參數，確保不使用緩存
  navigate(`/user/orders?refresh=${Date.now()}`);
}, 10000);
```

5. **在 UserOrdersPage.jsx 中檢測 URL 參數**：

```javascript
useEffect(() => {
  // 檢測 URL 中是否有刷新參數，如果有，強制刷新
  const forceRefresh = new URLSearchParams(window.location.search).get('refresh');
  console.log("訂單頁面載入，是否強制刷新: ", !!forceRefresh);
  fetchOrders();
}, [navigate, window.location.search]);
```

## 結論

此問題的根本原因是前後端對於訂單狀態的處理不一致導致的：

1. 後端在付款成功時將 order.status 設為 "paid"，但將 order.paymentStatus 設為 "completed"
2. 前端在顯示和過濾時只檢查 order.status 值是否為 "paid"，忽略了 order.paymentStatus 值

修復方案集中在兩個方面：
1. 統一前後端對狀態的處理，確保用相同的值表示相同的狀態
2. 優化前端邏輯，同時檢查這兩個狀態欄位
3. 確保在付款後及時刷新訂單資料

通過以上修改，用戶在完成付款後，訂單將能夠正確顯示在"已付款"選項卡下，並且不會再顯示"付款"按鈕。