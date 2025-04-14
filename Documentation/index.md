# 數位音樂廳用戶管理功能文檔

## 文檔目錄

1. [用戶管理功能說明](./USER_MANAGEMENT_README.md) - 詳細的功能說明和API文檔
2. [用戶管理功能實現摘要](./user-management-summary.md) - 功能實現的技術摘要
3. [腳本整合摘要](./user-management-integration-summary.md) - 啟動停止腳本整合說明
4. [開發對話紀錄](./user-management-conversation.md) - 開發過程中的對話紀錄

## 啟動和停止腳本

- [啟動腳本](./start_user_management.sh) - 用於啟動後端和管理前端服務
- [停止腳本](./stop_user_management.sh) - 用於停止所有相關服務

腳本主要特點：

- 彩色輸出提升可讀性
- 詳細的歷程記錄
- 強化的錯誤處理
- 自動清理殘留進程和釋放端口
- 健康檢測確保服務正常運行

## 功能摘要

數位音樂廳用戶管理功能提供完整的用戶管理解決方案，包括：

- 用戶列表查看和搜索
- 新用戶創建
- 用戶資料編輯
- 用戶角色管理
- 密碼重置
- 用戶刪除

這些功能通過RESTful API和React前端界面實現，確保系統管理員能夠有效地管理所有用戶。

## 技術棧

- **後端**：Spring Boot, Spring Security, Spring Data JPA
- **前端**：React, Tailwind CSS
- **數據庫**：H2/PostgreSQL
- **API風格**：RESTful

## 使用方法

1. 執行啟動腳本：`./start_user_management.sh`
2. 訪問管理後台：http://localhost:3001
3. 登入管理員賬號
4. 導航至用戶管理頁面：http://localhost:3001/users
5. 完成後執行停止腳本：`./stop_user_management.sh`