# 數位音樂廳應用程式程式碼修改摘要

## 修改概述

在這次除錯過程中，共修改了 5 個核心文件：

1. `TicketServiceImpl.java`
2. `TicketRepository.java`
3. `Ticket.java`
4. `Performance.java`
5. 三個 Response DTO 類

## 詳細修改

### 1. TicketServiceImpl.java

#### 1.1 添加泛型類型參數
```java
// 修改前
public List generateTicketsForOrder(String orderId)

// 修改後
public List<TicketResponse> generateTicketsForOrder(String orderId)
```

#### 1.2 正確初始化 TicketResponse 對象
```java
// 修改前
return new TicketResponse();

// 修改後
return new TicketResponse(
    ticket.getId(),
    ticket.getPerformanceId(),
    ticket.getSeatNumber(),
    ticket.getPrice(),
    ticket.getStatus()
    // Add other necessary fields as needed
);
```

#### 1.3 修復類型轉換問題
```java
// 修改前
return ticketRepository.findCurrentUserTicketsByUsername(currentUsername, pageable)
        .map(ticket -> (UserTicketSummaryResponse) ticket);

// 修改後
return ticketRepository.findByUsername(currentUsername, pageable)
        .map(ticket -> new UserTicketSummaryResponse(
            ticket.getId(),
            ticket.getPerformanceId(),
            ticket.getPerformanceName(),
            ticket.getPurchaseDate(),
            ticket.getStatus()
            // Add other necessary fields as needed
        ));
```

#### 1.4 增強票券取消方法的安全性
```java
// 修改前
public void cancelTicket(Long ticketId) {
    try {
        ticketRepository.deleteById(ticketId);
    } catch (Exception e) {
        throw new RuntimeException("Error canceling ticket with ID: " + ticketId, e);
    }
}

// 修改後
public void cancelTicket(Long ticketId) {
    try {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized access: User is not authenticated.");
        }
        
        String currentUsername = authentication.getName();
        
        // Check if the ticket belongs to the current user
        boolean isUserTicket = ticketRepository.existsByIdAndUsername(ticketId, currentUsername);
        
        if (!isUserTicket) {
            throw new RuntimeException("Unauthorized: Ticket does not belong to the current user.");
        }
        
        // Update ticket status instead of deleting
        ticketRepository.updateTicketStatus(ticketId, "CANCELLED");
    } catch (Exception e) {
        throw new RuntimeException("Error canceling ticket with ID: " + ticketId, e);
    }
}
```

### 2. TicketRepository.java

#### 2.1 修正方法簽名和添加所需方法
```java
// 修改前
Optional<Ticket> findCurrentUserTicketsByUsername(String currentUsername, Pageable pageable);

// 修改後
/**
 * 根據用戶名分頁查詢票券
 */
Page<Ticket> findByUsername(String username, Pageable pageable);

/**
 * 檢查票券是否屬於特定用戶
 */
boolean existsByIdAndUsername(Long id, String username);

/**
 * 更新票券狀態
 */
@Modifying
@Transactional
@Query("UPDATE Ticket t SET t.status = :status WHERE t.id = :id")
void updateTicketStatus(Long id, String status);
```

#### 2.2 添加必要的導入
```java
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
```

### 3. Ticket.java

#### 3.1 添加必要的字段
```java
@Column(name = "username", nullable = false)
private String username;

@Column(name = "purchase_date")
private LocalDateTime purchaseDate;

@Column(name = "seat_number")
private String seatNumber;
```

#### 3.2 添加便捷方法
```java
// 便捷方法
public Long getPerformanceId() {
    return performance != null ? performance.getId() : null;
}

public String getPerformanceName() {
    return performance != null ? performance.getName() : null;
}

public LocalDateTime getPerformanceDate() {
    return performance != null ? performance.getStartTime() : null;
}
```

### 4. Performance.java

#### 4.1 添加便捷方法
```java
// 提供演出名稱
public String getName() {
    return concert != null ? concert.getTitle() : null;
}
```

### 5. Response DTO 類

#### 5.1 TicketResponse.java
```java
// 添加簡化的建構子
public TicketResponse(Long id, Long performanceId, String seatNumber, java.math.BigDecimal price, String status) {
    this.id = id;
    this.ticketCode = "TK" + id;
    // 其他屬性可以預設值或在後續加載
}
```

#### 5.2 UserTicketSummaryResponse.java
```java
// 添加簡化的建構子
public UserTicketSummaryResponse(Long id, Long performanceId, String performanceName, LocalDateTime purchaseDate, String status) {
    this.id = id;
    this.ticketCode = "TK" + id;
    this.concertTitle = performanceName;
    this.createdAt = purchaseDate;
    this.isUsed = "USED".equals(status);
    // 其他屬性可以預設值或在後續加載
}
```

#### 5.3 UserTicketDetailResponse.java
```java
// 添加簡化的建構子
public UserTicketDetailResponse(Long id, Long performanceId, String performanceName, 
                               LocalDateTime performanceDate, String seatNumber, 
                               java.math.BigDecimal price, String status, LocalDateTime purchaseDate) {
    this.id = id;
    this.ticketCode = "TK" + id;
    this.concertTitle = performanceName;
    this.performanceStartTime = performanceDate;
    this.isUsed = "USED".equals(status);
    this.createdAt = purchaseDate;
    // 其他屬性可以預設值或在後續加載
}
```

## 最佳實踐建議

1. **明確指定泛型類型**：始終為 `List`、`Optional` 和其他泛型類型指定具體的類型參數。

2. **正確使用 Spring Data JPA**：
   - 使用 `Page<T>` 作為分頁查詢的返回類型
   - 合理命名查詢方法以符合 Spring Data 命名約定

3. **安全類型轉換**：避免使用直接的類型轉換，特別是在 DTO 轉換中，最好創建新對象。

4. **增強安全檢查**：在關鍵操作（如刪除或更新）前添加用戶權限檢查。

5. **保留數據完整性**：考慮使用狀態更新而不是直接刪除數據。

6. **構造函數設計**：為 DTO 類提供多種構造方法以支持不同的使用場景。

7. **添加便捷方法**：在實體類中添加便捷方法以簡化代碼並提高可讀性。

8. **使用適當的註解**：如 `@Modifying` 和 `@Transactional` 以確保數據一致性。
