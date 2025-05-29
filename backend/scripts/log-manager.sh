#!/bin/bash

# =============================================================================
# 日誌查看和管理腳本
# 功能：查看、搜尋、清理日誌檔案
# 用法：./log-manager.sh [命令] [參數]
# =============================================================================

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 獲取腳本所在目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
STARTUP_LOG_DIR="$LOG_DIR/startup"

# 顯示使用說明
show_usage() {
    echo -e "${BLUE}==============================================================================${NC}"
    echo -e "${GREEN}數位音樂廳日誌管理工具${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
    echo -e "${YELLOW}用法:${NC} $0 [命令] [參數]"
    echo ""
    echo -e "${CYAN}可用命令:${NC}"
    echo -e "  ${GREEN}list${NC}              - 列出所有日誌檔案"
    echo -e "  ${GREEN}latest${NC}            - 查看最新的啟動日誌"
    echo -e "  ${GREEN}tail${NC} [檔名]       - 即時監控日誌檔案"
    echo -e "  ${GREEN}view${NC} [檔名]       - 查看完整日誌檔案"
    echo -e "  ${GREEN}search${NC} [關鍵字]   - 在所有日誌中搜尋關鍵字"
    echo -e "  ${GREEN}errors${NC}            - 查看所有錯誤日誌"
    echo -e "  ${GREEN}clean${NC}             - 清理舊日誌檔案"
    echo -e "  ${GREEN}status${NC}            - 顯示日誌統計資訊"
    echo -e "  ${GREEN}archive${NC}           - 封存舊日誌檔案"
    echo ""
    echo -e "${CYAN}範例:${NC}"
    echo -e "  $0 list"
    echo -e "  $0 latest"
    echo -e "  $0 tail backend_startup_20241201_143022.log"
    echo -e "  $0 search \"ERROR\""
    echo -e "  $0 clean 7  # 清理7天前的日誌"
}

# 列出所有日誌檔案
list_logs() {
    echo -e "${BLUE}==============================================================================${NC}"
    echo -e "${GREEN}日誌檔案列表${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
    
    if [ -d "$STARTUP_LOG_DIR" ]; then
        echo -e "${CYAN}啟動日誌:${NC}"
        ls -lah "$STARTUP_LOG_DIR" | grep -E "\.log$" | while read -r line; do
            echo -e "  ${YELLOW}$line${NC}"
        done
        echo ""
    fi
    
    if [ -d "$LOG_DIR" ]; then
        echo -e "${CYAN}應用程式日誌:${NC}"
        ls -lah "$LOG_DIR" | grep -E "\.log$" | while read -r line; do
            echo -e "  ${YELLOW}$line${NC}"
        done
        echo ""
    fi
    
    if [ -d "$LOG_DIR/archived" ]; then
        echo -e "${CYAN}封存日誌:${NC}"
        ls -lah "$LOG_DIR/archived" | grep -E "\.(log|gz)$" | while read -r line; do
            echo -e "  ${YELLOW}$line${NC}"
        done
    fi
}

# 查看最新的啟動日誌
view_latest() {
    LATEST_LOG=$(ls -t "$STARTUP_LOG_DIR"/backend_startup_*.log 2>/dev/null | head -n 1)
    
    if [ -z "$LATEST_LOG" ]; then
        echo -e "${RED}找不到啟動日誌檔案${NC}"
        return 1
    fi
    
    echo -e "${GREEN}最新啟動日誌:${NC} $(basename "$LATEST_LOG")"
    echo -e "${BLUE}==============================================================================${NC}"
    
    if command -v less >/dev/null 2>&1; then
        less "+G" "$LATEST_LOG"
    else
        tail -n 100 "$LATEST_LOG"
    fi
}

