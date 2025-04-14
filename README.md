# 數位音樂廳系統

這個專案包含數位音樂廳的前後端代碼，用於提供線上音樂會票務和直播服務。

## 專案架構

專案分為三個主要部分：

1. **backend**: Spring Boot 後端 API 服務
   - 運行在 port 8080
   - 提供 REST API 服務

2. **frontend-client**: React 客戶端網站
   - 運行在 port 3000
   - 提供給最終用戶使用的介面

3. **frontend-admin**: React 管理後台
   - 運行在 port 3001
   - 提供給管理員使用的後台管理介面

## 啟動方式

### 使用腳本啟動所有服務

```bash
./start-services.sh
```

這將啟動：
- 後端 API 服務 (http://localhost:8080)
- 前端客戶端 (http://localhost:3000)
- 管理後台 (http://localhost:3001)

### 停止所有服務

```bash
./stop-services.sh
```

### 單獨啟動各服務

**啟動後端**
```bash
cd backend
./mvnw spring-boot:run
```

**啟動前端客戶端**
```bash
cd frontend-client
npm start
```

**啟動管理後台**
```bash
cd frontend-admin
npm start
```

## 開發注意事項

- 前端客戶端使用 port 3000 (固定)
- 管理後台使用 port 3001 (固定)
- 後端 API 使用 port 8080 (固定)

## 技術棧

- **後端**: Spring Boot 3.2.0, H2 Database
- **前端**: React 18, React Router 6, Tailwind CSS
- **構建工具**: Maven, npm

## 錯誤排查

若遇到 React Router 相關錯誤，例如:
```
TypeError: Cannot destructure property 'basename' of 'React10.useContext(...)' as it is null.
```

可能的解決方案：

1. 確認 BrowserRouter 添加了 basename 屬性：
```jsx
<BrowserRouter basename="/">
  {/* 其他元件 */}
</BrowserRouter>
```

2. 確保 react-router-dom 版本一致 (使用 v6.16.0)
```bash
npm install react-router-dom@6.16.0 --save
```

3. 若遇到 .mjs 檔案找不到問題，可在 dist 目錄中創建軟連結：
```bash
cd node_modules/react-router-dom/dist
ln -s index.js index.mjs
```
