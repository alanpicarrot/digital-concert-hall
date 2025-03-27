# 數位音樂廳專案架構文檔

## 專案概述

數位音樂廳是一個提供線上音樂會直播、點播和購票服務的平台。本專案採用前後端分離的架構，包含三個主要部分：

1. **後端 API 服務** - 提供數據和業務邏輯
2. **用戶前台** - 一般用戶使用的前端界面
3. **管理員後台** - 管理員使用的前端界面

## 專案結構

```
/projects/alanp/digital-concert-hall/
├── backend/                 # 後端 API 服務
├── frontend-client/         # 用戶前台應用
└── frontend-admin/          # 管理員後台應用
```

## 技術棧

### 後端
- Java 17
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- PostgreSQL (生產) / H2 (開發)
- JWT 認證
- Maven

### 前端（用戶前台和管理員後台）
- React 19
- React Router 7
- Axios
- TailwindCSS

## 後端架構

後端採用模組化架構，按功能域分組：

```
com.digitalconcerthall
├── common/                 # 通用元件
└── module/                 # 業務模組
    ├── user/               # 用戶模組
    ├── concert/            # 音樂會模組
    ├── ticket/             # 票務模組
    ├── payment/            # 支付模組
    ├── livestream/         # 直播模組
    └── notification/       # 通知模組
```

詳細後端架構說明請參考 `backend/ARCHITECTURE.md`。

## 前端架構

### 用戶前台 (frontend-client)

```
src/
├── components/             # 可重用的 UI 元件
├── contexts/               # React Context API 上下文
├── layouts/                # 頁面布局元件
├── pages/                  # 頁面元件
│   ├── auth/               # 認證相關頁面
│   ├── cart/               # 購物車相關
│   ├── checkout/           # 結帳相關
│   ├── home/               # 首頁相關
│   ├── payment/            # 支付相關
│   └── user/               # 用戶中心相關
├── router/                 # 路由設置
├── services/               # API 服務和數據處理
└── utils/                  # 工具函數
```

### 管理員後台 (frontend-admin)

```
src/
├── components/             # 可重用的 UI 元件
├── contexts/               # React Context API 上下文
├── layouts/                # 頁面布局元件
├── pages/                  # 頁面元件
│   ├── auth/               # 認證相關頁面
│   ├── concerts/           # 音樂會管理
│   ├── dashboard/          # 儀表板相關
│   ├── performances/       # 演出管理
│   ├── tickets/            # 票種管理
│   └── users/              # 用戶管理
├── router/                 # 路由設置
├── services/               # API 服務和數據處理
└── utils/                  # 工具函數
```

## API 接口設計

API 遵循 RESTful 設計原則，主要接口分為：

- `/api/auth/**` - 認證相關
- `/api/users/**` - 用戶相關
- `/api/concerts/**` - 音樂會相關
- `/api/performances/**` - 演出相關
- `/api/tickets/**` - 票種和票務相關
- `/api/orders/**` - 訂單相關
- `/api/payments/**` - 支付相關
- `/api/livestreams/**` - 直播相關

## 開發工作流程

1. 開發前先從主分支拉取最新代碼
2. 根據功能或修復創建新分支
3. 完成開發後提交到對應分支
4. 創建合併請求(Pull Request)
5. 通過代碼審查後合併到主分支

## 開發環境設置

### 快速啟動所有服務

專案提供了腳本來快速啟動所有服務：

```bash
# 設置腳本執行權限
chmod 755 start-dev.sh stop-dev.sh
# 或者使用我們提供的腳本
bash setup-permissions.sh

# 啟動所有服務
./start-dev.sh

# 停止所有服務
./stop-dev.sh
```

所有服務啟動後，可以訪問：
- 用戶前台：http://localhost:3000
- 管理員後台：http://localhost:3001
- 後端 API：http://localhost:8080

詳見各個子目錄中的 README.md 文件：
- 後端: `backend/README.md`
- 用戶前台: `frontend-client/README.md`
- 管理員後台: `frontend-admin/README.md`

## 部署

### 開發環境
- 後端：本地運行 Spring Boot 應用
- 前台：通過 npm start 運行開發服務器
- 後台：通過 npm start 運行開發服務器（不同端口）

### 生產環境部署建議
- 後端：部署為 Docker 容器，使用 Nginx 作為反向代理
- 前台：構建靜態文件後部署到 CDN 或 Web 服務器
- 後台：構建靜態文件後部署到 Web 服務器（可使用不同子域名）
