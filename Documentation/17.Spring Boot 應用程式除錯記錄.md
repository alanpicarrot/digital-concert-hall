# Spring Boot 應用程式除錯記錄

## 問題描述

我們遇到了以下 Spring Boot 應用程式啟動失敗的錯誤：

```
***************************
APPLICATION FAILED TO START
***************************

Description:

The bean 'userTicketRepository', defined in com.digitalconcerthall.repository.ticket.UserTicketRepository defined in @EnableJpaRepositories declared on JpaRepositoriesRegistrar.EnableJpaRepositoriesConfiguration, could not be registered. A bean with that name has already been defined in com.digitalconcerthall.repository.UserTicketRepository defined in @EnableJpaRepositories declared on JpaRepositoriesRegistrar.EnableJpaRepositoriesConfiguration and overriding is disabled.

Action:

Consider renaming one of the beans or enabling overriding by setting spring.main.allow-bean-definition-overriding=true
```

## 錯誤分析

經過檢查，發現了兩個相同名稱的 Repository 介面：
- `com.digitalconcerthall.repository.UserTicketRepository`
- `com.digitalconcerthall.repository.ticket.UserTicketRepository`

兩者都被標記為 `@Repository`，Spring 嘗試將它們註冊為相同名稱的 Bean，導致衝突。

## 修復步驟

### 1. 合併兩個 Repository 介面

將 `repository.ticket.UserTicketRepository` 中的方法合併到 `repository.UserTicketRepository` 中：

```java
// 原有方法
Page<UserTicket> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

// 新增的方法
Page<UserTicket> findByUser(User user, Pageable pageable);
Optional<UserTicket> findByTicketCode(String ticketCode);
Optional<UserTicket> findByIdAndUser(Long id, User user);
```

### 2. 更新引用

修改 `TicketServiceImpl.java` 中的引用：

```java
@Autowired
private com.digitalconcerthall.repository.UserTicketRepository userTicketRepository;
```

修改 `DebugController.java` 中的 import 語句：

```java
import com.digitalconcerthall.repository.UserTicketRepository;
```

### 3. 移除重複的 Repository 文件

備份並刪除 `com.digitalconcerthall.repository.ticket.UserTicketRepository.java`。

### 4. 修復其他問題

在 `TicketServiceImpl` 中修正了數據映射問題：

a. 在 `generateTicketsForOrder` 方法中：
   - 補全了 `id` 字段的設置
   - 修正了對象關係鏈的引用
   - 修正了 DTO 字段名稱與模型屬性的對應關係

```java
TicketResponse response = new TicketResponse();
response.setId(userTicket.getId());
response.setTicketCode(userTicket.getTicketCode());
response.setConcertTitle(item.getTicket().getPerformance().getConcert().getTitle());
response.setPerformanceVenue(item.getTicket().getPerformance().getVenue());
response.setPerformanceStartTime(item.getTicket().getPerformance().getStartTime());
response.setPerformanceEndTime(item.getTicket().getPerformance().getEndTime());
response.setTicketTypeName(item.getTicket().getTicketType().getName());
response.setUsed(userTicket.getIsUsed());
response.setCreatedAt(userTicket.getCreatedAt());
```

b. 在 `getCurrentUserTickets` 方法中：
   - 修正了對象關係鏈的引用
   - 添加了對應 `UserTicketSummaryResponse` 的完整字段映射

```java
UserTicketSummaryResponse response = new UserTicketSummaryResponse();
response.setId(ticket.getId());
response.setTicketCode(ticket.getTicketCode());
response.setConcertTitle(orderItem.getTicket().getPerformance().getConcert().getTitle());
response.setPerformanceVenue(orderItem.getTicket().getPerformance().getVenue());
response.setPerformanceStartTime(orderItem.getTicket().getPerformance().getStartTime());
response.setPerformanceEndTime(orderItem.getTicket().getPerformance().getEndTime());
response.setTicketTypeName(orderItem.getTicket().getTicketType().getName());
response.setIsUsed(ticket.getIsUsed());
response.setOrderNumber(orderItem.getOrder().getOrderNumber());
response.setCreatedAt(ticket.getCreatedAt());
```

## 結論

通過合併兩個 Repository 並更新所有引用，解決了 Bean 註冊衝突問題。同時，也修正了 DTO 映射中的錯誤引用，確保數據能夠正確地從模型映射到 DTO 對象。這些修改使應用程序能夠順利啟動並正確運行。

這種合併方法比設置 `spring.main.allow-bean-definition-overriding=true` 更加清晰和維護性更好，因為它避免了潛在的混淆和重複代碼。