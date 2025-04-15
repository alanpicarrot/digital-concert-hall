# 數位音樂廳應用程式除錯記錄

日期：2025年4月15日

## 初始問題

使用者請求檢查並除錯以下路徑的檔案：
`/Users/alanp/digital-concert-hall/backend/src/main/java/com/digitalconcerthall/service/ticket/TicketServiceImpl.java`

## 問題診斷

檢查了 `TicketServiceImpl.java` 後，發現以下問題：

1. **缺少類型參數**：在 `generateTicketsForOrder` 方法中，`List` 返回類型沒有指定包含什麼類型的對象。

2. **空的 TicketResponse 對象**：多個方法創建了空的 `TicketResponse` 對象，而沒有適當地設置數據。

3. **不安全的類型轉換**：在 `getCurrentUserTickets` 方法中，直接將票券對象轉換為 `UserTicketSummaryResponse` 可能導致 `ClassCastException`。

4. **存儲庫方法可能未實現**：`findCurrentUserTicketsByUsername` 方法可能不存在於存儲庫中。

5. **缺乏適當的異常處理**：代碼拋出帶有錯誤消息的通用 RuntimeException。

6. **未經驗證的票券刪除**：`cancelTicket` 方法直接刪除票券，而沒有檢查權限。

## 嘗試編譯後的錯誤

啟動應用程序後，發現以下錯誤：

```
Caused by: java.lang.IllegalStateException: Method has to have one of the following return types [interface org.springframework.data.domain.Window, interface org.springframework.data.domain.Page, interface org.springframework.data.domain.Slice, interface java.util.List]
```

問題源自 `TicketRepository` 中的 `findCurrentUserTicketsByUsername` 方法返回類型不正確。此方法使用了 `Pageable` 參數，但返回類型是 `Optional<Ticket>`，而不是 `Page<Ticket>`。

## 解決方案實施

### 1. 修復 `TicketServiceImpl.java`

- 修正了 `generateTicketsForOrder` 的返回類型為 `List<TicketResponse>`
- 更新了所有 Response 對象的初始化方式，使用完整的構造函數
- 改進了 `getCurrentUserTickets` 中的映射邏輯，創建新的 `UserTicketSummaryResponse` 對象
- 增強了 `cancelTicket` 方法的安全性檢查

### 2. 更新 `TicketRepository.java`

- 將 `findCurrentUserTicketsByUsername` 改名為 `findByUsername`，並修正返回類型為 `Page<Ticket>`
- 添加了 `existsByIdAndUsername` 方法，用於檢查票券是否屬於特定用戶
- 添加了 `updateTicketStatus` 方法，用於更新票券狀態而不是刪除
- 添加了必要的註解和導入

### 3. 擴展 `Ticket.java` 實體類

- 添加了 `username` 字段，用於跟踪票券所有者
- 添加了 `purchaseDate` 字段，用於跟踪購買時間
- 添加了 `seatNumber` 字段，用於座位信息
- 添加了便捷的 getter 方法

### 4. 更新 `Performance.java` 實體類

- 添加了 `getName` 方法，以便 `Ticket` 類可以獲取演出名稱

### 5. 更新 Response DTO 類

- 為所有 Response 類添加了新的構造函數，使其與 `TicketServiceImpl` 中的調用參數相匹配
- 初始化了基本字段，並留下注釋說明可以預設或後續加載其他屬性

## 最終結果

所有修改完成後，成功編譯了應用程序。主要修復了：

1. 返回類型不匹配問題（`Optional<Ticket>` vs `Page<Ticket>`）
2. 缺少必要的方法和屬性
3. DTO 構造方法參數不匹配

## 學到的經驗

1. 始終在使用泛型時指定類型參數
2. 注意 Spring Data JPA 中分頁方法的正確返回類型
3. 避免直接強制類型轉換，特別是在涉及 DTO 轉換時
4. 在代碼中引入安全檢查，特別是在刪除操作之前
5. 確保實體類和 DTO 之間有正確的映射
6. 為 DTO 類提供適當的構造函數，以便更容易進行實體到 DTO 的轉換
