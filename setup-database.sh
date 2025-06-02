#!/bin/bash

# 數字音樂廳資料庫設定腳本
# Digital Concert Hall Database Setup Script

echo "=========================================="
echo "數字音樂廳資料庫設定腳本"
echo "Digital Concert Hall Database Setup"
echo "=========================================="

# 設定變數
DB_NAME="digital_concert_hall"
SQL_FILE="create_database_schema.sql"

# 檢查SQL檔案是否存在
if [ ! -f "$SQL_FILE" ]; then
    echo "錯誤：找不到SQL檔案 $SQL_FILE"
    echo "Error: SQL file $SQL_FILE not found"
    exit 1
fi

echo "請輸入MySQL連接資訊："
echo "Please enter MySQL connection information:"

# 獲取MySQL連接資訊
read -p "MySQL主機 (預設: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "MySQL埠號 (預設: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "MySQL用戶名 (預設: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "MySQL密碼: " DB_PASSWORD
echo ""

# 確認資料庫設定
echo ""
echo "資料庫連接資訊："
echo "Database connection information:"
echo "主機/Host: $DB_HOST"
echo "埠號/Port: $DB_PORT"
echo "用戶名/Username: $DB_USER"
echo "資料庫名稱/Database: $DB_NAME"
echo ""

read -p "確認要執行資料庫設定嗎？(y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    echo "Operation cancelled"
    exit 0
fi

# 測試MySQL連接
echo "正在測試MySQL連接..."
echo "Testing MySQL connection..."

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "錯誤：無法連接到MySQL伺服器"
    echo "Error: Cannot connect to MySQL server"
    echo "請檢查連接資訊是否正確"
    echo "Please check your connection information"
    exit 1
fi

echo "MySQL連接成功！"
echo "MySQL connection successful!"

# 備份現有資料庫（如果存在）
echo ""
echo "檢查是否存在現有資料庫..."
echo "Checking for existing database..."

DB_EXISTS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep "$DB_NAME")

if [ ! -z "$DB_EXISTS" ]; then
    echo "警告：資料庫 $DB_NAME 已存在！"
    echo "Warning: Database $DB_NAME already exists!"
    
    read -p "是否要備份現有資料庫？(Y/n): " BACKUP_CONFIRM
    if [[ ! $BACKUP_CONFIRM =~ ^[Nn]$ ]]; then
        BACKUP_FILE="${DB_NAME}_backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "正在備份到 $BACKUP_FILE..."
        echo "Backing up to $BACKUP_FILE..."
        
        mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            echo "備份完成：$BACKUP_FILE"
            echo "Backup completed: $BACKUP_FILE"
        else
            echo "備份失敗！"
            echo "Backup failed!"
            exit 1
        fi
    fi
    
    read -p "確認要刪除並重新創建資料庫嗎？(y/N): " DROP_CONFIRM
    if [[ ! $DROP_CONFIRM =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        echo "Operation cancelled"
        exit 0
    fi
fi

# 執行SQL腳本
echo ""
echo "正在執行資料庫設定腳本..."
echo "Executing database setup script..."

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 資料庫設定完成！"
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "資料庫資訊："
    echo "Database information:"
    echo "  - 資料庫名稱/Database: $DB_NAME"
    echo "  - 字符集/Charset: utf8mb4"
    echo "  - 排序規則/Collation: utf8mb4_unicode_ci"
    echo ""
    echo "創建的表格："
    echo "Created tables:"
    echo "  1. roles (角色表)"
    echo "  2. users (用戶表)"
    echo "  3. admin_users (管理員用戶表)"
    echo "  4. user_roles (用戶角色關聯表)"
    echo "  5. admin_user_roles (管理員用戶角色關聯表)"
    echo "  6. concerts (音樂會表)"
    echo "  7. performances (演出表)"
    echo "  8. ticket_types (票券類型表)"
    echo "  9. tickets (票券表)"
    echo "  10. orders (訂單表)"
    echo "  11. order_items (訂單項目表)"
    echo "  12. user_tickets (用戶票券表)"
    echo ""
    echo "已插入預設角色數據："
    echo "Default roles inserted:"
    echo "  - ROLE_USER"
    echo "  - ROLE_MODERATOR"
    echo "  - ROLE_ADMIN"
    echo ""
    echo "您現在可以啟動後端應用程式了！"
    echo "You can now start your backend application!"
else
    echo ""
    echo "❌ 資料庫設定失敗！"
    echo "❌ Database setup failed!"
    echo "請檢查錯誤訊息並重試"
    echo "Please check the error messages and try again"
    exit 1
fi 