#!/bin/bash
echo "正在測試管理員登入功能..."

# 設置變數
API_URL="http://localhost:8080/api/test-login/admin"

# 使用 cURL 發送 POST 請求到測試登入 API
echo "發送請求到: $API_URL"
response=$(curl -s -X POST $API_URL)

# 檢查是否成功獲取 JWT 令牌
if [[ $response == *"accessToken"* ]]; then
    echo "登入成功！接收到 JWT 令牌。"
    # 提取令牌 (這裡使用簡單的字符串處理，實際情況可能需要更複雜的 JSON 解析)
    token=$(echo $response | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
    echo "令牌: ${token:0:20}... (已截斷)"
    
    # 保存令牌到文件以便後續使用
    echo $token > admin_token.txt
    echo "令牌已保存到 admin_token.txt"
    
    # 測試使用令牌訪問管理員儀表板
    echo "正在測試使用令牌訪問管理員儀表板..."
    dashboard_response=$(curl -s -H "Authorization: Bearer $token" http://localhost:8080/api/admin/dashboard/stats)
    
    echo "儀表板回應: $dashboard_response"
else
    echo "登入失敗！回應: $response"
fi

echo "測試完成。"
