#!/bin/bash

# =============================================================================
# 數位音樂廳後端服務啟動腳本 - 帶完整日誌記錄
# 功能：啟動服務並將所有輸出記錄到以啟動時間命名的日誌檔案
# 用法：./start-with-logging.sh [profile]
# 範例：./start-with-logging.sh dev
# =============================================================================

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 獲取腳本所在目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 生成時間戳（用於檔名）
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
DATE_FOR_DISPLAY=$(date '+%Y-%m-%d %H:%M:%S')

# 設定日誌目錄
LOG_DIR="$PROJECT_DIR/logs/startup"
mkdir -p "$LOG_DIR"

# 設定日誌檔名
LOG_FILE="$LOG_DIR/backend_startup_${TIMESTAMP}.log"
PID_FILE="$PROJECT_DIR/backend.pid"

# 取得Profile參數（預設為dev）
PROFILE=${1:-dev}

# 輸出啟動資訊
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}數位音樂廳後端服務啟動${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo -e "啟動時間: ${DATE_FOR_DISPLAY}"
echo -e "Profile: ${YELLOW}${PROFILE}${NC}"
echo -e "專案目錄: ${PROJECT_DIR}"
echo -e "日誌檔案: ${LOG_FILE}"
echo -e "${BLUE}==============================================================================${NC}"

# 檢查是否已有服務在運行
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo -e "${YELLOW}警告: 發現正在運行的服務 (PID: $OLD_PID)${NC}"
        echo -e "是否要停止現有服務？ (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}正在停止現有服務...${NC}"
            kill "$OLD_PID"
            sleep 3
            if kill -0 "$OLD_PID" 2>/dev/null; then
                echo -e "${RED}強制停止服務...${NC}"
                kill -9 "$OLD_PID"
            fi
            rm -f "$PID_FILE"
            echo -e "${GREEN}現有服務已停止${NC}"
        else
            echo -e "${RED}取消啟動${NC}"
            exit 1
        fi
    else
        # PID檔案存在但程序不在運行，清理PID檔案
        rm -f "$PID_FILE"
    fi
fi

# 切換到專案目錄
cd "$PROJECT_DIR" || {
    echo -e "${RED}錯誤: 無法切換到專案目錄 $PROJECT_DIR${NC}"
    exit 1
}

# 檢查Maven包裝器是否存在
if [ ! -f "./mvnw" ]; then
    echo -e "${RED}錯誤: 找不到Maven包裝器 (mvnw)${NC}"
    exit 1
fi

# 確保Maven包裝器可執行
chmod +x ./mvnw

# 創建日誌檔案並寫入啟動資訊
cat > "$LOG_FILE" << EOF
================================================================================
數位音樂廳後端服務啟動日誌
================================================================================
啟動時間: $DATE_FOR_DISPLAY
Profile: $PROFILE
Java版本: $(java -version 2>&1 | head -n 1)
Maven版本: $(./mvnw -version 2>&1 | head -n 1)
工作目錄: $PROJECT_DIR
日誌檔案: $LOG_FILE
PID檔案: $PID_FILE
================================================================================

EOF

echo -e "${BLUE}正在啟動服務...${NC}"
echo "日誌將記錄到: $LOG_FILE"

# 定義清理函數
cleanup() {
    echo -e "\n${YELLOW}接收到停止信號，正在關閉服務...${NC}"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${YELLOW}正在停止服務 (PID: $PID)...${NC}"
            kill "$PID"
            
            # 等待程序正常關閉
            for i in {1..30}; do
                if ! kill -0 "$PID" 2>/dev/null; then
                    break
                fi
                sleep 1
            done
            
            # 如果程序仍在運行，強制關閉
            if kill -0 "$PID" 2>/dev/null; then
                echo -e "${RED}強制停止服務...${NC}"
                kill -9 "$PID"
            fi
        fi
        rm -f "$PID_FILE"
    fi
    
    # 在日誌檔案中記錄停止時間
    echo "" >> "$LOG_FILE"
    echo "=================================================================================" >> "$LOG_FILE"
    echo "服務停止時間: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
    echo "=================================================================================" >> "$LOG_FILE"
    
    echo -e "${GREEN}服務已停止${NC}"
    exit 0
}

# 註冊信號處理
trap cleanup SIGINT SIGTERM

# 啟動服務並將輸出同時顯示在終端機和記錄到日誌檔案
{
    echo "開始啟動Spring Boot應用程式..."
    echo "執行命令: ./mvnw spring-boot:run -Dspring-boot.run.profiles=$PROFILE"
    echo ""
    
    # 使用Maven啟動Spring Boot，並捕獲PID
    ./mvnw spring-boot:run -Dspring-boot.run.profiles="$PROFILE" &
    
    # 記錄PID
    APP_PID=$!
    echo $APP_PID > "$PID_FILE"
    
    echo "應用程式已啟動，PID: $APP_PID"
    echo ""
    
    # 等待子程序結束
    wait $APP_PID
    
} 2>&1 | tee -a "$LOG_FILE"

# 清理PID檔案
rm -f "$PID_FILE"

echo -e "${BLUE}服務已結束${NC}"