# 即時監控日誌
tail_log() {
    local log_file="$1"
    
    if [ -z "$log_file" ]; then
        # 如果沒有指定檔案，監控最新的啟動日誌
        LATEST_LOG=$(ls -t "$STARTUP_LOG_DIR"/backend_startup_*.log 2>/dev/null | head -n 1)
        if [ -z "$LATEST_LOG" ]; then
            echo -e "${RED}找不到日誌檔案${NC}"
            return 1
        fi
        log_file="$LATEST_LOG"
    else
        # 檢查是否為完整路徑
        if [ ! -f "$log_file" ]; then
            # 嘗試在startup目錄中查找
            if [ -f "$STARTUP_LOG_DIR/$log_file" ]; then
                log_file="$STARTUP_LOG_DIR/$log_file"
            elif [ -f "$LOG_DIR/$log_file" ]; then
                log_file="$LOG_DIR/$log_file"
            else
                echo -e "${RED}找不到日誌檔案: $log_file${NC}"
                return 1
            fi
        fi
    fi
    
    echo -e "${GREEN}即時監控日誌:${NC} $(basename "$log_file")"
    echo -e "${YELLOW}按 Ctrl+C 停止監控${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
    
    tail -f "$log_file"
}

# 查看完整日誌檔案
view_log() {
    local log_file="$1"
    
    if [ -z "$log_file" ]; then
        echo -e "${RED}請指定日誌檔名${NC}"
        return 1
    fi
    
    # 檢查檔案位置
    if [ ! -f "$log_file" ]; then
        if [ -f "$STARTUP_LOG_DIR/$log_file" ]; then
            log_file="$STARTUP_LOG_DIR/$log_file"
        elif [ -f "$LOG_DIR/$log_file" ]; then
            log_file="$LOG_DIR/$log_file"
        else
            echo -e "${RED}找不到日誌檔案: $log_file${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}查看日誌:${NC} $(basename "$log_file")"
    echo -e "${BLUE}==============================================================================${NC}"
    
    if command -v less >/dev/null 2>&1; then
        less "$log_file"
    else
        cat "$log_file"
    fi
}

