# 數位音樂廳系統日誌系統使用指南

## 概述

本文件提供數位音樂廳系統日誌系統的使用指南。該日誌系統設計用於增強應用程序的可觀察性，幫助開發人員和運維人員更有效地監控系統狀態、診斷問題和分析性能。

## 日誌系統主要功能

1. **結構化HTTP請求/響應日誌**
   - 完整記錄請求和響應內容
   - 自動美化JSON格式
   - 為每個請求分配唯一ID便於跟踪

2. **方法執行跟踪**
   - 記錄方法調用的參數和返回值
   - 測量方法執行時間
   - 自動識別和標記慢方法

3. **自動化測試日誌**
   - 記錄測試步驟和斷言結果
   - 生成結構化測試報告
   - 追踪測試失敗的根本原因

4. **分類日誌存儲**
   - 按類型分離日誌文件
   - 自動滾動策略防止日誌文件過大
   - 錯誤日誌聚合方便問題診斷

## 開發人員指南

### 在代碼中使用日誌系統

#### 1. 記錄方法執行時間

為重要的方法添加`@LogExecutionTime`註解，系統會自動記錄執行時間、參數和返回值：

```java
import com.digitalconcerthall.logging.LogExecutionTime;

@LogExecutionTime
public Concert createConcert(ConcertRequest request) {
    // 方法實現
}
```

可以設置慢方法閾值：

```java
@LogExecutionTime(slowThreshold = 500) // 500毫秒
public List<Concert> searchConcerts(SearchCriteria criteria) {
    // 方法實現
}
```

#### 2. 跳過不重要的方法

對於不需要記錄的簡單方法，使用`@SkipLogging`註解：

```java
import com.digitalconcerthall.logging.SkipLogging;

@SkipLogging
public String getUsername() {
    return this.username;
}
```

#### 3. 添加日誌上下文

使用MDC（Mapped Diagnostic Context）添加自定義上下文信息：

```java
import org.slf4j.MDC;

// 添加用戶信息到當前線程的日誌上下文
MDC.put("userId", user.getId());
MDC.put("username", user.getUsername());

// 進行操作
logger.info("用戶訪問了音樂會詳情頁");

// 完成後清除上下文
MDC.remove("userId");
MDC.remove("username");
```

推薦使用try-finally確保上下文被清除：

```java
try {
    MDC.put("userId", user.getId());
    // 進行操作
} finally {
    MDC.remove("userId");
}
```

### 在測試中使用日誌系統

#### 1. 注入測試日誌服務

```java
import com.digitalconcerthall.logging.TestLoggingService;

@SpringBootTest
public class ConcertServiceTest {

    @Autowired
    private TestLoggingService testLogger;
    
    @Test
    public void testCreateConcert() {
        // 測試代碼
    }
}
```

#### 2. 記錄測試流程

```java
@Test
@TestMethod(description = "測試創建音樂會功能", tags = {"concert", "admin"})
public void testCreateConcert() {
    // 開始測試
    String testId = testLogger.startTest("音樂會創建", "測試管理員創建音樂會功能");
    
    try {
        // 記錄測試步驟
        testLogger.logTestStep(testId, "準備請求數據", "創建音樂會請求對象");
        ConcertRequest request = new ConcertRequest();
        request.setTitle("測試音樂會");
        
        // 執行被測試的方法
        testLogger.logTestStep(testId, "調用服務方法", "調用concertService.createConcert()");
        Concert result = concertService.createConcert(request);
        
        // 記錄斷言
        testLogger.logAssertion(testId, "驗證音樂會標題", 
                result.getTitle(), request.getTitle(), 
                result.getTitle().equals(request.getTitle()));
        
        // 完成測試
        testLogger.endTest(testId, true, "測試成功完成");
    } catch (Exception e) {
        // 記錄錯誤
        testLogger.logTestError(testId, "測試失敗: " + e.getMessage(), e);
        testLogger.endTest(testId, false, "測試失敗");
        throw e;
    }
}
```

