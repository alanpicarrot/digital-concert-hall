# 數位音樂廳專案 - 訂單創建除錯會話紀錄

## 背景
本次會話專注於解決數位音樂廳專案中訂單創建功能的技術障礙。主要目標是追蹤和解決從前端到後端訂單創建過程中遇到的各種技術問題。

## 問題追蹤時間線

### 初始問題：API 路徑錯誤
- **症狀**：前端嘗試訪問 `/api/orders` 時出現 "No static resource" 錯誤
- **根本原因**：`OrderController` 的路徑映射不正確
- **解決方案**：修改 `OrderController` 的 `@RequestMapping` 為 `/api/orders`

### 第二階段：型別轉換錯誤
- **症狀**：`BigDecimal` 方法調用錯誤
- **根本原因**：價格轉換和方法調用不正確
- **解決方案**：使用 `BigDecimal.valueOf()` 方法，優化型別轉換邏輯

### 第三階段：認證主體問題
- **症狀**："Invalid authentication principal" 錯誤
- **根本原因**：用戶認證和主體檢索邏輯存在缺陷
- **解決方案**：增強 `getCurrentUser()` 方法，添加詳細日誌和更嚴格的檢查

## 關鍵代碼修改

### OrderController
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderSummaryResponse> createOrder(
            @RequestBody CartRequest cartRequest) {
        OrderSummaryResponse order = orderService.createOrder(cartRequest);
        return ResponseEntity.ok(order);
    }
}
```

### OrderServiceImpl (部分)
```java
@Transactional
public OrderSummaryResponse createOrder(CartRequest cartRequest) {
    User currentUser = getCurrentUser();
    Order order = new Order();
    
    String orderNumber = generateOrderNumber();
    order.setOrderNumber(orderNumber);
    order.setUser(currentUser);
    
    // 使用 BigDecimal 進行精確的金額計算
    BigDecimal totalAmount = BigDecimal.ZERO;
    List<OrderItem> orderItems = new ArrayList<>();

    for (CartItemRequest cartItem : cartRequest.getItems()) {
        Ticket ticket = ticketRepository.findById(Long.parseLong(cartItem.getId()))
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        OrderItem orderItem = new OrderItem();
        BigDecimal unitPrice = ticket.getTicketType().getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        
        orderItem.setTicket(ticket);
        orderItem.setUnitPrice(unitPrice);
        orderItem.setSubtotal(subtotal);

        orderItems.add(orderItem);
        totalAmount = totalAmount.add(subtotal);
    }

    order.setOrderItems(orderItems);
    order.setTotalAmount(totalAmount);

    return convertToOrderSummary(orderRepository.save(order));
}
```

## 技術發現

1. Spring Security 認證流程需要嚴格檢查
2. BigDecimal 用於金融計算，需要精確處理
3. 錯誤處理和日誌記錄對於調試至關重要

## 建議的最佳實踐

1. 使用詳細的日誌記錄
2. 實現嚴格的型別轉換
3. 增強異常處理邏輯
4. 定期審查安全配置

## 後續跟進

- 檢查前端 JWT 令牌傳遞機制
- 審查 WebSecurityConfig 配置
- 監控系統日誌以捕捉潛在問題

## 結論

通過系統的除錯方法，我們成功解決了訂單創建過程中的多個技術障礙，提高了系統的健壯性和可靠性。
