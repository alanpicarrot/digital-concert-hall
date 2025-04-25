#!/bin/bash
# 數位音樂廳路由修復腳本 - 深度修復版本

echo "===== 數位音樂廳路由修復腳本 ====="
echo "此腳本將修復前端路由和代理的問題"

# 確保在項目根目錄中執行
if [ ! -d "frontend-admin" ] || [ ! -d "backend" ]; then
  echo "錯誤：請在數位音樂廳項目根目錄中執行此腳本"
  exit 1
fi

# 修改AdminRoutes.jsx文件，調整路由配置
echo "修改前端路由配置..."
cat > frontend-admin/src/router/AdminRoutes.jsx << 'EOF'
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { setupAuthHeaders, setupPreRequestAuth } from '../utils/authPersistUtils';

// 引入管理後台頁面
import DashboardPage from '../pages/DashboardPage';
import ConcertsPage from '../pages/ConcertsPage';
import PerformancesPage from '../pages/PerformancesPage';
import TicketTypesPage from '../pages/TicketTypesPage';
import TicketsPage from '../pages/TicketsPage';
import UsersPage from '../pages/UsersPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterAdminPage from '../pages/auth/RegisterAdminPage';
import NotFoundPage from '../pages/NotFoundPage';

// 引入佈局元件
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// 引入受保護的路由組件
import ProtectedRoute from './ProtectedRoute';

const AdminRoutes = () => {
  // 初始化时确保认证头部和请求保护设置正确
  useEffect(() => {
    console.log('管理路由组件初始化，设置认证保护措施');
    setupAuthHeaders(); // 确保认证头部已设置
    setupPreRequestAuth(); // 设置请求拦截器
  }, []);
  
  return (
    <Routes>
      {/* 登入頁面 - 重要：放在最前面處理 */}
      <Route path="/auth/login" element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>
      
      <Route path="/auth/register-admin" element={<AuthLayout />}>
        <Route index element={<RegisterAdminPage />} />
      </Route>
      
      {/* 儀表板和保護的管理頁面 */}
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
      </Route>
      
      {/* 獨立配置的各個功能頁面 */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
      </Route>
      
      <Route path="/concerts" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ConcertsPage />} />
      </Route>
      
      <Route path="/performances" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<PerformancesPage />} />
      </Route>
      
      <Route path="/ticket-types" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<TicketTypesPage />} />
      </Route>
      
      <Route path="/tickets" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<TicketsPage />} />
      </Route>
      
      <Route path="/users" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<UsersPage />} />
      </Route>
      
      {/* 未找到頁面 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AdminRoutes;
EOF

# 修改setupProxy.js文件
echo "修改代理配置..."
cat > frontend-admin/src/setupProxy.js << 'EOF'
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('設置API代理到後端服務...');
  
  // 默認API代理 - 所有/api路徑
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

  // auth API路徑代理 - 只代理API呼叫，不代理頁面訪問
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );
  
  // 直接auth路徑代理 - 確保後端auth API能被訪問
  app.use(
    '/auth/signin',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );
  
  app.use(
    '/auth/register',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );
  
  app.use(
    '/auth/logout',
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

# 修改authService.js中的登錄邏輯
echo "修改認證服務..."
cat > frontend-admin/src/services/authService.js.fixed << 'EOF'
// 這是修改後的authService.js片段 - 需要合併到原檔案
// 專注於修復login函數

// 登入函數
const login = async (usernameOrEmail, password) => {
  console.log("發送管理員登入請求:", {
    usernameOrEmail,
    password: "[REDACTED]",
  });

  // 先清除任何舊令牌和用戶數據
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  
  // 清除全局默認頭部
  delete axios.defaults.headers.common['Authorization'];

  // 準備登入憑證
  const credentials = {
    username: usernameOrEmail,
    password: password,
  };

  try {
    // 記錄API URL
    console.log("使用API URL:", API_URL);
    
    // 直接使用axios實例，明確指定完整URL
    const response = await axios({
      method: 'post',
      url: `${API_URL}/api/auth/signin`,
      data: credentials,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log("登入回應:", response.status);
    
    if (response.status === 200 && response.data) {
      const jsonResponse = response.data;
      
      if (jsonResponse.accessToken) {
        console.log("登入成功:", jsonResponse.username);

        // 確認用戶具有 ADMIN 角色
        const hasAdminRole =
          jsonResponse.roles &&
          Array.isArray(jsonResponse.roles) &&
          jsonResponse.roles.includes("ROLE_ADMIN");

        if (!hasAdminRole) {
          console.error("此帳戶沒有管理員權限");
          throw new Error("此帳戶沒有管理員權限，請使用管理員帳戶登入");
        }

        // 存入令牌與用戶資料
        localStorage.setItem("adminToken", jsonResponse.accessToken);
        localStorage.setItem("adminUser", JSON.stringify(jsonResponse));
        
        // 設置全局授權頁頭
        axios.defaults.headers.common['Authorization'] = `Bearer ${jsonResponse.accessToken}`;
        console.log("已設置全局授權頁頭");

        // 返回成功結果
        return { success: true, data: jsonResponse };
      } else {
        // 無效的回應數據
        console.error("登入時收到的回應數據不包含 accessToken:", jsonResponse);
        throw new Error("登入失敗，服務器回應格式錯誤");
      }
    } else {
      throw new Error("登入失敗，服務器回應格式錯誤");
    }
  } catch (error) {
    console.error("登入過程發生錯誤:", error.message);
    if (error.response) {
      console.error("服務器回應狀態:", error.response.status);
      console.error("服務器回應數據:", error.response.data);
    }
    throw error;
  }
};
EOF

# 創建HTML5歷史模式支援
echo "設置HTML5歷史模式支援..."
echo "/* /index.html 200" > frontend-admin/public/_redirects

# 修改前端管理啟動腳本
echo "創建修復後的啟動腳本..."
cat > frontend-admin/restart-fixed.sh << 'EOF'
#!/bin/bash
echo "啟動修復後的前端管理應用程式..."

# 停止任何可能執行中的 Node 進程
echo "停止可能在運行的 Node 進程..."
pkill -f "node.*3001" || true

# 清除緩存
echo "清除 node_modules/.cache 目錄..."
rm -rf node_modules/.cache

# 設置環境變數
export PORT=3001
export DANGEROUSLY_DISABLE_HOST_CHECK=true
export FAST_REFRESH=false

# 啟動應用
echo "啟動應用在端口 3001..."
npm start
EOF

# 讓啟動腳本可執行
chmod +x frontend-admin/restart-fixed.sh

echo "===== 路由修復完成 ====="
echo "請按照以下步驟操作："
echo "1. 如果需要使用修復後的登入邏輯，請手動整合 frontend-admin/src/services/authService.js.fixed 到原檔案"
echo "2. 確保後端服務正在運行（使用 ./start.sh 或單獨啟動後端）"
echo "3. 使用以下命令啟動修復後的前端："
echo "   cd frontend-admin && ./restart-fixed.sh"
echo ""
echo "4. 在瀏覽器中訪問：http://localhost:3001"
echo "5. 使用登入頁面：http://localhost:3001/auth/login"
echo ""
echo "如果仍然遇到問題，請嘗試清除瀏覽器快取並重新啟動。"
