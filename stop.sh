#!/bin/bash

# 數位音樂廳系統 - 綜合停止腳本
# 版本: 3.0.0

# 定義顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== 停止數位音樂廳系統 =====${NC}"
echo "====================================="

# 定義一個函數來停止進程
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local PID=$(cat "$pid_file")
        echo -e "${YELLOW}停止${service_name} (PID: $PID)${NC}"
        
        # 嘗試正常終止進程
        kill $PID 2>/dev/null
        
        # 等待進程終止
        for i in {1..5}; do
            if ! kill -0 $PID 2>/dev/null; then
                break
            fi
            echo "等待進程終止... ($i/5)"
            sleep 1
        done
        
        # 如果進程仍然存在，強制終止
        if kill -0 $PID 2>/dev/null; then
            echo -e "${RED}進程未響應，強制終止${NC}"
            kill -9 $PID 2>/dev/null
        fi
        
        rm -f "$pid_file"
        echo -e "${GREEN}${service_name}已停止${NC}"
    else
        echo -e "${RED}找不到${service_name}的 PID 檔案${NC}"
    fi
}

# 停止順序：先前端，後後端
# 停止前端客戶端
stop_process ".frontend-client.pid" "前端客戶端"

# 停止前端管理面板
stop_process ".frontend-admin.pid" "前端管理面板"

# 停止後端
stop_process ".backend.pid" "後端服務"

echo -e "${GREEN}所有服務已停止${NC}"
echo "====================================="
