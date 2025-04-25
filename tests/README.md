# Digital Concert Hall 測試腳本

這個目錄包含用於測試數位音樂廳應用的Playwright自動化測試腳本。

## 測試文件

1. `auth-order-test.js` - 完整測試登入和訂單創建流程
2. `jwt-debug.js` - 專門用於調試JWT令牌問題
3. `direct-api-test.js` - 直接測試後端API而不依賴前端UI

## 安裝步驟

```bash
# 安裝依賴
cd /Users/alanp/digital-concert-hall/tests
npm install

# 安裝Playwright瀏覽器
npx playwright install
```

## 運行測試

```bash
# 運行所有測試
npm test

# 僅運行認證測試
npm run test:auth

# 僅運行API測試
npm run test:api

# 運行完整的登入和下單流程測試
npm run test:full
```

## 生成的報告

測試完成後，HTML報告將生成在 `playwright-report` 目錄中。可以用瀏覽器打開 `playwright-report/index.html` 查看詳細報告。

## 注意事項

1. 測試前請確保前端和後端服務都已啟動：
   - 前端： `http://localhost:3000`
   - 後端： `http://localhost:8080`

2. 在測試之前，請確保使用以下憑據創建了測試用戶（或更新腳本中的憑據）：
   - 用戶名： `testuser`
   - 密碼： `password123`

3. 如果遇到失敗，請檢查生成的屏幕截圖和錯誤日誌。
