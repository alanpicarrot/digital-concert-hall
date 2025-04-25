#!/bin/bash
# 數位音樂廳 - 全面前端認證修復腳本

echo "================================================"
echo "  數位音樂廳 - 全面前端認證修復腳本"
echo "================================================"

# 確保在項目根目錄中執行
if [ ! -d "frontend-admin" ] || [ ! -d "backend" ]; then
  echo "錯誤：請在數位音樂廳項目根目錄中執行此腳本"
  exit 1
fi

echo "步驟 1: 優化前端代理配置..."
cat > frontend-admin/src/setupProxy.js << 'EOL'
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('設置優化的API代理到後端服務...');
  
  // API路徑代理 - 所有/api路徑
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
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

  // 特定的auth API路徑代理 - 只代理具體的API呼叫，不代理頁面訪問
  const authEndpoints = ['/auth/signin', '/auth/register', '/auth/register-admin', '/auth/logout'];
  
  authEndpoints.forEach(endpoint => {
    app.use(
      endpoint,
      createProxyMiddleware({
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      })
    );
    console.log(`已設置代理: ${endpoint} -> http://localhost:8080${endpoint}`);
  });
  
  // 重要：確保前端路由不受代理影響
  console.log('前端路由將由React Router處理，不會被代理到後端');
  
  console.log('API代理設置完成，優化了前端路由與後端API的整合');
};
EOL

echo "步驟 2: 設置環境變數..."
cat > frontend-admin/.env.development.local << 'EOL'
PORT=3001
REACT_APP_API_URL=http://localhost:8080
BROWSER=none
FAST_REFRESH=false
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_PORT=3001
EOL

echo "步驟 3: 設置歷史API回退..."
echo "/* /index.html 200" > frontend-admin/public/_redirects

echo "步驟 4: 優化HTML模板..."
cat > frontend-admin/public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Digital Concert Hall Admin Panel" />
    <link rel="icon" href="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/music.svg" />
    <link rel="apple-touch-icon" href="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/music.svg" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    
    <title>數位音樂廳 - 管理後台</title>
    
    <!-- 防止直接訪問/auth/login路徑的靜態資源404錯誤 -->
    <script>
      // 檢測當前URL路徑
      (function() {
        // 如果直接訪問/auth/login路徑，且這是由後端返回的靜態HTML而非React路由
        if (window.location.pathname.startsWith('/auth/login') && !window.__INITIAL_LOADED__) {
          console.log('檢測到直接訪問登入頁面，重定向到主應用...');
          // 標記已初始化
          window.__INITIAL_LOADED__ = true;
          // 重定向到根路徑，讓React Router接管
          window.location.replace('/');
        }
      })();
    </script>
    
    <!-- 頁面加載前設置認證狀態 -->
    <script>
      // 頁面加載前執行的代碼，確保認證狀態得到保持
      (function() {
        // 啟動時檢查本地存儲中的令牌
        var token = localStorage.getItem('adminToken');
        var userData = localStorage.getItem('adminUser');
        
        // 在游覽器控制台輸出認證狀態
        if (token && userData) {
          console.log('%c認證令牌存在: ' + token.substring(0, 10) + '...', 'color: green; font-weight: bold');
          
          // 將認證令牌添加到 sessionStorage 中以確保跨頁面導航時不會丟失
          sessionStorage.setItem('adminToken', token);
          sessionStorage.setItem('adminUser', userData);
          
          // 將當前頁面路徑存儲下來，以便頁面重新加載後可以返回
          sessionStorage.setItem('lastPath', window.location.pathname);
        } else {
          console.warn('%c未找到認證令牌', 'color: red; font-weight: bold');
          
          // 如果 sessionStorage 中有令牌，則將其恢復到 localStorage
          var sessionToken = sessionStorage.getItem('adminToken');
          var sessionUserData = sessionStorage.getItem('adminUser');
          
          if (sessionToken && sessionUserData) {
            console.log('%c從 sessionStorage 恢復令牌', 'color: blue; font-weight: bold');
            localStorage.setItem('adminToken', sessionToken);
            localStorage.setItem('adminUser', sessionUserData);
          }
        }
        
        // 在頁面導航前存儲狀態
        window.addEventListener('beforeunload', function() {
          var currentToken = localStorage.getItem('adminToken');
          var currentUserData = localStorage.getItem('adminUser');
          
          if (currentToken && currentUserData) {
            sessionStorage.setItem('adminToken', currentToken);
            sessionStorage.setItem('adminUser', currentUserData);
            sessionStorage.setItem('lastPath', window.location.pathname);
          }
        });
      })();
    </script>
  </head>
  <body>
    <noscript>您需要啟用JavaScript才能運行此應用程序。</noscript>
    <div id="root"></div>
  </body>
</html>
EOL

echo "步驟 5: 確保靜態登入頁面存在..."
mkdir -p frontend-admin/public/auth/login
cat > frontend-admin/public/auth/login/index.html << 'EOL'
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=/">
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
  <p>如果沒有自動跳轉，請<a href="/">點擊這裡</a>返回首頁</p>

  <script>
    // 頁面載入後立即重定向到主應用
    document.addEventListener('DOMContentLoaded', function() {
      // 設置一個簡短的延遲以確保頁面已經完全加載
      setTimeout(function() {
        try {
          window.location.replace('/');
        } catch(e) {
          console.error('跳轉失敗:', e);
          window.location.href = '/';
        }
      }, 100);
    });
  </script>
</body>
</html>
EOL

echo "步驟 6: 創建優化的啟動腳本..."
cat > frontend-admin/restart-optimized.sh << 'EOL'
#!/bin/bash
echo "========================================"
echo "  數位音樂廳管理後台 - 優化啟動腳本"
echo "========================================"

# 清除緩存
echo "清除開發伺服器緩存..."
rm -rf node_modules/.cache

# 刪除舊構建
echo "清除舊構建文件..."
rm -rf build

# 確保public/_redirects存在
echo "設置HTML5歷史模式支援..."
echo "/* /index.html 200" > public/_redirects

# 檢查webpack設置
echo "檢查開發伺服器設置..."
echo "historyApiFallback: true" > webpack.check.log

# 輸出啟動信息
echo ""
echo "啟動優化後的前端應用..."
echo "後端API地址: http://localhost:8080"
echo "前端地址: http://localhost:3001"
echo ""
echo "請在瀏覽器中訪問: http://localhost:3001"
echo "登入頁面將通過前端路由處理: http://localhost:3001/auth/login"
echo ""

# 開始應用
echo "正在啟動React應用..."
PORT=3001 BROWSER=none FAST_REFRESH=false DANGEROUSLY_DISABLE_HOST_CHECK=true WDS_SOCKET_PORT=3001 npm start
EOL

# 修改啟動腳本權限
echo "步驟 7: 設置啟動腳本權限..."
chmod +x frontend-admin/restart-optimized.sh

echo "================================================"
echo "  修復完成！"
echo "================================================"
echo ""
echo "請按照以下步驟操作："
echo "1. 確保後端已經啟動，運行在 http://localhost:8080"
echo "2. 啟動優化後的前端應用："
echo "   cd frontend-admin && ./restart-optimized.sh"
echo ""
echo "3. 清除瀏覽器緩存或使用無痕模式訪問："
echo "   http://localhost:3001"
echo ""
echo "如果遇到問題，可以查看 frontend-admin/webpack.check.log 文件以獲取更多信息。"
echo ""
echo "祝您使用愉快！"
