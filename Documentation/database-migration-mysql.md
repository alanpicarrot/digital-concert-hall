# 數位音樂廳 - MySQL 資料庫遷移指南

## 概述

本專案已從 H2 內存資料庫遷移至 MySQL 關聯式資料庫，以提供更穩定和生產就緒的資料存儲解決方案。

## 變更摘要

### 1. 移除的組件

- H2 資料庫依賴
- H2 控制台配置
- 內存資料庫配置

### 2. 新增的組件

- MySQL 8.0+ 支援
- 連線池配置 (HikariCP)
- 多環境資料庫配置
- 自動化設定腳本

## 安裝和設定

### 前置需求

1. **安裝 MySQL**

   ```bash
   # macOS
   brew install mysql

   # Ubuntu/Debian
   sudo apt-get install mysql-server

   # CentOS/RHEL
   sudo yum install mysql-server
   ```

2. **啟動 MySQL 服務**

   ```bash
   # macOS
   brew services start mysql

   # Linux
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

### 快速設定

執行自動化設定腳本：

```bash
./setup-mysql.sh
```

### 手動設定

如果您偏好手動設定，請按照以下步驟：

1. **登入 MySQL**

   ```bash
   mysql -u root -p
   ```

2. **執行設定 SQL**

   ```sql
   -- 建立資料庫
   CREATE DATABASE digitalconcerthall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE digitalconcerthall_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE digitalconcerthall_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- 建立使用者
   CREATE USER 'concertuser'@'localhost' IDENTIFIED BY 'concertpass';

   -- 授予權限
   GRANT ALL PRIVILEGES ON digitalconcerthall.* TO 'concertuser'@'localhost';
   GRANT ALL PRIVILEGES ON digitalconcerthall_dev.* TO 'concertuser'@'localhost';
   GRANT ALL PRIVILEGES ON digitalconcerthall_test.* TO 'concertuser'@'localhost';

   FLUSH PRIVILEGES;
   ```

## 環境配置

### 開發環境 (dev)

- 資料庫：`digitalconcerthall_dev`
- DDL 模式：`update` (保留現有資料)
- SQL 顯示：啟用

### 生產環境 (prod)

- 資料庫：`digitalconcerthall`
- DDL 模式：`update` (保留現有資料)
- SQL 顯示：啟用 (建議生產環境關閉)

### 測試環境 (test)

- 資料庫：`digitalconcerthall_test`
- DDL 模式：`create-drop` (每次測試重建)
- SQL 顯示：關閉

## 連線資訊

| 環境 | 資料庫名稱              | 使用者      | 密碼        | 連接埠 |
| ---- | ----------------------- | ----------- | ----------- | ------ |
| 開發 | digitalconcerthall_dev  | concertuser | concertpass | 3306   |
| 生產 | digitalconcerthall      | concertuser | concertpass | 3306   |
| 測試 | digitalconcerthall_test | concertuser | concertpass | 3306   |

## 啟動應用程式

1. **確保 MySQL 服務運行中**

   ```bash
   # 檢查 MySQL 狀態
   brew services list | grep mysql  # macOS
   sudo systemctl status mysql      # Linux
   ```

2. **啟動後端應用程式**

   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **指定特定環境**

   ```bash
   # 開發環境
   mvn spring-boot:run -Dspring.profiles.active=dev

   # 測試環境
   mvn spring-boot:run -Dspring.profiles.active=test
   ```

## 資料庫管理工具

推薦使用以下工具來管理 MySQL 資料庫：

1. **MySQL Workbench** (官方 GUI 工具)
2. **phpMyAdmin** (網頁介面)
3. **DBeaver** (通用資料庫工具)
4. **命令列工具**
   ```bash
   mysql -u concertuser -p digitalconcerthall_dev
   ```

## 疑難排解

### 常見問題

1. **連線被拒絕**

   - 確認 MySQL 服務正在運行
   - 檢查防火牆設定
   - 驗證使用者權限

2. **字符編碼問題**

   - 確認資料庫使用 `utf8mb4` 字符集
   - 檢查連線 URL 中的 `serverTimezone` 參數

3. **權限錯誤**
   - 重新執行權限授予 SQL
   - 確認使用者密碼正確

### 重置資料庫

如需重置資料庫：

```sql
DROP DATABASE digitalconcerthall_dev;
CREATE DATABASE digitalconcerthall_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 效能優化

### 連線池設定

應用程式已配置 HikariCP 連線池：

- 最大連線數：20
- 最小閒置連線：5
- 連線超時：30 秒
- 閒置超時：10 分鐘
- 連線最大生命週期：30 分鐘

### 監控建議

1. 監控連線池使用率
2. 追蹤慢查詢
3. 定期備份資料庫
4. 監控磁碟空間使用

## 備份和還原

### 備份

```bash
mysqldump -u concertuser -p digitalconcerthall > backup.sql
```

### 還原

```bash
mysql -u concertuser -p digitalconcerthall < backup.sql
```

## 安全考量

1. **生產環境密碼**：請在生產環境中使用強密碼
2. **網路安全**：限制 MySQL 的網路存取
3. **定期更新**：保持 MySQL 版本更新
4. **備份策略**：建立定期備份機制

## 支援

如有問題，請檢查：

1. MySQL 錯誤日誌
2. 應用程式日誌
3. 連線設定
4. 使用者權限
