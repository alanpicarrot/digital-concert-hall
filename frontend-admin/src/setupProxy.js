const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('設置優化的API代理到後端服務...');
  
  // API路徑代理 - 所有/api路徑
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    })
  );

  // 健康檢查代理
  app.use(
    ['/health', '/ping'],
    createProxyMiddleware({
      target: 'http://localhost:8081',
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
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      })
    );
    console.log(`已設置代理: ${endpoint} -> http://localhost:8081${endpoint}`);
  });
  
  // 重要：確保前端路由不受代理影響
  console.log('前端路由將由React Router處理，不會被代理到後端');
  
  // 重要：確保刷新頁面時能找到對應路由
  // 添加 historyApiFallback 類似的功能
  app.use('/*', (req, res, next) => {
    // 只處理 GET 請求，並確保非 API 路徑
    if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.includes('.')) {
      console.log('捕獲客戶端路由請求:', req.url);
      // 不重定向，讓這些請求通過到客戶端路由處理
    }
    next();
  });
  
  // 記錄設置完成
  console.log('API代理設置完成，優化了前端路由與後端API的整合');
};
