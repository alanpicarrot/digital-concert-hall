# 數位音樂廳後端系統開發與除錯指南

## 系統概述

數位音樂廳後端系統是一個基於 Spring Boot 的 RESTful API 服務，提供了以下主要功能：

1. **用戶管理**：註冊、登入、權限管理
2. **音樂會管理**：創建、編輯、刪除音樂會
3. **場次管理**：為音樂會創建不同的演出場次
4. **票種管理**：定義不同價格和類型的票種
5. **票券管理**：為場次分配票券，管理票券庫存

系統使用 JWT 進行認證，H2 內存數據庫用於數據存儲（開發環境），並提供了一系列 RESTful API 端點供前端調用。

## 環境設置與運行

1. **啟動後端服務**：

   ```bash
   cd /Users/alanp/digital-concert-hall/backend
   bash make-scripts-executable.sh  # 確保腳本有執行權限
   ./start-debug.sh                # 以除錯模式啟動服務
   ```

2. **測試系統連通性**：

   ```bash
   ./run-system-test.sh            # 運行全面系統測試
   ```

   或針對特定功能測試：

   ```bash
   ./test-admin-login.sh           # 測試管理員登入功能
   ```

3. **訪問 H2 資料庫控制台**：
   在瀏覽器中打開 http://localhost:8080/h2-console
   
   連接詳情：
   - JDBC URL: `jdbc:h2:mem:testdb`
   - 用戶名: `sa`
   - 密碼: `password`

## API 端點說明

1. **公開 API**：
   - `GET /api/concerts`: 獲取所有可用音樂會
   - `GET /api/concerts/{id}`: 獲取特定音樂會詳情
   - `GET /api/performances/{id}`: 獲取特定場次詳情
   - `GET /api/health-check`: 健康檢查端點
   - `GET /api/dashboard-test`: 測試儀表板數據

2. **認證 API**：
   - `POST /api/auth/signin`: 用戶登入
   - `POST /api/auth/register`: 用戶註冊
   - `POST /api/auth/register-admin`: 管理員註冊
   - `POST /api/test-login/admin`: 測試用管理員登入（自動創建測試管理員）

3. **管理員 API**：(需要 ROLE_ADMIN 權限)
   - 音樂會管理：
     - `GET /api/admin/concerts`: 獲取所有音樂會（包括非活躍的）
     - `POST /api/admin/concerts`: 創建新音樂會
     - `PUT /api/admin/concerts/{id}`: 更新音樂會
     - `DELETE /api/admin/concerts/{id}`: 刪除音樂會
   
   - 場次管理：
     - `GET /api/admin/performances`: 獲取所有場次
     - `GET /api/admin/performances/concert/{concertId}`: 獲取特定音樂會的所有場次
     - `POST /api/admin/performances`: 創建新場次
     - `PUT /api/admin/performances/{id}`: 更新場次
     - `DELETE /api/admin/performances/{id}`: 刪除場次
     - `PATCH /api/admin/performances/{id}/status`: 更新場次狀態
   
   - 票種管理：
     - `GET /api/admin/ticket-types`: 獲取所有票種
     - `GET /api/admin/ticket-types/{id}`: 獲取特定票種
     - `POST /api/admin/ticket-types`: 創建新票種
     - `PUT /api/admin/ticket-types/{id}`: 更新票種
     - `DELETE /api/admin/ticket-types/{id}`: 刪除票種
   
   - 票券管理：
     - `GET /api/admin/tickets`: 獲取所有票券
     - `GET /api/admin/tickets/performance/{performanceId}`: 獲取特定場次的所有票券
     - `POST /api/admin/tickets`: 創建新票券
     - `PUT /api/admin/tickets/{id}`: 更新票券
     - `DELETE /api/admin/tickets/{id}`: 刪除票券
     - `PATCH /api/admin/tickets/{id}/inventory`: 更新票券庫存
   
   - 儀表板管理：
     - `GET /api/admin/dashboard/stats`: 獲取儀表板統計數據
     - `POST /api/admin/dashboard/create-demo-concert`: 創建一套完整的演示音樂會數據

## 常見問題與解決方案

1. **登入問題**：
   - 問題：無法使用管理員帳號登入
   - 解決方案：
     - 使用測試登入端點 `POST /api/test-login/admin` 自動創建並登入管理員帳號
     - 檢查 H2 控制台中的 USERS 表和 ROLES 表，確認管理員用戶存在並具有適當角色
     - 查看後端日誌，尋找與認證/授權相關的錯誤訊息

