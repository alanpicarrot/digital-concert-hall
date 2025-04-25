#!/bin/bash
# 數位音樂廳前端認證修復腳本

echo "===== 前端認證問題修復腳本 ====="
echo "此腳本將修復前端認證路徑問題"

# 確保在項目根目錄中執行
if [ ! -d "frontend-admin" ] || [ ! -d "backend" ]; then
  echo "錯誤：請在數位音樂廳項目根目錄中執行此腳本"
  exit 1
fi

# 確保後端正在運行
echo "檢查後端服務狀態..."
if ! curl -s http://localhost:8080/health > /dev/null; then
  echo "警告：後端服務似乎未運行。繼續修復但效果可能有限。"
fi

# 設置代理文件修復
echo "修復前端代理設置..."
cat > frontend-admin/src/setupProxy.js << 'EOF'
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('設置API代理到後端服務...');
  
  // API代理
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      xfwd: true,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api', // 保持API路徑不變
      },
    })
  );

  // 健康檢查代理
  app.use(
    ['/health', '/ping'],
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );

  // auth路徑代理 - 確保登入請求正確轉發到後端
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );
  
  console.log('API代理設置完成');
};
EOF

# 設置HTML5歷史模式支援
echo "設置HTML5歷史模式支援..."
echo "/* /index.html 200" > frontend-admin/public/_redirects

# 修復前端靜態資源路徑問題
echo "創建靜態資源目錄..."
mkdir -p frontend-admin/public/auth/login

# 生成簡易的靜態頁面以防止直接訪問時的404錯誤
cat > frontend-admin/public/auth/login/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>數位音樂廳 - 重定向中</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      margin-top: 100px;
    }
    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <h2>登入頁面載入中...</h2>
  <div class="loader"></div>
  <p>如果您沒有自動跳轉，請<a href="/">點擊這裡</a>返回首頁</p>
  
  <script>
    // 頁面載入後重定向到正確的React路由
    window.onload = function() {
      window.location.href = '/';
    }
  </script>
</body>
</html>
EOF

# 設置修復後啟動腳本
echo "創建修復後的啟動腳本..."
cat > frontend-admin/start-fixed.sh << 'EOF'
#!/bin/bash
echo "啟動修復後的前端管理應用程式..."
echo "確保後端服務已經啟動!"

# 設置環境變數
export PORT=3001
export DANGEROUSLY_DISABLE_HOST_CHECK=true

# 啟動應用
echo "啟動應用在端口 3001..."
npm start
EOF

# 讓啟動腳本可執行
chmod +x frontend-admin/start-fixed.sh

echo "===== 修復完成 ====="
echo "請按照以下步驟操作："
echo "1. 確保後端服務正在運行（使用 ./start.sh 或單獨啟動後端）"
echo "2. 使用以下命令啟動修復後的前端："
echo "   cd frontend-admin && ./start-fixed.sh"
echo ""
echo "3. 在瀏覽器中訪問：http://localhost:3001/auth/login"
echo ""
echo "如果仍然遇到問題，請嘗試清除瀏覽器快取並重新啟動。"
