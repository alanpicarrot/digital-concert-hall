#!/bin/bash

# 數位音樂廳系統 - 綜合啟動腳本
# 版本: 3.0.0

# 定義顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== 數位音樂廳系統啟動腳本 =====${NC}"
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
for dir in "backend" "frontend-client" "frontend-admin"; do
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

# 清除 target 目錄以確保乾淨的編譯
echo "清除先前編譯的目標文件..."
$MVN_CMD clean

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

# 初始化測試資料
echo "初始化測試資料..."
curl -X GET http://localhost:8080/api/setup/init 2>/dev/null || echo "後端初始化端點無法訪問，可能已初始化或服務尚未完全啟動"
echo ""
curl -X GET http://localhost:8080/health 2>/dev/null || echo "健康檢查端點無法訪問"
echo ""

# 啟動前台用戶界面
echo -e "${YELLOW}啟動前台用戶界面...${NC}"
cd frontend-client
echo "前台用戶界面目錄: $(pwd)"

# 安裝前端依賴
echo "確保前端依賴已安裝..."
npm install --silent

# 套用 React Router 修復
echo -e "${YELLOW}套用 React Router 修復...${NC}"
echo "檢查 App.js 是否已修復..."
if ! grep -q "basename=\"/\"" src/App.js; then
    echo "修正 App.js 中的 React Router 問題..."
    sed -i '' 's/<BrowserRouter>/<BrowserRouter basename="\/">/' src/App.js
    echo -e "${GREEN}React Router 修復已套用${NC}"
else
    echo -e "${GREEN}React Router 已修復${NC}"
fi

# 啟動前端
echo -e "${GREEN}啟動前端服務...${NC}"

# 檢查端口是否被占用
if lsof -i:3000 > /dev/null; then
    echo -e "${YELLOW}警告: 端口 3000 已被占用，嘗試使用端口 3100${NC}"
    PORT=3100 npm start > ../logs/client.log 2>&1 &
    echo -e "${GREEN}前端已啟動在端口 3100${NC}"
else
    PORT=3000 npm start > ../logs/client.log 2>&1 &
    echo -e "${GREEN}前端已啟動在端口 3000${NC}"
fi
FRONTEND_CLIENT_PID=$!
cd ..

echo -e "${GREEN}前端用戶端已啟動，PID: $FRONTEND_CLIENT_PID${NC}"

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

echo -e "
${YELLOW}==========================================${NC}"
echo -e "${GREEN}  所有服務已啟動！  ${NC}"
echo -e "${YELLOW}==========================================${NC}"
echo -e "${YELLOW}- 後端 API:${NC} http://localhost:8080"
# 根據前端啟動的端口顯示正確的URL
if lsof -i:3100 > /dev/null; then
    echo -e "${YELLOW}- 用戶前台:${NC} http://localhost:3100"
else
    echo -e "${YELLOW}- 用戶前台:${NC} http://localhost:3000"
fi
echo -e "${YELLOW}- 後台管理:${NC} http://localhost:3001"
echo -e "${YELLOW}- 日誌位置:${NC} $(pwd)/logs/"
echo ""
echo "進程ID:"
echo "- 後端 PID: $BACKEND_PID"
echo "- 前台 PID: $FRONTEND_CLIENT_PID"
echo "- 後台管理 PID: $FRONTEND_ADMIN_PID"

# 保存 PID 以便停止服務
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_CLIENT_PID" > .frontend-client.pid
echo "$FRONTEND_ADMIN_PID" > .frontend-admin.pid

echo -e "${YELLOW}
使用說明:
- 運行 ./stop.sh 停止所有服務
- 查看日誌: tail -f logs/backend.log | logs/client.log | logs/admin.log
- 使用 Ctrl+C 停止此腳本（但服務將繼續在後台運行）
${NC}"

# 等待任何按鍵以便查看輸出
read -n 1 -s -r -p "按任意鍵繼續..."
echo ""
