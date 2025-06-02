# 數字音樂廳資料庫設定指南

# Digital Concert Hall Database Setup Guide

## 概述 | Overview

本專案為數字音樂廳系統提供完整的 MySQL 資料庫結構設定。包含所有必要的表格、索引、外鍵約束以及初始數據。

This project provides a complete MySQL database structure setup for the Digital Concert Hall system, including all necessary tables, indexes, foreign key constraints, and initial data.

## 文件說明 | Files Description

### 1. `create_database_schema.sql`

- **用途**: 完整的 MySQL 建表腳本
- **包含**: 12 個核心表格的創建語句、索引、外鍵約束、初始角色數據
- **特點**: 支援 UTF-8 多語言、完整的註釋說明

### 2. `setup-database.sh`

- **用途**: 自動化資料庫設定腳本
- **功能**:
  - 互動式 MySQL 連接設定
  - 現有資料庫備份
  - 自動執行 SQL 腳本
  - 錯誤處理和狀態回報

## 資料庫結構 | Database Structure

### 核心表格 | Core Tables

1. **`roles`** - 系統角色表

   - 儲存用戶權限角色 (USER, MODERATOR, ADMIN)

2. **`users`** - 一般用戶表

   - 用戶基本資訊、認證資料、時間戳

3. **`admin_users`** - 管理員用戶表

   - 管理員專用帳戶資訊

4. **`user_roles`** & **`admin_user_roles`** - 用戶角色關聯表

   - 多對多關聯表，管理用戶權限

5. **`concerts`** - 音樂會表

   - 音樂會基本資訊、狀態、時間

6. **`performances`** - 演出表

   - 具體演出場次、場地、直播資訊

7. **`ticket_types`** - 票券類型表

   - 票券分類、價格、描述

8. **`tickets`** - 票券表

   - 票券庫存、狀態管理

9. **`orders`** - 訂單表

   - 用戶訂單、付款狀態

10. **`order_items`** - 訂單項目表

    - 訂單明細、數量、價格

11. **`user_tickets`** - 用戶票券表
    - 用戶持有的票券、QR 碼、使用狀態

### 關聯關係 | Relationships

```
users (1) ←→ (n) user_roles (n) ←→ (1) roles
admin_users (1) ←→ (n) admin_user_roles (n) ←→ (1) roles
concerts (1) ←→ (n) performances
performances (1) ←→ (n) tickets (n) ←→ (1) ticket_types
users (1) ←→ (n) orders (1) ←→ (n) order_items (n) ←→ (1) tickets
users (1) ←→ (n) user_tickets (n) ←→ (1) order_items
```

## 使用方法 | Usage Instructions

### 方法一：使用自動化腳本 (推薦)

```bash
# 1. 確保腳本有執行權限
chmod +x setup-database.sh

# 2. 執行設定腳本
./setup-database.sh
```

腳本將會引導您：

1. 輸入 MySQL 連接資訊
2. 確認設定
3. 備份現有資料庫（如果存在）
4. 執行建表腳本
5. 顯示設定結果

### 方法二：手動執行 SQL

```bash
# 直接執行SQL腳本
mysql -u [username] -p < create_database_schema.sql
```

### 連接資料庫

設定完成後，您的 Spring Boot 應用程式需要在 `application.properties` 或 `application.yml` 中配置：

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/digital_concert_hall
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 設定
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

## 預設數據 | Default Data

系統會自動插入以下角色：

- `ROLE_USER` - 一般用戶
- `ROLE_MODERATOR` - 版主
- `ROLE_ADMIN` - 管理員

## 安全性考量 | Security Considerations

1. **密碼加密**: 用戶密碼應使用 BCrypt 等安全方式加密
2. **資料庫權限**: 建議為應用程式創建專用的資料庫用戶
3. **備份策略**: 定期備份生產環境資料庫
4. **索引優化**: 已預設建立常用查詢的索引

## 維護與更新 | Maintenance & Updates

### 添加新表格

1. 修改 `create_database_schema.sql`
2. 更新對應的 Java 實體類
3. 重新執行設定腳本

### 修改現有表格

1. 創建遷移腳本 (migration script)
2. 備份現有數據
3. 執行結構變更
4. 驗證數據完整性

## 故障排除 | Troubleshooting

### 常見問題

**1. 連接錯誤**

```
Error: Cannot connect to MySQL server
```

- 檢查 MySQL 服務是否運行
- 確認用戶名和密碼正確
- 檢查防火牆設定

**2. 權限問題**

```
Access denied for user
```

- 確認用戶有 CREATE DATABASE 權限
- 檢查 MySQL 用戶權限設定

**3. 字符集問題**

```
Incorrect string value
```

- 確保 MySQL 支援 utf8mb4
- 檢查客戶端連接字符集

### 日誌檢查

查看 MySQL 錯誤日誌：

```bash
# 查看MySQL錯誤日誌
tail -f /var/log/mysql/error.log

# 或查看系統日誌
journalctl -u mysql
```

## 效能優化 | Performance Optimization

### 索引策略

- 已針對常用查詢字段創建索引
- 定期使用 `EXPLAIN` 分析查詢計劃
- 監控慢查詢日誌

### 建議配置

```sql
-- 針對高併發場景的MySQL配置建議
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 268435456; -- 256MB
```

## 支援與聯繫 | Support & Contact

如遇到問題，請檢查：

1. MySQL 版本兼容性 (建議 8.0+)
2. Java 版本兼容性 (建議 17+)
3. Spring Boot 版本兼容性

---

**注意**: 請在生產環境部署前，先在測試環境完整驗證所有功能。
