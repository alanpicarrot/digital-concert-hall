#!/bin/bash

# Digital Concert Hall - MySQL 資料庫設定腳本

echo "🎵 Digital Concert Hall - MySQL 資料庫設定"
echo "==========================================="

# 檢查 MySQL 是否已安裝
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL 未安裝。請先安裝 MySQL："
    echo "   macOS: brew install mysql"
    echo "   Ubuntu: sudo apt-get install mysql-server"
    echo "   CentOS: sudo yum install mysql-server"
    exit 1
fi

# 檢查 MySQL 服務是否正在運行
if ! pgrep -x "mysqld" > /dev/null; then
    echo "🔄 啟動 MySQL 服務..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start mysql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start mysql
    fi
    sleep 3
fi

echo "📦 設定 MySQL 資料庫..."

# 執行 SQL 腳本
mysql -u root -p << EOF
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
EOF

if [ $? -eq 0 ]; then
    echo "✅ MySQL 資料庫設定完成！"
    echo ""
    echo "資料庫資訊："
    echo "  - 生產環境: digitalconcerthall"
    echo "  - 開發環境: digitalconcerthall_dev"
    echo "  - 測試環境: digitalconcerthall_test"
    echo "  - 使用者名稱: concertuser"
    echo "  - 密碼: concertpass"
    echo ""
    echo "🚀 現在您可以啟動應用程式了："
    echo "   cd backend && mvn spring-boot:run"
else
    echo "❌ 資料庫設定失敗，請檢查 MySQL 連線設定"
    exit 1
fi 