# 數位音樂廳管理後台 - 專案結構文檔

## 專案概述

數位音樂廳管理後台是一個 React 應用程式，用於管理數位音樂廳的各項資源，包括音樂會、演出場次、票種和票券。管理員可以透過此後台進行各種管理操作。

## 目錄結構

```
/frontend-admin/src/
│
├── components/              # 共用元件
│   └── auth/               
│       └── AdminLogin.jsx   # 管理員登入表單元件
│
├── contexts/                # React Context API
│   └── AuthContext.jsx      # 認證相關狀態管理
│
├── layouts/                 # 頁面佈局元件
│   ├── AdminLayout.jsx      # 管理頁面佈局
│   └── AuthLayout.jsx       # 認證頁面佈局
│
├── pages/                   # 頁面元件
│   ├── ConcertsPage.jsx     # 音樂會管理頁面
│   ├── DashboardPage.jsx    # 儀表板頁面
│   ├── NotFoundPage.jsx     # 404 頁面
│   ├── PerformancesPage.jsx # 演出場次管理頁面
│   ├── TicketTypesPage.jsx  # 票種管理頁面
│   ├── TicketsPage.jsx      # 票券管理頁面
│   └── auth/
│       └── LoginPage.jsx    # 登入頁面
│
├── router/                  # 路由設定
│   ├── AdminRoute.jsx       # 權限控制元件
│   └── AdminRoutes.jsx      # 路由配置
│
├── services/                # API 服務
│   ├── admin/               # 管理 API
│   │   ├── concertService.js      # 音樂會相關 API
│   │   ├── performanceService.js  # 演出場次相關 API
│   │   ├── ticketService.js       # 票券相關 API
│   │   └── ticketTypeService.js   # 票種相關 API
│   ├── api/                 # 基礎 API 設定
│   └── authService.js       # 認證相關 API
│
├── App.js                   # 應用程式主元件
└── index.js                 # 應用程式入口點
```

## 主要元件說明

### 認證相關

1. **AuthContext.jsx**
   - 管理認證狀態的 Context Provider
   - 提供 login/logout 等功能
   - 使用 localStorage 存儲認證資訊

2. **AdminLogin.jsx**
   - 管理員登入表單
   - 處理表單驗證和提交
   - 使用 useAuth 進行登入操作

3. **AuthLayout.jsx**
   - 登入頁面的佈局元件
   - 包含標題和內容區域

4. **AdminRoute.jsx**
   - 權限控制的高階元件 (HOC)
   - 確保只有已認證的管理員可以訪問受保護的路由

### 管理功能頁面

1. **TicketTypesPage.jsx**
   - 票種管理頁面
   - 功能：新增、編輯、刪除票種
   - 使用 Modal 進行表單操作

2. **TicketsPage.jsx**
   - 票券管理頁面
   - 功能：新增、編輯、刪除票券、庫存管理
   - 可依演出場次篩選票券

## API 服務

1. **authService.js**
   - 提供認證相關 API 呼叫
   - 管理登入、登出、權杖處理等功能

2. **ticketTypeService.js**
   - 票種 CRUD 操作
   - `/api/admin/ticket-types` 端點

3. **ticketService.js**
   - 票券 CRUD 操作
   - 庫存管理功能
   - `/api/admin/tickets` 端點

## 路由結構

AdminRoutes.jsx 中定義的路由：

```jsx
<Routes>
  {/* 管理後台頁面 */}
  <Route path="/" element={<AdminLayout />}>
    <Route path="dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
    <Route path="concerts" element={<AdminRoute><ConcertsPage /></AdminRoute>} />
    <Route path="performances" element={<AdminRoute><PerformancesPage /></AdminRoute>} />
    <Route path="ticket-types" element={<AdminRoute><TicketTypesPage /></AdminRoute>} />
    <Route path="tickets" element={<AdminRoute><TicketsPage /></AdminRoute>} />
    <Route index element={<Navigate to="/dashboard" />} />
  </Route>
  
  {/* 登入頁面 */}
  <Route path="/auth" element={<AuthLayout />}>
    <Route path="login" element={<LoginPage />} />
  </Route>
  
  {/* 未匹配的路由重定向到登入頁面 */}
  <Route path="*" element={<Navigate to="/auth/login" />} />
</Routes>
```

## 共用元件設計模式

1. **Layout 元件**
   - 提供一致的頁面佈局結構
   - 使用 Outlet 渲染子路由內容

2. **權限控制**
   - 使用 HOC 模式包裝受保護的頁面
   - 結合 Context API 進行認證狀態管理

3. **表單處理**
   - 使用 Modal 進行表單操作
   - 集中管理表單狀態和提交邏輯

## 樣式設計

使用 Tailwind CSS 進行樣式設計，主要特點：

1. 卡片式設計 - 使用 rounded-lg, shadow-lg 等類別
2. 響應式佈局 - 使用 sm:px-6, lg:px-8 等響應式類別
3. 色彩方案 - 主要使用藍色系 (blue-600, indigo-500) 作為主色調
4. 表單元素 - 統一的表單元素樣式
5. 狀態提示 - 使用不同顏色的徽章來表示不同狀態
