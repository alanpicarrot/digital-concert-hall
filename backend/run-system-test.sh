#!/bin/bash
echo "正在執行數位音樂廳系統功能測試..."

# 設置變數
BASE_URL="http://localhost:8080"
ADMIN_LOGIN_URL="$BASE_URL/api/test-login/admin"
HEALTH_CHECK_URL="$BASE_URL/api/health-check"
DASHBOARD_TEST_URL="$BASE_URL/api/dashboard-test"
CONCERTS_URL="$BASE_URL/api/concerts"
ADMIN_DASHBOARD_URL="$BASE_URL/api/admin/dashboard/stats"

# 彩色輸出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函數: 執行測試並顯示結果
run_test() {
    local test_name=$1
    local command=$2
    local expected_pattern=$3
    
    echo -e "${YELLOW}執行測試: $test_name${NC}"
    echo "命令: $command"
    
    # 執行命令並捕獲輸出
    response=$(eval $command)
    
    # 檢查回應是否包含預期的模式
    if [[ $response == *"$expected_pattern"* ]]; then
        echo -e "${GREEN}測試通過! ✓${NC}"
        echo "回應: ${response:0:100}... (已截斷)"
        return 0
    else
        echo -e "${RED}測試失敗! ✗${NC}"
        echo "回應: $response"
        return 1
    fi
}

# 1. 健康檢查測試
echo "======================="
echo "1. 健康檢查測試"
echo "======================="
run_test "API 健康檢查" "curl -s $HEALTH_CHECK_URL" "success"

# 2. 儀表板測試
echo "======================="
echo "2. 儀表板測試"
echo "======================="
run_test "儀表板統計資料" "curl -s $DASHBOARD_TEST_URL" "concertCount"

# 3. 音樂會列表測試
echo "======================="
echo "3. 音樂會列表測試"
echo "======================="
run_test "獲取音樂會列表" "curl -s $CONCERTS_URL" "id"

# 4. 測試登入功能
echo "======================="
echo "4. 測試管理員登入"
echo "======================="
login_response=$(curl -s -X POST $ADMIN_LOGIN_URL)

if [[ $login_response == *"accessToken"* ]]; then
    echo -e "${GREEN}登入成功! ✓${NC}"
    
    # 提取令牌
    token=$(echo $login_response | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
    echo "令牌: ${token:0:20}... (已截斷)"
    
    # 保存令牌到文件
    echo $token > admin_token.txt
    echo "令牌已保存到 admin_token.txt"
    
    # 5. 測試管理員儀表板
    echo "======================="
    echo "5. 管理員儀表板測試"
    echo "======================="
    run_test "訪問管理員儀表板" "curl -s -H \"Authorization: Bearer $token\" $ADMIN_DASHBOARD_URL" "totalConcerts"
else
    echo -e "${RED}管理員登入失敗! ✗${NC}"
    echo "回應: $login_response"
fi

echo "======================="
echo "測試完成!"
echo "======================="
