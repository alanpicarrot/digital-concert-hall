#!/bin/bash

# 定義顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== React Router 錯誤修復腳本 =====${NC}"
echo "====================================="

# 確保腳本在正確目錄執行
if [ ! -d "frontend-client" ]; then
    echo -e "${RED}錯誤: 找不到 frontend-client 目錄，請確保您在專案根目錄執行此腳本${NC}"
    exit 1
fi

echo -e "${YELLOW}開始修復 React Router 錯誤...${NC}"

# 進入前端目錄
cd frontend-client

# 檢查 App.js 
echo "檢查 App.js 是否存在..."
if [ ! -f "src/App.js" ]; then
    echo -e "${RED}錯誤: 找不到 src/App.js 文件${NC}"
    exit 1
fi

# 備份 App.js
echo "備份 App.js..."
cp src/App.js src/App.js.bak
echo -e "${GREEN}已創建備份: src/App.js.bak${NC}"

# 修改 App.js 中的 BrowserRouter
echo "修正 App.js 中的 React Router 問題..."
if grep -q "<BrowserRouter basename=\"/\">" src/App.js; then
    echo -e "${GREEN}App.js 已包含修復內容${NC}"
else
    sed -i '' 's/<BrowserRouter>/<BrowserRouter basename="\/">/' src/App.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}成功修改 App.js${NC}"
    else
        echo -e "${RED}修改 App.js 時發生錯誤${NC}"
        exit 1
    fi
fi

# 安裝一致版本的 react-router-dom
echo "安裝一致版本的 react-router-dom..."
npm install react-router-dom@6.16.0 --save
if [ $? -eq 0 ]; then
    echo -e "${GREEN}成功安裝 react-router-dom@6.16.0${NC}"
else
    echo -e "${RED}安裝套件時發生錯誤${NC}"
    exit 1
fi

# 改進錯誤處理
echo "改進錯誤邊界組件..."
if [ -f "src/components/ui/ErrorBoundary.jsx" ]; then
    cp src/components/ui/ErrorBoundary.jsx src/components/ui/ErrorBoundary.jsx.bak
    echo -e "${GREEN}已創建備份: src/components/ui/ErrorBoundary.jsx.bak${NC}"
    
    # 改進錯誤邊界組件中的錯誤處理
    sed -i '' 's/console.error(.ErrorBoundary .........., error, errorInfo);/console.error(\"ErrorBoundary 捕獲到錯誤:\", error);\n    console.error(\"詳細錯誤信息:\", errorInfo);/' src/components/ui/ErrorBoundary.jsx
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}成功修改錯誤邊界組件${NC}"
    else
        echo -e "${RED}修改錯誤邊界組件時發生錯誤${NC}"
    fi
else
    echo -e "${YELLOW}警告: 找不到錯誤邊界組件文件${NC}"
fi

# 回到根目錄
cd ..

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}React Router 錯誤修復完成！${NC}"
echo -e "${GREEN}====================================${NC}"
echo -e "修復內容包括:"
echo -e "1. 在 BrowserRouter 中添加了明確的 basename 屬性"
echo -e "2. 安裝了一致版本的 react-router-dom (6.16.0)"
echo -e "3. 改進了錯誤邊界組件的錯誤處理"
echo -e "${YELLOW}請使用 ./start.sh 重新啟動應用程式以套用修復${NC}"
echo -e "${YELLOW}如需還原修改，可以使用備份文件${NC}"
echo -e "${GREEN}====================================${NC}"

# 使腳本可執行
chmod +x fix-router.sh
