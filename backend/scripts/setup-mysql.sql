-- Digital Concert Hall MySQL 資料庫設定腳本

-- 建立資料庫
CREATE DATABASE IF NOT EXISTS digitalconcerthall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS digitalconcerthall_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS digitalconcerthall_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 建立使用者
CREATE USER IF NOT EXISTS 'concertuser'@'localhost' IDENTIFIED BY 'concertpass';

-- 授予權限
GRANT ALL PRIVILEGES ON digitalconcerthall.* TO 'concertuser'@'localhost';
GRANT ALL PRIVILEGES ON digitalconcerthall_dev.* TO 'concertuser'@'localhost';
GRANT ALL PRIVILEGES ON digitalconcerthall_test.* TO 'concertuser'@'localhost';

-- 重新載入權限
FLUSH PRIVILEGES;

-- 顯示建立的資料庫
SHOW DATABASES LIKE 'digitalconcerthall%'; 