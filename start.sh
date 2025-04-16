#!/bin/bash

# 數位音樂廳系統 - 用戶管理啟動腳本
# 版本: 3.1.0

# 定義顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== 數位音樂廳用戶管理啟動腳本 =====${NC}"
echo "====================================="

# 環境檢查
if ! command -v mvn &> /dev/null && ! command -v ./mvnw &> /dev/null; then
    echo -e "${RED}錯誤: Maven 未安裝且找不到 mvnw 包裝器。${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}錯誤: Node.js/npm 未安裝。請安裝 Node.js 後再試。${NC}"
    exit 1
fi

# 檢查必要的目錄是否存在
for dir in "backend" "frontend-admin" "frontend-client"; do
    if [ ! -d "$dir" ]; then
        echo -e "${RED}錯誤: $dir 目錄不存在。請確保您在正確的項目目錄中運行此腳本。${NC}"
        exit 1
    fi
done

# 設定日誌目錄
mkdir -p logs
echo -e "${GREEN}日誌將保存在 $(pwd)/logs 目錄${NC}"

# 顯示當前目錄
echo "當前工作目錄: $(pwd)"

# 啟動後端
echo -e "${YELLOW}啟動後端服務...${NC}"
cd backend
echo "後端目錄: $(pwd)"

# 判斷使用 mvn 還是 mvnw
MVN_CMD="mvn"
if [ -f "./mvnw" ]; then
    MVN_CMD="./mvnw"
    chmod +x ./mvnw
fi

echo -e "${GREEN}啟動 Spring Boot 應用程式...${NC}"
$MVN_CMD spring-boot:run -Dspring-boot.run.profiles=dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}後端服務已啟動，PID: $BACKEND_PID${NC}"

# 等待後端啟動
echo "等待後端服務初始化 (15秒)..."
sleep 15

# 檢查後端是否成功啟動
if ! kill -0 $BACKEND_PID > /dev/null 2>&1; then
    echo -e "${RED}錯誤: 後端服務啟動失敗。請查看 logs/backend.log 文件以了解詳情。${NC}"
    exit 1
fi

echo -e "${GREEN}後端服務啟動成功！${NC}"

# 健康檢查
echo "執行健康檢查..."
curl -X GET http://localhost:8080/health 2>/dev/null || echo "健康檢查端點無法訪問"
echo ""

# 啟動後台管理界面
echo -e "${YELLOW}啟動後台管理界面...${NC}"
cd frontend-admin
echo "後台管理界面目錄: $(pwd)"

# 安裝後台依賴
echo "確保後台管理依賴已安裝..."
npm install --silent

# 啟動後台
echo -e "${GREEN}啟動後台管理服務...${NC}"
PORT=3001 npm start > ../logs/admin.log 2>&1 &
FRONTEND_ADMIN_PID=$!
cd ..

echo -e "${GREEN}前端管理面板已啟動，PID: $FRONTEND_ADMIN_PID${NC}"

# 啟動前端客戶界面
echo -e "${YELLOW}啟動前端客戶界面...${NC}"
cd frontend-client
echo "前端客戶界面目錄: $(pwd)"

# 安裝前端依賴
echo "確保前端客戶依賴已安裝..."
npm install --silent

# 啟動前端
echo -e "${GREEN}啟動前端客戶服務...${NC}"
PORT=3000 npm start > ../logs/client.log 2>&1 &
FRONTEND_CLIENT_PID=$!
cd ..

echo -e "${GREEN}前端客戶界面已啟動，PID: $FRONTEND_CLIENT_PID${NC}"

echo -e "
${YELLOW}==========================================${NC}"
echo -e "${GREEN}  用戶管理服務已啟動！  ${NC}"
echo -e "${YELLOW}==========================================${NC}"
echo -e "${YELLOW}- 後端 API:${NC} http://localhost:8080"
echo -e "${YELLOW}- 後台管理:${NC} http://localhost:3001"
echo -e "${YELLOW}- 前端客戶:${NC} http://localhost:3000"
echo -e "${YELLOW}- 日誌位置:${NC} $(pwd)/logs/"
echo ""
echo "進程ID:"
echo "- 後端 PID: $BACKEND_PID"
echo "- 後台管理 PID: $FRONTEND_ADMIN_PID"
echo "- 前端客戶 PID: $FRONTEND_CLIENT_PID"

# 保存 PID 以便停止服務
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_ADMIN_PID" > .frontend-admin.pid
echo "$FRONTEND_CLIENT_PID" > .frontend-client.pid

echo -e "${YELLOW}
使用說明:
- 運行 ./stop.sh 停止用戶管理服務
- 訪問 http://localhost:3001 進入管理後台
- 訪問 http://localhost:3000 進入客戶前端界面
- 用戶管理功能位於側邊欄「用戶管理」選項
- 查看日誌: tail -f logs/backend.log | logs/admin.log | logs/client.log
${NC}"

# 等待任何按鍵以便查看輸出
read -n 1 -s -r -p "按任意鍵繼續..."
echo ""