## API 路徑標準

為了確保前後端 API 路徑的一致性，本專案已建立了統一的 API 路徑標準：

- 所有 API 路徑必須以 `/api/` 開頭
- 前端使用 `validateApiPath` 函數確保路徑正確
- 後端控制器使用 `@RequestMapping("/api/...")` 設置路徑

詳細規範請參考 `Documentation/API_PATH_STANDARD.md`。

我們提供了一些工具來幫助檢查和修复 API 路徑問題：

```bash
# 執行 API 路徑檢查
./check-api-paths.sh

# 自動修复 API 路徑問題
./migrate-api-paths.sh
```

# 數位音樂廳專案 (Digital Concert Hall)

本專案為一個數位音樂廳平台，提供線上音樂會直播、點播和購票功能。

## 最新更新

專案已完成前台和後台的分離，現在使用三個獨立的專案來運行：

- **backend** - 後端 API 服務
- **frontend-client** - 用戶前台 (目標端口: 3000)
- **frontend-admin** - 管理員後台 (目標端口: 3001)

## 專案結構

專案針對維護性和操作效率进行了優化，采用了清晰的三層架構：

```
/projects/alanp/digital-concert-hall/
├── backend/                # 後端 API 服務（Spring Boot）
├── frontend-client/        # 用戶前台（React）
├── frontend-admin/         # 管理員後台（React）
├── start-dev.sh           # 啟動所有服務的腳本
└── stop-dev.sh            # 停止所有服務的腳本
```

## 快速啟動所有服務

為了方便開發，專案提供了腳本來同時啟動所有服務：

```bash
# 設置腳本執行權限
chmod 755 start-dev.sh stop-dev.sh
# 或者使用我們提供的腳本
bash setup-permissions.sh

# 啟動所有服務
./start-dev.sh
# 或者如果不能直接執行腳本，可以用以下方式
bash start-dev.sh

# 停止所有服務
./stop-dev.sh
# 或者
bash stop-dev.sh
```

所有服務啟動後，可以訪問：
- 用戶前台：http://localhost:3000
- 管理員後台：http://localhost:3001
- 後端 API：http://localhost:8080

## 手動開發環境設置

如果您希望手動啟動各個服務，可以使用以下步驟：

### 後端（backend）

1. 進入後端目錄：
   ```
   cd backend
   ```

2. 使用 Maven 編譯並運行：
   ```
   mvn clean install
   mvn spring-boot:run
   ```

後端服務將在 http://localhost:8080 上運行。

### 用戶前台（frontend-client）

1. 進入前台目錄：
   ```
   cd frontend-client
   ```

2. 安裝依賴：
   ```
   npm install
   ```

3. 啟動開發服務器：
   ```
   PORT=3000 npm start
   ```

前台應用將在 http://localhost:3000 上運行。

### 管理員後台（frontend-admin）

1. 進入後台目錄：
   ```
   cd frontend-admin
   ```

2. 安裝依賴：
   ```
   npm install
   ```

3. 啟動開發服務器：
   ```
   PORT=3001 npm start
   ```

管理後台將在 http://localhost:3001 上運行。

## 主要功能

- 用戶前台：
  - 瀏覽音樂會信息
  - 購買音樂會門票
  - 觀看直播和點播內容
  - 用戶帳號管理
  - 訂單查詢和管理

- 管理員後台：
  - 音樂會和演出管理
  - 票種設置
  - 訂單管理
  - 系統數據分析
  - 用戶管理

## 詳細文件

想了解更多關於專案架構和容器化部署策略，請參考 `PROJECT_STRUCTURE.md` 文件。