# 搜尋日誌
search_logs() {
    local keyword="$1"
    
    if [ -z "$keyword" ]; then
        echo -e "${RED}請指定搜尋關鍵字${NC}"
        return 1
    fi
    
    echo -e "${GREEN}搜尋關鍵字:${NC} $keyword"
    echo -e "${BLUE}==============================================================================${NC}"
    
    # 搜尋啟動日誌
    if [ -d "$STARTUP_LOG_DIR" ]; then
        echo -e "${CYAN}啟動日誌中的結果:${NC}"
        grep -n -i --color=always "$keyword" "$STARTUP_LOG_DIR"/*.log 2>/dev/null || echo "  沒有找到結果"
        echo ""
    fi
    
    # 搜尋應用程式日誌
    if [ -f "$LOG_DIR/backend.log" ]; then
        echo -e "${CYAN}應用程式日誌中的結果:${NC}"
        grep -n -i --color=always "$keyword" "$LOG_DIR"/*.log 2>/dev/null || echo "  沒有找到結果"
    fi
}

# 查看錯誤日誌
view_errors() {
    echo -e "${GREEN}錯誤日誌摘要${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
    
    # 從所有日誌中提取ERROR級別的訊息
    find "$LOG_DIR" -name "*.log" -type f -exec grep -l "ERROR\|Exception\|Error" {} \; | while read -r log_file; do
        echo -e "${YELLOW}檔案: $(basename "$log_file")${NC}"
        grep -n --color=always "ERROR\|Exception\|Error" "$log_file" | tail -10
        echo ""
    done
}

# 清理舊日誌
clean_logs() {
    local days=${1:-30}  # 預設清理30天前的日誌
    
    echo -e "${YELLOW}準備清理 $days 天前的日誌檔案...${NC}"
    
    # 計算要清理的檔案
    OLD_FILES=$(find "$LOG_DIR" -name "*.log" -type f -mtime +$days 2>/dev/null)
    
    if [ -z "$OLD_FILES" ]; then
        echo -e "${GREEN}沒有需要清理的舊日誌檔案${NC}"
        return 0
    fi
    
    echo -e "${CYAN}將要刪除的檔案:${NC}"
    echo "$OLD_FILES"
    
    echo -e "${YELLOW}確定要刪除這些檔案嗎？ (y/N): ${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "$OLD_FILES" | xargs rm -f
        echo -e "${GREEN}舊日誌檔案已清理${NC}"
    else
        echo -e "${YELLOW}取消清理操作${NC}"
    fi
}

# 顯示日誌統計
show_status() {
    echo -e "${BLUE}==============================================================================${NC}"
    echo -e "${GREEN}日誌統計資訊${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
    
    if [ -d "$LOG_DIR" ]; then
        echo -e "${CYAN}日誌目錄大小:${NC}"
        du -sh "$LOG_DIR"
        echo ""
        
        echo -e "${CYAN}檔案數量統計:${NC}"
        echo -e "  啟動日誌: $(find "$STARTUP_LOG_DIR" -name "*.log" 2>/dev/null | wc -l) 個檔案"
        echo -e "  應用日誌: $(find "$LOG_DIR" -maxdepth 1 -name "*.log" 2>/dev/null | wc -l) 個檔案"
        echo -e "  封存日誌: $(find "$LOG_DIR/archived" -name "*" 2>/dev/null | wc -l) 個檔案"
        echo ""
        
        echo -e "${CYAN}最新檔案:${NC}"
        LATEST_STARTUP=$(ls -t "$STARTUP_LOG_DIR"/*.log 2>/dev/null | head -n 1)
        if [ -n "$LATEST_STARTUP" ]; then
            echo -e "  最新啟動日誌: $(basename "$LATEST_STARTUP")"
            echo -e "  檔案大小: $(ls -lah "$LATEST_STARTUP" | awk '{print $5}')"
            echo -e "  修改時間: $(ls -lah "$LATEST_STARTUP" | awk '{print $6, $7, $8}')"
        fi
    else
        echo -e "${RED}日誌目錄不存在${NC}"
    fi
}

# 封存舊日誌
archive_logs() {
    local days=${1:-7}  # 預設封存7天前的日誌
    
    echo -e "${YELLOW}準備封存 $days 天前的日誌檔案...${NC}"
    
    # 確保封存目錄存在
    mkdir -p "$LOG_DIR/archived"
    
    # 尋找要封存的檔案
    OLD_FILES=$(find "$STARTUP_LOG_DIR" -name "*.log" -type f -mtime +$days 2>/dev/null)
    
    if [ -z "$OLD_FILES" ]; then
        echo -e "${GREEN}沒有需要封存的日誌檔案${NC}"
        return 0
    fi
    
    echo -e "${CYAN}將要封存的檔案:${NC}"
    echo "$OLD_FILES"
    
    echo -e "${YELLOW}確定要封存這些檔案嗎？ (y/N): ${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "$OLD_FILES" | while read -r file; do
            if [ -f "$file" ]; then
                gzip -c "$file" > "$LOG_DIR/archived/$(basename "$file").gz"
                rm "$file"
                echo -e "  封存: $(basename "$file")"
            fi
        done
        echo -e "${GREEN}日誌檔案封存完成${NC}"
    else
        echo -e "${YELLOW}取消封存操作${NC}"
    fi
}

# 主程式邏輯
case "${1:-help}" in
    "list"|"ls")
        list_logs
        ;;
    "latest"|"last")
        view_latest
        ;;
    "tail")
        tail_log "$2"
        ;;
    "view"|"cat")
        view_log "$2"
        ;;
    "search"|"grep")
        search_logs "$2"
        ;;
    "errors"|"error")
        view_errors
        ;;
    "clean")
        clean_logs "$2"
        ;;
    "status"|"stat")
        show_status
        ;;
    "archive")
        archive_logs "$2"
        ;;
    "help"|"-h"|"--help"|*)
        show_usage
        ;;
esac
