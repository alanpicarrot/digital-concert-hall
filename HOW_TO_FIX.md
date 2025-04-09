# 數位音樂廳專案修復與啟動指南

這份指南將幫助您修復數位音樂廳專案中的 API 路徑和配置問題，並啟動開發環境。

## 快速解決方案

我們提供了一個綜合修復腳本，它可以自動執行所有修復步驟並啟動應用程序：

```bash
# 設置執行權限
chmod +x fix-and-restart.sh

# 執行綜合修復腳本
./fix-and-restart.sh
```

## 問題分析

在檢查數位音樂廳專案後，我們發現以下問題：

1. **API URL 配置不一致**：
   - 前端環境變量中指定的後端地址不一致
   - 用戶前台指向 `http://localhost:8081`，但後端實際運行在 `8080` 端口

2. **API 路徑處理不完善**：
   - 應用 API 路徑標準未得到完全遵循
   - 某些請求可能缺少 `/api/` 前綴導致 404 錯誤

3. **缺乏調試工具**：
   - 沒有簡單的方式來檢測 API 連接問題
   - 缺少統一的路徑驗證機制

## 分步修復流程

如果您希望了解每個修復步驟的細節，可以按以下步驟手動操作：

### 1. 修復 API 配置

首先修復 API URL 配置：

```bash
chmod +x fix-api-config.sh
./fix-api-config.sh
```

這將會：
- 更新 `frontend-client/.env.development` 中的 API URL 為正確值
- 確保 `frontend-admin/.env.development` 配置正確
- 更新兩個前端應用的 `package.json` 中的代理設置

### 2. 更新 API 工具函數

接下來更新 API 工具函數：

```bash
chmod +x update-utils.sh
./update-utils.sh
```

這將會：
- 改進 API 路徑驗證邏輯
- 增強日誌輸出以便調試
- 添加專用的 API 測試工具
- 創建調試頁面用於測試 API 連接

### 3. 設置調試環境

設置調試環境：

```bash
chmod +x setup-debug.sh
./setup-debug.sh
```

這將執行上述兩個腳本，並設置所有腳本的執行權限。

### 4. 啟動服務

啟動所有服務：

```bash
./start-dev.sh
```

## 驗證修復結果

修復完成後，您可以通過以下方式驗證結果：

1. 訪問調試頁面：
   - 用戶前台：http://localhost:3000/debug/api-test
   - 管理員後台：http://localhost:3001/debug/api-test

2. 檢查 API 路徑標準：
   ```bash
   cd tools
   node check-api-paths.js
   ```

## 修復的文件

修復過程中，我們更新了以下文件：

1. 前端配置文件：
   - `frontend-client/.env.development`
   - `frontend-admin/.env.development`
   - `frontend-client/package.json` 和 `frontend-admin/package.json` 中的代理設置

2. API 工具：
   - `frontend-client/src/utils/apiUtils.js`
   - `frontend-admin/src/utils/apiUtils.js`

3. 添加了測試組件：
   - `frontend-client/src/components/debug/ApiTester.js`
   - `frontend-admin/src/components/debug/ApiTester.js`
   - `frontend-client/src/pages/debug/ApiTestPage.js`
   - `frontend-admin/src/pages/debug/ApiTestPage.js`

4. 更新了路由配置以包含調試頁面

## 注意事項

1. **啟動順序**：
   - 始終先啟動後端，再啟動前端服務
   - 使用 `./start-dev.sh` 可以自動按正確順序啟動服務

2. **端口使用**：
   - 後端 API：8080
   - 用戶前台：3000
   - 管理員後台：3001
   - 確保這些端口未被其他應用佔用

3. **API 標準**：
   - 所有 API 請求路徑必須以 `/api/` 開頭
   - 使用提供的 `validateApiPath` 函數確保路徑正確

4. **環境變量**：
   - 開發環境中不要手動修改 `.env.development` 文件
   - 如需臨時更改，請使用環境變量覆蓋

## 故障排除

如果在修復後仍然遇到問題，請嘗試以下步驟：

1. **後端連接問題**：
   ```bash
   # 檢查後端是否運行
   ps aux | grep spring-boot
   
   # 若需要，重啟後端
   ./stop-dev.sh
   cd backend
   mvn spring-boot:run
   ```

2. **前端構建問題**：
   ```bash
   # 清除並重新安裝依賴
   cd frontend-client
   rm -rf node_modules
   npm install
   npm start
   ```

3. **端口衝突**：
   ```bash
   # 查看佔用端口的進程
   lsof -i :8080
   lsof -i :3000
   lsof -i :3001
   
   # 終止特定進程
   ./kill-port.sh 8080
   ./kill-port.sh 3000
   ./kill-port.sh 3001
   ```

## 完整修復與重啟

如果遇到復雜問題，您可以執行完整修復：

```bash
# 停止所有服務
./stop-dev.sh

# 執行綜合修復腳本
./fix-and-restart.sh
```

## 後續改進建議

1. 實施後端架構改進，參考 `backend/ARCHITECTURE.md`
2. 考慮添加自動化測試
3. 實施容器化部署策略
