#!/bin/bash

# =============================================================================
# 數位音樂廳日誌系統演示腳本
# 展示完整的日誌記錄功能
# =============================================================================

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}數位音樂廳後端日誌系統演示${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

# 檢查是否在正確的目錄
if [ ! -f "pom.xml" ]; then
    echo -e "${RED}錯誤: 請在 backend 專案根目錄中執行此腳本${NC}"
    exit 1
fi

# 設置權限
echo -e "${CYAN}1. 設置腳本權限...${NC}"
chmod +x ./scripts/*.sh ./set-permissions.sh
echo -e "${GREEN}   ✓ 權限設置完成${NC}"
echo ""

# 創建必要的目錄
echo -e "${CYAN}2. 創建日誌目錄結構...${NC}"
mkdir -p logs/startup
mkdir -p logs/archived
echo -e "${GREEN}   ✓ 目錄創建完成${NC}"
echo ""

# 顯示目錄結構
echo -e "${CYAN}3. 日誌目錄結構:${NC}"
tree logs/ 2>/dev/null || {
    echo "   logs/"
    echo "   ├── startup/"
    echo "   └── archived/"
}
echo ""

# 顯示可用的腳本
echo -e "${CYAN}4. 可用的日誌管理腳本:${NC}"
echo -e "${YELLOW}   啟動服務:${NC}"
echo "   ./scripts/start-with-logging.sh [profile]"
echo ""
echo -e "${YELLOW}   停止服務:${NC}"
echo "   ./scripts/stop-service.sh"
echo ""
echo -e "${YELLOW}   日誌管理:${NC}"
echo "   ./scripts/log-manager.sh [命令]"
echo ""

# 顯示log-manager命令
echo -e "${CYAN}5. 日誌管理工具命令:${NC}"
echo -e "${YELLOW}   基本命令:${NC}"
echo "   list        - 列出所有日誌檔案"
echo "   latest      - 查看最新啟動日誌"
echo "   tail        - 即時監控日誌"
echo "   view [檔名] - 查看指定日誌檔案"
echo ""
echo -e "${YELLOW}   搜尋和分析:${NC}"
echo "   search [關鍵字] - 搜尋日誌內容"
echo "   errors             - 查看錯誤日誌"
echo "   status             - 顯示日誌統計"
echo ""
echo -e "${YELLOW}   維護命令:${NC}"
echo "   clean [天數]   - 清理舊日誌"
echo "   archive [天數] - 封存舊日誌"
echo ""

# 示範基本用法
echo -e "${CYAN}6. 使用示範:${NC}"
echo ""
echo -e "${YELLOW}   啟動服務（開發模式）:${NC}"
echo "   ./scripts/start-with-logging.sh dev"
echo ""
echo -e "${YELLOW}   查看最新日誌:${NC}"
echo "   ./scripts/log-manager.sh latest"
echo ""
echo -e "${YELLOW}   即時監控:${NC}"
echo "   ./scripts/log-manager.sh tail"
echo ""
echo -e "${YELLOW}   搜尋錯誤:${NC}"
echo "   ./scripts/log-manager.sh search \"ERROR\""
echo ""
echo -e "${YELLOW}   停止服務:${NC}"
echo "   ./scripts/stop-service.sh"
echo ""

# 檢查Java和Maven
echo -e "${CYAN}7. 環境檢查:${NC}"
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo -e "${GREEN}   ✓ Java: $JAVA_VERSION${NC}"
else
    echo -e "${RED}   ✗ Java 未安裝${NC}"
fi

if [ -f "./mvnw" ]; then
    echo -e "${GREEN}   ✓ Maven Wrapper 可用${NC}"
else
    echo -e "${RED}   ✗ Maven Wrapper 不存在${NC}"
fi
echo ""

# 顯示日誌特性
echo -e "${CYAN}8. 日誌系統特性:${NC}"
echo -e "${GREEN}   ✓ 啟動時間自動命名的日誌檔案${NC}"
echo -e "${GREEN}   ✓ 系統資源自動監控 (每5分鐘)${NC}"
echo -e "${GREEN}   ✓ HTTP請求追蹤 (包含追蹤ID)${NC}"
echo -e "${GREEN}   ✓ 分類日誌記錄 (API、安全、效能等)${NC}"
echo -e "${GREEN}   ✓ 自動日誌輪轉和壓縮${NC}"
echo -e "${GREEN}   ✓ 詳細的應用程式生命週期記錄${NC}"
echo -e "${GREEN}   ✓ 完整的日誌管理工具${NC}"
echo ""

# 互動式選項
echo -e "${CYAN}9. 接下來要做什麼?${NC}"
echo "   1) 啟動服務並查看日誌"
echo "   2) 只查看現有日誌"
echo "   3) 查看日誌管理工具幫助"
echo "   4) 退出"
echo ""
echo -n "請選擇 (1-4): "
read -r choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}正在啟動開發環境...${NC}"
        echo "執行: ./scripts/start-with-logging.sh dev"
        echo ""
        echo -e "${CYAN}提示: 啟動後可以在另一個終端機中運行以下命令監控日誌:${NC}"
        echo "./scripts/log-manager.sh tail"
        echo ""
        echo -e "${YELLOW}按 Enter 繼續或 Ctrl+C 取消...${NC}"
        read -r
        ./scripts/start-with-logging.sh dev
        ;;
    2)
        echo ""
        echo -e "${YELLOW}顯示現有日誌檔案...${NC}"
        ./scripts/log-manager.sh list
        ;;
    3)
        echo ""
        echo -e "${YELLOW}顯示日誌管理工具完整幫助...${NC}"
        ./scripts/log-manager.sh help
        ;;
    4)
        echo ""
        echo -e "${GREEN}感謝使用數位音樂廳日誌系統！${NC}"
        ;;
    *)
        echo ""
        echo -e "${YELLOW}無效選擇，顯示幫助資訊...${NC}"
        ./scripts/log-manager.sh help
        ;;
esac

echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${GREEN}演示完成！${NC}"
echo -e "${CYAN}更多資訊請參考: LOGGING_SYSTEM_README.md${NC}"
echo -e "${BLUE}================================================================================${NC}"
