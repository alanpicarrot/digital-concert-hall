#!/bin/bash

# 購物車認證問題修復測試腳本
# 此腳本用於測試和應用購物車頁面的認證問題修復

# 顯示彩色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== 數位音樂廳購物車認證問題修復測試 ===${NC}"
echo ""

# 檢查Node.js是否安裝
if ! command -v node &> /dev/null; then
    echo -e "${RED}錯誤: 未找到Node.js，請先安裝Node.js${NC}"
    exit 1
fi

# 步驟1: 運行測試腳本
echo -e "${YELLOW}步驟1: 運行測試腳本${NC}"
echo "執行購物車認證問題修復測試..."
node test-cart-auth-fix.js
TEST_RESULT=$?

if [ $TEST_RESULT -ne 0 ]; then
    echo -e "${RED}測試腳本執行失敗，請檢查錯誤信息${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}測試腳本執行完成${NC}"
echo ""

# 步驟2: 重啟前端應用
echo -e "${YELLOW}步驟2: 重啟前端應用${NC}"
echo "停止當前運行的前端應用..."

# 檢查是否有.frontend-client.pid文件
if [ -f "../.frontend-client.pid" ]; then
    PID=$(cat "../.frontend-client.pid")
    if ps -p $PID > /dev/null; then
        echo "正在停止進程 $PID..."
        kill $PID
        sleep 2
    else
        echo "進程 $PID 已不存在"
    fi
    rm -f "../.frontend-client.pid"
else
    echo "未找到PID文件，嘗試查找並停止npm進程..."
    pkill -f "npm.*start.*frontend-client" || true
    sleep 2
fi

echo "啟動前端應用..."
cd ..
npm run start:client &
echo $! > .frontend-client.pid
cd frontend-client

echo -e "${GREEN}前端應用已重啟${NC}"
echo ""

# 步驟3: 提供測試說明
echo -e "${YELLOW}步驟3: 測試說明${NC}"
echo "修復已應用並重啟前端應用，請按照以下步驟測試購物車認證問題:"
echo "1. 登入系統"
echo "2. 添加商品到購物車"
echo "3. 進入購物車頁面"
echo "4. 點擊「前往結帳」按鈕"
echo "5. 確認是否成功進入結帳頁面而不是顯示「登入已過期」的訊息"
echo "6. 如果成功進入結帳頁面，則修復成功"
echo ""

echo -e "${GREEN}修復測試腳本執行完成${NC}"
echo -e "${YELLOW}前端應用正在運行中，請在瀏覽器中訪問 http://localhost:3000 進行測試${NC}"
