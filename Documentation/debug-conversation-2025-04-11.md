# 數位音樂廳系統除錯記錄

日期：2025-04-11

## 初始問題

用戶提出以下問題：

```
初始化測試資料...
{"success":false,"message":"發生錯誤: Ambiguous handler methods mapped for '/api/setup/init': {public org.springframework.http.ResponseEntity com.digitalconcerthall.controller.ApiSetupController.initSystem(), public org.springframework.http.ResponseEntity com.digitalconcerthall.controller.SetupController.initSystem()}"}
{"database":{"userCount":3,"status":"UP"},"message":"Service is running","status":"UP","timestamp":1744349265999}
{"path":"/api/data/create-all","requestUrl":"/api/data/create-all","requestMethod":"GET","error":"Unauthorized","message":"Full authentication is required to access this resource","status":401,"fullErrorMessage":"org.springframework.security.authentication.InsufficientAuthenticationException: Full authentication is required to access this resource"}
這是我設定const FORCE_MOCK_MODE = false;造成的嗎？
```

## 問題分析

1. **控制器路徑衝突**：在系統中存在兩個控制器同時映射到 `/api/setup/init` 路徑：
   - `com.digitalconcerthall.controller.ApiSetupController.initSystem()`
   - `com.digitalconcerthall.controller.SetupController.initSystem()`

2. **未授權錯誤**：嘗試訪問 `/api/data/create-all` 時出現 401 未授權錯誤，表示該端點需要身份驗證。

3. **關於 FORCE_MOCK_MODE**：在搜索整個代碼庫後，並未找到 `FORCE_MOCK_MODE` 變量的定義或使用情況，因此這不是造成問題的原因。

## 解決方案

### 1. 控制器路徑衝突問題

整合了 `ApiSetupController`，使其同時處理 `/setup` 和 `/api/setup` 路徑：

```java
@RestController
@RequestMapping({"/setup", "/api/setup"})
public class ApiSetupController {
    // ...

    @GetMapping({"/init", "/admin-init"})
    public ResponseEntity<?> initSystem() {
        // ...
    }
    
    // ...
}
```

移除了衝突的 `SetupController.java`，將其重命名為 `.bak` 文件。

### 2. 移除測試數據功能

用戶確認不需要測試數據創建功能，因此：

1. 移除了 `TestDataController.java`，將其重命名為 `.bak` 文件
2. 從安全配置中移除了 `/api/data/**` 路徑
3. 修改了啟動腳本 `start.sh`，移除了對 `/api/data/create-all` 端點的調用

## 結論

這些修改解決了系統啟動時的路徑衝突問題，並移除了不需要的測試數據創建功能。系統現在應該可以正常啟動，並且不會有之前遇到的錯誤。

`FORCE_MOCK_MODE = false` 設置與這些問題無關，因為在代碼庫中未找到該變量的定義或使用。
