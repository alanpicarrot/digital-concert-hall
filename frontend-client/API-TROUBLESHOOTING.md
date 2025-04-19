# 數位音樂廳前後端連接問題排查指南

## 常見問題

### 無法獲取音樂會信息

**症狀：**
前端首頁無法顯示音樂會信息，或接收到空數據，但後端確實存在數據。

**可能原因：**
1. **API URL 配置錯誤** - 前端指向了錯誤的後端地址或端口
2. **API 路徑不匹配** - 前端請求的路徑與後端定義的路徑不一致
3. **CORS 問題** - 後端未配置允許前端域的跨域請求
4. **後端服務未運行** - 後端服務未啟動或運行在不同端口
5. **數據格式不匹配** - 前端期望的數據結構與後端返回不一致

**解決方案：**

1. **確認環境變量配置**
   ```
   # .env.development 檔案
   REACT_APP_API_URL=http://localhost:3001  # 確保與後端端口一致
   ```

2. **確認 package.json 代理設定**
   ```json
   "proxy": "http://localhost:3001"
   ```

3. **檢查 API 路徑**
   - 前端請求是否使用正確路徑 (例如: `/api/concerts` 或 `/concerts`)
   - 使用瀏覽器開發工具檢查網絡請求是否成功

4. **執行測試腳本**
   ```bash
   chmod +x test-api-connection.sh
   ./test-api-connection.sh
   ```

5. **修改 API URL 常量**
   - 確保服務文件中的 API URL 常量正確，例如:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
   ```

### 特定資源（如「台北爵士音樂節」）無法顯示

**症狀：**
部分資源（如特定音樂會或音樂節）無法顯示，但其他資源正常。

**可能原因：**
1. **資源 API 端點不同** - 特定資源可能使用了不同的 API 端點
2. **數據格式差異** - 新類型資源的數據結構可能與預期不同
3. **權限問題** - 特定資源可能需要授權才能訪問

**解決方案：**

1. **確認後端 API 結構**
   ```bash
   # 檢查所有可用端點
   curl http://localhost:3001/api
   ```

2. **查看特定資源的 API 路徑**
   ```bash
   # 檢查音樂節 API
   curl http://localhost:3001/api/festivals
   
   # 檢查特定類型的音樂會
   curl http://localhost:3001/api/concerts/types/jazz
   ```

3. **更新前端服務以支援新資源類型**
   - 可能需要創建新的服務文件，如 `festivalService.js`
   - 或者擴展現有服務以處理新的數據結構

4. **添加調試日誌**
   ```javascript
   console.debug(`API回應內容:`, response.data);
   ```

## 測試工具

### API 連接測試腳本

使用項目中的 `test-api-connection.sh` 腳本來測試與後端的連接。此腳本會檢查：
- 後端服務是否運行
- API 端點是否可訪問
- 特定資源是否存在

```bash
chmod +x test-api-connection.sh
./test-api-connection.sh
```

### 瀏覽器開發工具

使用瀏覽器的開發工具檢查：
1. 網絡請求 - 確認 API 請求發送到正確的 URL 並接收到響應
2. 控制台日誌 - 查看詳細錯誤信息
3. Application 選項卡 - 檢查環境變量是否正確應用

## 配置檢查清單

在排查前後端連接問題時，請檢查以下配置：

1. **環境變量**
   - `.env.development` 中的 `REACT_APP_API_URL` 設為 `http://localhost:8080`
   
2. **Proxy 設置**
   - `package.json` 中的 `proxy` 是否指向正確後端地址
   
3. **API 服務配置**
   - `concertService.js` 和其他服務文件中的 API URL 是否正確
   - 請求路徑是否與後端匹配

4. **API 路徑處理**
   - `validateApiPath` 是否正確處理路徑前綴
   - 避免重複添加 `/api` 前綴

5. **後端服務狀態**
   - 後端服務是否正常運行
   - 正確的端口是否可訪問
   
6. **CORS 設置**
   - 後端是否配置允許前端域的跨域請求

## 操作步驟

如果發現前端無法獲取音樂會信息，請按照以下步驟操作：

1. **檢查後端狀態**
   ```bash
   ./test-api-connection.sh
   ```

2. **更新環境配置**
   - 確認並更新 `.env.development` 中的 API URL
   - 更新 `package.json` 中的代理設置

3. **重啟前端服務**
   ```bash
   # 停止當前服務
   npx kill-port 3000
   
   # 重新啟動
   npm start
   ```

4. **清除瀏覽器緩存**
   - 使用 Chrome 開發工具中的 Application > Clear Storage 功能
   - 或按 Ctrl+Shift+R (Windows/Linux) 或 Cmd+Shift+R (Mac) 強制刷新

5. **檢查網絡請求**
   - 使用開發工具的 Network 選項卡檢查 API 請求
   - 確認請求 URL、響應狀態和內容

如果問題仍然存在，請考慮檢查後端服務的日誌和配置，確保其正確處理前端請求。