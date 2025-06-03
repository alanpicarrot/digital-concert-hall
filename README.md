# 數位音樂廳系統

數位音樂廳系統是一個完整的線上音樂會票務和用戶管理平台，提供全方位的音樂會預訂、票券管理、用戶管理和支付功能。

## 🎵 專案特色

- **票務系統**：音樂會、演出場次、票種、票券管理
- **用戶管理系統**：用戶註冊、登入、角色權限管理
- **管理後台**：管理員可管理音樂會、票券、用戶等所有資源
- **支付整合**：模擬支付和真實支付閘道（可切換）
- **自動化測試**：完整的 Playwright 端到端測試
- **資料庫支援**：MySQL 和 PostgreSQL 雙資料庫支援

## 📁 專案架構

專案分為三個主要部分：

### 1. **backend** - Spring Boot 後端服務

- **port**: 8080
- **技術堆疊**: Spring Boot 3.2.12, Java 17, Spring Security, JPA
- **資料庫**: MySQL
- **功能**: REST API 服務、JWT 認證、角色權限管理

### 2. **frontend-client** - React 用戶端網站

- **port**: 3000
- **技術堆疊**: React 18, React Router 6, Tailwind CSS, Axios
- **功能**: 用戶註冊登入、音樂會瀏覽、票券購買、訂單管理

### 3. **frontend-admin** - React 管理後台

- **port**: 3001
- **技術棧**: React 18, React Router 6, Tailwind CSS
- **功能**: 用戶管理、音樂會管理、票券管理、數據統計

## 🚀 快速啟動

### 一鍵啟動所有服務

```bash
# 啟動所有服務（後端 + 前端 + 管理後台）
./start.sh
```

服務啟動後：

- 後端 API: http://localhost:8080
- 用戶端: http://localhost:3000
- 管理後台: http://localhost:3001
- 日誌文件: `logs/` 目錄

### 停止所有服務

```bash
./stop.sh
```

### 分別啟動各服務

**後端服務**

```bash
cd backend
./mvnw spring-boot:run
```

**用戶端前端**

```bash
cd frontend-client
npm install
npm start
```

**管理後台**

```bash
cd frontend-admin
npm install
PORT=3001 npm start
```

## 🗄️ 資料庫設定

### 自動化設定

```bash
# 執行資料庫設定腳本
chmod +x setup-database.sh
./setup-database.sh
```

### 手動設定

```bash
# 直接執行 SQL 腳本
mysql -u [username] -p < create_database_schema.sql
```

### 資料庫結構

系統包含 12 個核心表格：

- **roles**: 系統角色 (USER, MODERATOR, ADMIN)
- **users**: 一般用戶
- **admin_users**: 管理員用戶
- **user_roles** / **admin_user_roles**: 用戶角色關聯
- **concerts**: 音樂會
- **performances**: 演出場次
- **ticket_types**: 票券類型
- **tickets**: 票券庫存
- **orders**: 訂單
- **order_items**: 訂單明細
- **user_tickets**: 用戶持有票券

## 🔧 詳細技術堆疊

### 後端技術

- **框架**: Spring Boot 3.2.12
- **Java 版本**: 17
- **安全**: Spring Security + JWT (io.jsonwebtoken 0.11.5)
- **資料庫**: MySQL Connector, PostgreSQL
- **ORM**: Spring Data JPA, Hibernate
- **工具**: Lombok, AspectJ (AOP 日誌)
- **構建工具**: Maven
- **測試**: Spring Boot Test, Security Test

### 前端技術

- **框架**: React 18.2.0
- **路由**: React Router DOM 6.16.0
- **樣式**: Tailwind CSS 3.3.0
- **HTTP 客戶端**: Axios 1.4.0
- **圖標**: Lucide React 0.263.0
- **工具**: date-fns 2.30.0
- **構建工具**: Create React App

## 🔐 API 端點

### 用戶認證 API

```
POST /api/auth/signin          # 用戶登入
POST /api/auth/register        # 用戶註冊
POST /api/auth/register-admin  # 管理員註冊
POST /api/auth/logout          # 登出
```

### 音樂會 API

```
GET  /api/concerts             # 獲取所有音樂會
GET  /api/concerts/{id}        # 獲取特定音樂會
GET  /api/concerts/upcoming    # 即將上演音樂會
POST /api/admin/concerts       # 創建音樂會（管理員）
PUT  /api/admin/concerts/{id}  # 更新音樂會（管理員）
```

### 用戶管理 API

