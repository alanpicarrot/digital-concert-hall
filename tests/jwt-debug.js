// jwt-debug.js
const { test, expect } = require('@playwright/test');

// 此測試專注於調試 JWT 相關問題
test('Debug JWT and token issues', async ({ page }) => {
  // 打開前端頁面
  await page.goto('http://localhost:3000');
  console.log('前端頁面已打開');

  // 啟用網絡請求和回應的監聽
  await page.route('**/*', route => {
    const request = route.request();
    console.log(`攔截到請求: ${request.method()} ${request.url()}`);
    
    // 特別關注與JWT相關的請求頭
    if (request.url().includes('/api/')) {
      const headers = request.headers();
      if (headers['authorization']) {
        console.log('發現帶有授權令牌的請求:', headers['authorization'].substring(0, 30) + '...');
      }
    }
    
    // 繼續處理請求
    route.continue();
  });

  page.on('response', async response => {
    const request = response.request();
    
    // 只關注API響應
    if (request.url().includes('/api/')) {
      console.log(`API響應: ${response.status()} ${request.url()}`);
      
      // 檢查是否設置了JWT相關的cookie
      if (response.headers()['set-cookie']) {
        console.log('設置Cookie:', response.headers()['set-cookie']);
      }
      
      // 嘗試獲取響應內容（如果是JSON）
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          const body = await response.json();
          console.log('JSON響應體:', JSON.stringify(body).substring(0, 500) + '...');

          // 特別關注令牌信息
          if (body.token || body.accessToken) {
            console.log('發現令牌:', (body.token || body.accessToken).substring(0, 20) + '...');
          }
        }
      } catch (e) {
        console.log('無法解析響應體為JSON');
      }
    }
  });

  // 執行登入流程
  try {
    // 點擊登入按鈕（根據實際UI進行調整）
    await page.click('text=登入', { timeout: 3000 }).catch(() => console.log('找不到登入按鈕，可能已在登入頁面'));
    
    // 填寫登入表單
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    console.log('已填寫登入表單');
    
    // 提交登入
    await page.click('button[type="submit"]');
    console.log('已提交登入表單');
    
    // 等待登入完成
    await page.waitForTimeout(3000); // 等待一段時間讓登入處理完成
    
    // 檢查本地存儲和會話存儲中的令牌
    const localStorageToken = await page.evaluate(() => localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('jwtToken'));
    const sessionStorageToken = await page.evaluate(() => sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken'));
    
    if (localStorageToken) {
      console.log('本地存儲中找到令牌:', localStorageToken.substring(0, 20) + '...');
    } else {
      console.log('本地存儲中未找到令牌');
    }
    
    if (sessionStorageToken) {
      console.log('會話存儲中找到令牌:', sessionStorageToken.substring(0, 20) + '...');
    } else {
      console.log('會話存儲中未找到令牌');
    }
    
    // 檢查頁面上是否有登入成功的標誌
    const isLoggedIn = await page.evaluate(() => {
      // 根據實際頁面結構檢查登入狀態
      // 例如，檢查頁面上是否有用戶名稱顯示或登出按鈕等
      return document.body.textContent.includes('歡迎回來') || 
            document.querySelector('.user-info') !== null || 
            document.querySelector('button:contains("登出")') !== null;
    });
    
    console.log('登入狀態檢查結果:', isLoggedIn ? '已登入' : '未登入');
    
    // 嘗試從特定的DOM元素中獲取更多信息
    const pageContent = await page.content();
    console.log('頁面內容片段:', pageContent.substring(0, 500) + '...');
    
    // 檢查是否有錯誤消息
    const errorText = await page.$eval('.error-message', el => el.textContent).catch(() => '沒有找到錯誤消息');
    if (errorText !== '沒有找到錯誤消息') {
      console.log('發現錯誤消息:', errorText);
    }
    
    // 截圖保存
    await page.screenshot({ path: 'login-result.png' });
    console.log('已保存登入結果截圖');
    
  } catch (e) {
    console.error('測試過程中出錯:', e);
    await page.screenshot({ path: 'error-state.png' });
    throw e;
  }
});
