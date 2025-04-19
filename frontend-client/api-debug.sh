#!/bin/bash

# 音樂會 API 連線測試腳本
# 用於測試後端 API 是否正常運作

echo "===== 數位音樂廳 API 連線測試 ====="
echo "測試日期: $(date)"
echo ""

API_URL=${REACT_APP_API_URL:-"http://localhost:8080"}
echo "使用 API URL: $API_URL"
echo ""

# 測試後端是否運行
echo "測試後端連線..."
if curl -s --head $API_URL > /dev/null; then
  echo "✅ 後端連線成功"
else
  echo "❌ 後端連線失敗 - 請確認後端服務是否在 $API_URL 運行"
  exit 1
fi

# 測試音樂會 API
echo ""
echo "測試音樂會 API..."
CONCERTS_RESPONSE=$(curl -s "$API_URL/api/concerts")

if [[ $CONCERTS_RESPONSE == *"["* ]]; then
  echo "✅ 音樂會 API 響應正常，得到陣列數據"
  # 顯示獲取到的數據數量
  CONCERTS_COUNT=$(echo $CONCERTS_RESPONSE | grep -o "\[" | wc -l)
  echo "   獲取到 $CONCERTS_COUNT 個音樂會數據"
else
  echo "❌ 音樂會 API 響應異常，檢查返回數據:"
  echo "$CONCERTS_RESPONSE" | head -n 20
fi

# 檢查前端和後端路徑是否匹配
echo ""
echo "檢查 API 路徑配置..."
if grep -r "/api/concerts" ./src --include="*.js" --include="*.jsx"; then
  echo "✅ 找到 API 路徑引用"
else
  echo "❓ 未找到明確的 API 路徑引用，請手動檢查"
fi

echo ""
echo "檢查 API 基礎 URL 設定..."
echo "當前 .env.development 設置:"
cat .env.development
echo ""

echo "檢查前端 package.json proxy 設定..."
PROXY_CONFIG=$(grep -A 1 "\"proxy\":" package.json)
echo "$PROXY_CONFIG"

echo ""
echo "===== 測試完成 ====="
echo "如果 API 連線仍然有問題，請檢查："
echo "1. 後端服務是否正常運行在指定的端口上"
echo "2. API 路徑是否正確 (前端應使用 /api/concerts)"
echo "3. 確認開發環境的 CORS 配置允許本地請求"
echo "4. 檢查瀏覽器控制台是否有其他錯誤"
