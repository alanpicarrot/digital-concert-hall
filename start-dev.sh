#!/bin/bash
# 數位音樂廳專案 - 啟動腳本
# 版本: 1.0.0
# 授權方式: 755 (chmod 755 start-dev.sh)

# 環境檢查
if ! command -v mvn &> /dev/null; then
    echo "錯誤: Maven 未安裝。請安裝 Maven 後再試。"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "錯誤: Node.js/npm 未安裝。請安裝 Node.js 後再試。"
    exit 1
fi

# 檢查必要的目錄是否存在
for dir in "backend" "frontend-client" "frontend-admin"; do
    if [ ! -d "$dir" ]; then
        echo "錯誤: $dir 目錄不存在。請確保您在正確的項目目錄中運行此腳本。"
        exit 1
    fi
 done

# 啟動後端
echo "啟動後端服務..."
cd backend

# 清除 target 目錄以確保乾淨的編譯
echo "清除先前編譯的目標文件..."
mvn clean

echo "啟動 Spring Boot 應用程式..."
mvn spring-boot:run -Dspring-boot.run.profiles=dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 設定日誌目錄
mkdir -p logs

# 等待後端啟動
echo "等待後端服務啟動..."
sleep 15

# 檢查後端是否成功啟動
if ! kill -0 $BACKEND_PID > /dev/null 2>&1; then
    echo "錯誤: 後端服務啟動失敗。請查看 logs/backend.log 文件以了解詳情。"
    exit 1
fi

echo "後端服務啟動成功！"

# 啟動前台
echo "啟動用戶前台..."
cd frontend-client
npm install --silent
PORT=3000 npm start &
FRONTEND_CLIENT_PID=$!
cd ..

# 啟動後台
echo "啟動管理員後台..."
cd frontend-admin
npm install --silent
PORT=3001 npm start &
FRONTEND_ADMIN_PID=$!
cd ..

echo "
=========================================="
echo "  所有服務已啟動！  "
echo "=========================================="
echo "- 後端 API: http://localhost:8080"
echo "- 用戶前台: http://localhost:3000"
echo "- 管理員後台: http://localhost:3001"
echo "注意: 請查看logs目錄下的日誌文件以了解詳細信息。"

# 保存 PID 以便停止服務
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_CLIENT_PID" > .frontend-client.pid
echo "$FRONTEND_ADMIN_PID" > .frontend-admin.pid

# 顯示使用說明
echo "---"
echo "使用 ./stop-dev.sh 停止所有服務"
echo "或按 Ctrl+C 停止此腳本（但可能需要手動停止其他進程）"
echo "---"

# 保持腳本運行
wait $BACKEND_PID
