#!/bin/bash

# 數位音樂廳系統 - 用戶管理停止腳本
# 版本: 3.1.0

# 定義顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== 停止數位音樂廳用戶管理服務 =====${NC}"
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
# 停止前端管理面板
stop_process ".frontend-admin.pid" "前端管理面板"

# 停止後端
stop_process ".backend.pid" "後端服務"

# 檢查並清理可能存在的殘留進程
echo -e "${YELLOW}檢查殘留進程...${NC}"

# 清理 Node.js 進程
if pgrep -f "react-scripts start" > /dev/null; then
    echo -e "${YELLOW}發現殘留的 React 進程，正在清理...${NC}"
    pkill -f "react-scripts start"
    echo -e "${GREEN}清理完成${NC}"
fi

# 清理占用的端口
clean_port() {
    local port=$1
    if lsof -i:$port > /dev/null; then
        echo -e "${YELLOW}發現占用端口 $port 的進程:${NC}"
        lsof -i:$port
        echo -e "${YELLOW}嘗試清理端口 $port...${NC}"
        fuser -k $port/tcp 2>/dev/null || true
        sleep 1
        if lsof -i:$port > /dev/null; then
            echo -e "${RED}端口 $port 清理失敗，強制終止進程...${NC}"
            lsof -t -i:$port | xargs -r kill -9
            sleep 1
            if lsof -i:$port > /dev/null; then
                echo -e "${RED}端口 $port 強制清理仍然失敗:${NC}"
                lsof -i:$port
            else
                echo -e "${GREEN}端口 $port 強制清理成功${NC}"
            fi
        else
            echo -e "${GREEN}端口 $port 清理成功${NC}"
        fi
    else
        echo -e "${GREEN}端口 $port 未被占用${NC}"
    fi
}

# 清理用戶管理服務使用的端口
for port in 3001 8080; do
    clean_port $port
done

echo -e "${GREEN}所有用戶管理服務已停止${NC}"
echo "====================================="
echo -e "${GREEN}您現在可以安全地重新啟動系統${NC}"
echo "====================================="
