#!/bin/bash

# =============================================================================
# 數位音樂廳後端服務停止腳本
# 功能：安全地停止後端服務並清理相關檔案
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

# 設定PID檔案路徑
PID_FILE="$PROJECT_DIR/backend.pid"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${RED}數位音樂廳後端服務停止${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# 檢查PID檔案是否存在
if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}找不到PID檔案，可能服務未在運行${NC}"
    
    # 嘗試查找Java進程
    JAVA_PIDS=$(pgrep -f "digital-concert-hall")
    if [ -n "$JAVA_PIDS" ]; then
        echo -e "${YELLOW}發現相關Java進程:${NC}"
        ps -f -p $JAVA_PIDS
        echo -e "${YELLOW}是否要停止這些進程？ (y/N): ${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            for pid in $JAVA_PIDS; do
                echo -e "${YELLOW}停止進程 $pid...${NC}"
                kill "$pid"
            done
            sleep 3
            # 檢查是否還有進程在運行
            REMAINING_PIDS=$(pgrep -f "digital-concert-hall")
            if [ -n "$REMAINING_PIDS" ]; then
                echo -e "${RED}強制停止剩餘進程...${NC}"
                for pid in $REMAINING_PIDS; do
                    kill -9 "$pid"
                done
            fi
            echo -e "${GREEN}所有相關進程已停止${NC}"
        fi
    else
        echo -e "${GREEN}沒有找到運行中的服務${NC}"
    fi
    exit 0
fi

# 讀取PID
PID=$(cat "$PID_FILE")

# 檢查進程是否存在
if ! kill -0 "$PID" 2>/dev/null; then
    echo -e "${YELLOW}進程 $PID 不存在，清理PID檔案${NC}"
    rm -f "$PID_FILE"
    echo -e "${GREEN}已清理${NC}"
    exit 0
fi

echo -e "找到運行中的服務 (PID: ${YELLOW}$PID${NC})"

# 顯示進程資訊
echo -e "${BLUE}進程資訊:${NC}"
ps -f -p "$PID"

echo ""
echo -e "${YELLOW}正在停止服務...${NC}"

# 發送TERM信號
kill "$PID"

# 等待進程結束（最多等30秒）
echo -e "等待進程正常結束..."
for i in {1..30}; do
    if ! kill -0 "$PID" 2>/dev/null; then
        echo -e "${GREEN}服務已正常停止${NC}"
        rm -f "$PID_FILE"
        
        # 記錄停止時間到最新的啟動日誌
        LATEST_LOG=$(ls -t "$PROJECT_DIR/logs/startup/backend_startup_"*.log 2>/dev/null | head -n 1)
        if [ -n "$LATEST_LOG" ]; then
            echo "" >> "$LATEST_LOG"
            echo "=================================================================================" >> "$LATEST_LOG"
            echo "服務停止時間: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LATEST_LOG"
            echo "停止方式: 正常停止 (SIGTERM)" >> "$LATEST_LOG"
            echo "=================================================================================" >> "$LATEST_LOG"
        fi
        
        exit 0
    fi
    echo -n "."
    sleep 1
done

echo ""
echo -e "${YELLOW}進程未在預期時間內停止，使用強制停止...${NC}"

# 強制停止
kill -9 "$PID"

# 再檢查一次
if kill -0 "$PID" 2>/dev/null; then
    echo -e "${RED}無法停止進程 $PID${NC}"
    exit 1
else
    echo -e "${GREEN}服務已強制停止${NC}"
    rm -f "$PID_FILE"
    
    # 記錄停止時間到最新的啟動日誌
    LATEST_LOG=$(ls -t "$PROJECT_DIR/logs/startup/backend_startup_"*.log 2>/dev/null | head -n 1)
    if [ -n "$LATEST_LOG" ]; then
        echo "" >> "$LATEST_LOG"
        echo "=================================================================================" >> "$LATEST_LOG"
        echo "服務停止時間: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LATEST_LOG"
        echo "停止方式: 強制停止 (SIGKILL)" >> "$LATEST_LOG"
        echo "=================================================================================" >> "$LATEST_LOG"
    fi
fi

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}服務停止完成${NC}"
echo -e "${BLUE}==============================================================================${NC}"
