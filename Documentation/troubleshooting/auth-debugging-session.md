# 認證系統除錯紀錄

日期：2025-03-28

## 問題描述

後台管理系統在初始化和測試API端點時出現401未授權錯誤。具體表現為：

1. 系統成功執行 `/setup/admin-init` 初始化
2. 成功創建用戶（testuser 和 admin）
3. 測試端點 `/test/ping` 請求失敗，顯示401錯誤
4. 前端應用顯示多個 `GET http://localhost:8081/api/api/***` 錯誤，表明API路徑重複

## 原因分析

1. **主要問題：API路徑重複**
   - `.env.development` 中的環境變量 `REACT_APP_API_URL` 設置為 `http://localhost:8081/api`
   - `authService.js` 又在 `API_URL` 後添加了 `/api` 前綴
   - 結果路徑變成了 `/api/api/...`，這是不正確的

2. **JWT認證問題**
   - 測試API時沒有正確傳遞JWT令牌
   - 需要先登入獲取令牌，再測試受保護的端點

3. **控制器問題**
   - `SetupController.java` 是備份文件（.bak擴展名）
   - 缺少處理 `/api/test/ping` 的 ApiTestController

## 解決方案

1. **修複環境變量設置**
   ```diff
   # .env.development
   -REACT_APP_API_URL=http://localhost:8081/api
   +REACT_APP_API_URL=http://localhost:8081
   ```

2. **創建API測試控制器**
   ```java
   // ApiTestController.java
   @RestController
   @RequestMapping("/api/test")
   public class ApiTestController {
       @GetMapping("/ping")
       public ResponseEntity<?> ping() {
           return ResponseEntity.ok("pong - API 測試成功!");
       }
       // ...
   }
   ```

3. **恢復設置控制器**
   ```bash
   mv SetupController.java.bak SetupController.java
   ```

4. **修改前端API請求**
   - 使用絕對URL替代依賴環境變量
   - 添加詳細的錯誤處理和日誌
   - 改進重試機制，嘗試多個可能的路徑

5. **更新測試方法**
   - 使用 `authService.axiosInstance` 確保JWT令牌正確傳遞
   - 簡化初始化和創建用戶邏輯

## 關鍵修改

### 1. 環境變量修復
```javascript
// 修改前
// API_BASE = `${API_URL}/api` 當 API_URL 已包含 /api 時導致重複

// 修改後
// API_URL = 'http://localhost:8081'
// API_BASE = `${API_URL}/api`
```

### 2. 直接使用絕對URL
```javascript
// 修改前
response = await axios.get(`${API_URL}${path}`);

// 修改後
response = await axios.get(`http://localhost:8081/api/setup/init`);
```

### 3. 使用 authService.axiosInstance
```javascript
// 確保請求帶有正確的JWT令牌
response = await authService.axiosInstance.get('/setup/init');
```

## 調試腳本

為了診斷問題，創建了一個調試腳本：

```javascript
/**
 * 調試腳本 - 測試初始化和認證流程
 */
async function testPaths() {
  const baseUrl = 'http://localhost:8081';
  
  // 嘗試初始化
  let response = await fetch(`${baseUrl}/api/setup/init`);
  
  // 嘗試登入
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser', password: 'password123' })
  });
  
  const authData = await loginResponse.json();
  const token = authData.accessToken;
  
  // 使用令牌測試API
  const testResponse = await fetch(`${baseUrl}/api/test/ping`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('測試響應:', await testResponse.text());
}
```

## 後續建議

1. **統一API命名約定**：
   - 確保所有API端點使用一致的命名模式
   - 考慮使用統一的前綴（/api）並在文檔中明確說明

2. **環境變量管理**：
   - 避免在環境變量中包含路徑前綴，保持其簡單性
   - 在代碼中明確添加前綴，使路徑更清晰

3. **認證錯誤處理**：
   - 改進401錯誤的處理，提供更有用的錯誤信息
   - 考慮自動重新獲取令牌的機制

4. **代碼清理**：
   - 移除或註釋調試信息，保持界面簡潔
   - 整合重複的路徑嘗試邏輯

## 結論

認證問題已成功解決。問題的根源是API路徑重複和JWT令牌處理的問題。通過修改環境變量、創建必要的控制器並改進API請求邏輯，系統現在可以正確初始化、登入並訪問受保護的資源。

後續使用系統時，如有類似問題，可查看瀏覽器控制台的網絡請求，檢查請求URL是否正確及認證頭部是否包含有效的JWT令牌。