2. **CORS 問題**：
   - 問題：前端收到 CORS 相關錯誤
   - 解決方案：
     - 確認 `CorsConfig.java` 中已正確設置前端的 URL
     - 確保前端請求中包含適當的 credentials 設置
     - 檢查 HTTP 方法是否被正確允許

3. **JWT 認證問題**：
   - 問題：無效的 JWT 令牌
   - 解決方案：
     - 檢查令牌過期時間，默認設置為 24 小時
     - 確保前端正確存儲並發送 JWT 令牌
     - 查看後端日誌中有關 JWT 驗證的詳細錯誤訊息

4. **資料庫操作問題**：
   - 問題：數據庫操作失敗
   - 解決方案：
     - 確認 H2 控制台可以正常訪問
     - 檢查資料庫架構是否符合預期
     - 查看應用程序啟動時的 SQL 執行日誌

## 關鍵功能的實現指南

1. **創建完整的音樂會套件**：

   為了快速創建一個完整的音樂會（包含場次和票種），可以使用新增的批量創建功能：

   ```bash
   # 使用 curl 命令創建演示音樂會
   curl -X POST -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:8080/api/admin/dashboard/create-demo-concert
   ```

   這會一次性創建：
   - 一個莫扎特小提琴協奏曲音樂會
   - 兩個演出場次（週五晚上和週六下午）
   - 三種票種（VIP票、一般票、學生票）

2. **手動創建音樂會流程**：

   完整的手動創建流程如下：
   
   a. 創建音樂會：
   ```bash
   curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{"title":"貝多芬鋼琴音樂會", "description":"精彩的貝多芬鋼琴作品演出", "status":"active"}' \
     http://localhost:8080/api/admin/concerts
   ```
   
   b. 為該音樂會創建場次：
   ```bash
   curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{"concertId":"1", "startTime":"2025-05-15T19:30:00", "venue":"數位音樂廳主廳", "status":"scheduled"}' \
     http://localhost:8080/api/admin/performances
   ```
   
   c. 創建票種：
   ```bash
   curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{"name":"VIP票", "description":"最佳視聽位置", "price":"2000", "colorCode":"#FFD700"}' \
     http://localhost:8080/api/admin/ticket-types
   ```
   
   d. 為場次配置票券：
   ```bash
   curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{"performanceId":"1", "ticketTypeId":"1", "totalQuantity":100, "availableQuantity":100}' \
     http://localhost:8080/api/admin/tickets
   ```

## 擴展與優化建議

1. **性能優化**：
   - 為資料庫查詢添加適當的索引，特別是對於經常篩選的欄位
   - 實現結果分頁功能，尤其是對於票券等可能有大量數據的 API
   - 考慮添加緩存機制，尤其是對於靜態或不常變化的數據

2. **安全性增強**：
   - 實現 IP 限制或請求速率限制，防止暴力破解和 DDoS 攻擊
   - 定期輪換 JWT 密鑰，增加系統安全性
   - 實現更複雜的密碼策略和帳戶鎖定機制

3. **功能擴展**：
   - 添加座位圖功能，讓用戶可以選擇特定座位
   - 實現折扣和促銷代碼功能
   - 添加批量操作功能，如批量創建場次或批量調整票券

## 系統監控與維護

1. **日誌監控**：
   - 日誌文件位於 `/Users/alanp/digital-concert-hall/backend/logs/` 目錄
   - 定期檢查錯誤日誌，關注異常和警告訊息
   - 查看认證和授權相關的日誌，了解可能的安全問題

2. **數據備份**：
   - 在生產環境中，定期備份數據庫
   - 若使用 H2 持久化模式，備份 db 文件夾

3. **系統健康檢查**：
   - 使用 `/api/health-check` 端點監控系統狀態
   - 定期運行 `run-system-test.sh` 腳本以確保關鍵功能正常運作

## 前後端整合建議

1. **API 文檔**：
   - 建議使用 Swagger 或 OpenAPI 生成完整的 API 文檔
   - 將 API 規範文檔共享給前端開發人員

2. **統一的錯誤處理**：
   - 確保前端能夠正確解析後端返回的錯誤訊息
   - 協商統一的錯誤代碼和訊息格式

3. **認證流程**：
   - 前端需正確處理 JWT 令牌的存儲和刷新
   - 實現登出時清除本地存儲的令牌

4. **資料驗證**：
   - 前後端都應實現數據驗證，確保數據的完整性和安全性
   - 統一日期時間格式，避免時區問題
