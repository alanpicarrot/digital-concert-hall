# 數位音樂廳專案文檔

本目錄包含數位音樂廳專案的重要開發文檔和記錄。

## 開發記錄

- [前端重構開發記錄](development-logs/frontend-refactoring-session.md) - 記錄了數位音樂廳前後台分離重構過程
- [前端樣式調整記錄](frontend-styling-session/styling-session-log.md) - 記錄了前端UI樣式的調整和優化過程

## 設計資源

- [前端樣式指南](frontend-styling-session/style-guide.md) - 前端樣式統一標準和規範
- [代碼變更摘要](frontend-styling-session/code-changes-summary.md) - 主要代碼修改的詳細記錄

## 資料結構

本專案分為三個主要部分：

1. **frontend-client** - 用戶前台
   - 提供音樂會瀏覽、購票和觀看功能
   - 用戶賬戶管理
   - 使用深紫色為主色調的界面設計

2. **frontend-admin** - 管理員後台
   - 演出管理
   - 用戶管理
   - 訂單管理
   - 數據統計和報告

3. **backend** - 後端API服務
   - 處理所有前台和後台的數據請求
   - 提供RESTful API接口
   - 管理數據庫操作

## 開發環境

本專案使用以下技術棧：

- **前端**：React、React Router、Tailwind CSS
- **後端**：Spring Boot
- **數據庫**：MySQL
- **版本控制**：Git

## 本地開發指南

要在本地運行完整的開發環境，請執行：

```bash
# 確保腳本有執行權限
chmod 755 *.sh

# 啟動所有服務
./start-dev.sh
```

這將啟動：
- 用戶前台 - http://localhost:3000
- 管理員後台 - http://localhost:3001
- 後端API服務 - http://localhost:8080

要停止所有服務：

```bash
./stop-dev.sh
```

## 佈署指南

詳細的佈署指南請參閱項目根目錄的 [DEPLOYMENT.md](../DEPLOYMENT.md) 文件。

## 貢獻指南

若要為本專案貢獻代碼，請參照項目根目錄的 [CONTRIBUTING.md](../CONTRIBUTING.md) 文件。
