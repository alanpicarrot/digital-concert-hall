# 用戶管理功能

## 功能說明

本功能為數位音樂廳後台系統提供完整的用戶管理功能，包括：

1. 查看用戶列表
2. 創建新用戶
3. 編輯用戶資料
4. 更新用戶角色
5. 重置用戶密碼
6. 刪除用戶

## 後端API

### 1. 獲取所有用戶

```
GET /api/admin/users
```

返回所有用戶的列表，包含用戶基本信息和角色。

### 2. 創建新用戶

```
POST /api/admin/users
```

請求體：
```json
{
  "username": "新用戶名",
  "email": "user@example.com",
  "password": "密碼",
  "firstName": "名",
  "lastName": "姓",
  "roles": ["ROLE_USER", "ROLE_ADMIN"]
}
```

### 3. 更新用戶資料

```
PUT /api/admin/users/{id}
```

請求體：
```json
{
  "email": "newemail@example.com",
  "firstName": "新名字",
  "lastName": "新姓氏"
}
```

### 4. 更新用戶角色

```
PUT /api/admin/users/{id}/roles
```

請求體：
```json
{
  "roles": ["ROLE_USER", "ROLE_ADMIN"]
}
```

### 5. 重置用戶密碼

```
PUT /api/admin/users/{id}/password-reset?newPassword=新密碼
```

### 6. 刪除用戶

```
DELETE /api/admin/users/{id}
```

## 前端頁面

用戶管理頁面位於 `/users` 路徑，提供以下功能：

1. 用戶列表顯示，包括用戶名、郵箱、角色、狀態
2. 搜索功能，可根據用戶名、郵箱搜索
3. 用戶操作按鈕：編輯、重置密碼、刪除
4. 新增用戶按鈕
5. 彈出模態框進行編輯、刪除和重置密碼操作

## 使用說明

### 啟動服務

執行以下命令啟動用戶管理服務：

```bash
./start_user_management.sh
```

這個腳本會:
- 啟動後端 Spring Boot 服務
- 啟動管理前端界面
- 提供日誌記錄在 logs/ 目錄
- 顯示服務進程 ID 和訪問地址

### 停止服務

執行以下命令停止用戶管理服務：

```bash
./stop_user_management.sh
```

這個腳本會:
- 安全地停止後端和前端進程
- 清理可能殘留的進程
- 釋放佔用的端口

### 訪問管理界面

1. 打開瀏覽器，訪問 `http://localhost:3001`
2. 使用管理員賬號登入
3. 在側邊欄中點擊「用戶管理」選項
4. 也可以直接訪問用戶管理頁面：`http://localhost:3001/users`

## 注意事項

1. 刪除用戶是不可逆操作，請謹慎使用
2. 創建新用戶必須提供唯一的用戶名和郵箱地址
3. 重置密碼後，舊密碼將無法使用
4. 用戶角色權限：
   - ROLE_USER: 普通用戶權限
   - ROLE_MODERATOR: 版主權限
   - ROLE_ADMIN: 管理員權限
5. 若遇到端口衝突問題，請確保 8080 和 3001 端口未被佔用

## 日誌和故障排除

- 後端日誌位於: `logs/backend.log`
- 前端日誌位於: `logs/admin.log`
- 如果遇到啟動問題，請檢查這些日誌文件獲取詳細錯誤信息

## 技術實現

1. 後端：Spring Boot + Spring Security + Spring Data JPA
2. 前端：React + Tailwind CSS
3. 資料庫：使用配置的數據庫（H2/PostgreSQL）