## 日誌文件指南

### 日誌文件位置

所有日誌文件保存在專案根目錄的`/logs`目錄下：

```
/logs/
  ├── digital-concert-hall.log     # 主應用日誌
  ├── api.log                      # API請求日誌
  ├── performance.log              # 性能相關日誌
  ├── test.log                     # 測試執行日誌
  ├── error.log                    # 錯誤日誌
  └── *.log.yyyy-MM-dd.i           # 歷史滾動日誌文件
```

### 日誌文件內容

#### 1. 主應用日誌 (digital-concert-hall.log)

包含應用程序一般日誌信息，格式為：

```
2025-04-04 10:15:23.456 [requestId:123abc] [thread-1] INFO  com.digitalconcerthall.Controller - 處理請求
```

#### 2. API日誌 (api.log)

包含HTTP請求和響應詳情：

```
━━━━━ REQUEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: a1b2c3d4e5f6
URI: /api/admin/concerts
METHOD: POST
...
```

#### 3. 性能日誌 (performance.log)

包含方法執行時間信息：

```
▶ Method Execution [getId.Concert] - ConcertService.findById(id=123) 
✓ Method Execution [getId.Concert] - ConcertService.findById completed in 5 ms
```

#### 4. 測試日誌 (test.log)

包含測試執行步驟和結果：

```
▶▶▶ TEST STARTED ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶
TEST ID: T20250404-Concert-001
NAME: 音樂會創建測試
...
```

## 故障排除指南

### 1. 按請求ID跟踪問題

當用戶報告錯誤時，從錯誤日誌中找到相關的請求ID，然後使用該ID在API日誌中查找完整的請求和響應詳情：

```bash
grep "a1b2c3d4e5f6" logs/api.log
```

### 2. 識別性能瓶頸

檢查性能日誌中標記為慢執行的方法：

```bash
grep "Slow Method Execution" logs/performance.log
```

### 3. 分析測試失敗

查看測試日誌中的測試報告：

```bash
grep "TEST FAILED" logs/test.log
```

找到對應的測試ID後，可以查看完整的測試執行過程：

```bash
grep "T20250404-Concert-001" logs/test.log
```

## 最佳實踐

1. **為重要方法添加`@LogExecutionTime`註解**：
   - 數據庫操作方法
   - 複雜的業務邏輯方法
   - API控制器方法

2. **有效使用MDC**：
   - 為每個請求添加用戶ID、會話ID等上下文
   - 使用try-finally確保上下文被清除

3. **結構化測試日誌**：
   - 清晰命名測試步驟
   - 為每個測試添加足夠的標籤
   - 在斷言失敗時提供明確的錯誤信息

4. **定期檢查性能日誌**：
   - 識別執行慢的方法
   - 監控方法執行時間的趨勢
   - 及早發現性能退化

## 常見問題

### Q: 日誌文件越來越大怎麼辦？

A: 系統配置了自動滾動策略，每個日誌文件達到10MB會自動滾動，並保留最近30個歷史文件。

### Q: 如何在特定環境中禁用部分日誌功能？

A: 在`application.properties`中設置相應的日誌級別：

```properties
# 禁用API詳細日誌
logging.level.com.digitalconcerthall.logging.EnhancedLoggingFilter=WARN

# 禁用方法執行日誌
logging.level.com.digitalconcerthall.logging.MethodLoggingAspect=WARN
```

### Q: 如何找出特定用戶的操作日誌？

A: 如果您在代碼中使用MDC添加了用戶ID，可以使用以下命令：

```bash
grep "\[userId:12345\]" logs/digital-concert-hall.log
```

## 結論

數位音樂廳系統的日誌系統提供了強大的工具，幫助開發和運維團隊更好地理解系統行為、診斷問題和優化性能。通過合理使用這些工具，可以顯著提高系統的可維護性和穩定性。