```
GET    /api/admin/users           # 獲取所有用戶
POST   /api/admin/users           # 創建新用戶
PUT    /api/admin/users/{id}      # 更新用戶資料
PUT    /api/admin/users/{id}/roles # 更新用戶角色
PUT    /api/admin/users/{id}/password-reset # 重置密碼
DELETE /api/admin/users/{id}      # 刪除用戶
```

### 訂單與票券 API

```
GET  /api/users/me/orders         # 獲取用戶訂單
GET  /api/users/me/tickets        # 獲取用戶票券
POST /api/orders                  # 創建訂單
GET  /api/orders/{orderNumber}    # 獲取訂單詳情
```

### 支付 API

```
POST /api/payment/mock-payment    # 模擬支付（開發用）
POST /api/payment/ecpay/create    # 真實支付閘道
GET  /api/payment/status          # 查詢支付狀態
```

## 💳 支付系統

系統支援兩種支付模式，可通過功能開關切換：

### 開發模式（預設）

```javascript
// 使用模擬支付，無需真實金流
FeatureFlags.setFlag("USE_REAL_PAYMENT", false);
```

### 生產模式（施工中）

```javascript
// 使用真實綠界支付閘道
FeatureFlags.setFlag("USE_REAL_PAYMENT", true);
```

## 🧪 自動化測試

### Playwright 端到端測試

```bash
cd tests
npm install
npm test
```

### 測試功能

- **認證測試**: 用戶登入、註冊流程
- **訂單測試**: 完整的購票流程
- **API 測試**: 後端 API 端點測試
- **JWT 調試**: 認證令牌測試

## 👥 用戶管理功能

### 管理後台功能

1. **用戶列表**: 查看所有用戶資訊
2. **創建用戶**: 新增用戶帳號
3. **編輯用戶**: 修改用戶基本資料
4. **角色管理**: 分配用戶權限角色
5. **密碼重置**: 管理員重置用戶密碼
6. **刪除用戶**: 移除用戶帳號

### 權限角色

- **ROLE_USER**: 一般用戶權限
- **ROLE_MODERATOR**: 版主權限
- **ROLE_ADMIN**: 管理員權限

## 📝 開發注意事項

### API 路徑規範

所有 API 路徑必須以 `/api` 開頭：

```javascript
// 正確
axiosInstance.get("/api/concerts");

// 錯誤
axiosInstance.get("/concerts");
```

### 環境變數設定

```bash
# 後端連接埠 (固定)
server.port=8080

# 前端開發環境
REACT_APP_API_URL=http://localhost:8080
```

### 資料庫連接

```properties
# MySQL 配置範例
spring.datasource.url=jdbc:mysql://localhost:3306/digital_concert_hall
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=validate
```

## 📚 相關文檔

- **用戶管理**: `USER_MANAGEMENT_README.md`
- **資料庫設定**: `DATABASE_SETUP_README.md`
- **API 開發**: `Documentation/backend-development-guide.md`
- **支付實作**: `Documentation/payment-implementation-plan/`
- **問題排除**: `Documentation/bugfix-logs/`

## 🔧 故障排除

### 常見問題

**1. 連接埠佔用**

```bash
# 檢查佔用的連接埠
lsof -i:3000
lsof -i:3001
lsof -i:8080

# 清理連接埠
./stop.sh
```

**2. API 路徑 404 錯誤**

- 確保所有 API 請求路徑以 `/api` 開頭
- 檢查後端控制器 `@RequestMapping` 包含 `/api` 前綴

**3. 認證失敗**

- 檢查 JWT token 是否有效
- 確認用戶角色權限正確

**4. 資料庫連接問題**

- 確認 MySQL/PostgreSQL 服務運行
- 檢查資料庫連接字串和憑證

## 🎯 系統功能亮點

✅ **完整的用戶認證系統**（註冊、登入、JWT）  
✅ **多角色權限管理**（用戶、版主、管理員）  
✅ **音樂會和票券管理**（CRUD 操作）  
✅ **訂單處理系統**（購票、付款、確認）  
✅ **管理後台介面**（用戶、內容管理）  
✅ **支付閘道整合**（模擬 + 真實支付）  
✅ **響應式 UI 設計**（Tailwind CSS）  
✅ **自動化測試覆蓋**（Playwright E2E）  
✅ **完整的 API 文檔**（REST API）  
✅ **資料庫遷移腳本**（MySQL/PostgreSQL）

---

**版本**: 3.1.0  
**更新日期**: 2025 年 4 月 16 日  
