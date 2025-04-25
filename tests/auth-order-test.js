// auth-order-test.js
const { test, expect } = require('@playwright/test');

// 測試認證和訂單流程
test('Login and create order', async ({ page }) => {
  // 1. 打開前端頁面
  await page.goto('http://localhost:3000');
  console.log('前端頁面已打開');

  // 2. 點擊登入按鈕(假設有一個登入按鈕)
  try {
    await page.click('text=登入');
    console.log('點擊登入按鈕成功');
  } catch (e) {
    console.log('找不到登入按鈕，可能已在登入頁面');
  }

  // 3. 填寫登入表單
  await page.fill('input[name="username"]', 'testuser'); // 替換為您的測試用戶名
  await page.fill('input[name="password"]', 'password123'); // 替換為您的測試密碼
  console.log('填寫登入表單完成');

  // 4. 提交登入表單
  await page.click('button[type="submit"]');
  console.log('提交登入表單');

  // 5. 等待登入結果
  try {
    // 等待登入成功的標誌，例如歡迎用戶的文字或特定元素
    await page.waitForSelector('text=歡迎回來', { timeout: 5000 });
    console.log('登入成功');
  } catch (e) {
    // 如果超時，檢查是否有錯誤訊息
    const errorText = await page.textContent('.error-message');
    console.error('登入失敗，錯誤訊息:', errorText);
    throw new Error('登入失敗: ' + errorText);
  }

  // 6. 導航到音樂會列表頁面
  await page.goto('http://localhost:3000/concerts');
  console.log('導航到音樂會列表頁面');

  // 7. 點擊第一個音樂會
  await page.click('.concert-card', { timeout: 5000 });
  console.log('點擊音樂會卡片');

  // 8. 選擇票券類型和數量
  await page.selectOption('select[name="ticketType"]', '1'); // 選擇第一個票券類型
  await page.fill('input[name="quantity"]', '2'); // 選擇購買2張票
  console.log('選擇票券類型和數量');

  // 9. 添加到購物車
  await page.click('text=加入購物車');
  console.log('加入購物車');

  // 10. 導航到購物車頁面
  await page.goto('http://localhost:3000/cart');
  console.log('導航到購物車頁面');

  // 11. 點擊結帳按鈕
  await page.click('text=前往結帳');
  console.log('點擊結帳按鈕');

  // 12. 確認訂單信息
  try {
    await page.waitForSelector('.order-summary', { timeout: 5000 });
    const orderNumber = await page.textContent('.order-number');
    console.log('訂單創建成功，訂單號:', orderNumber);
  } catch (e) {
    // 檢查是否有錯誤訊息
    try {
      const errorText = await page.textContent('.error-message');
      console.error('創建訂單失敗，錯誤訊息:', errorText);
      throw new Error('創建訂單失敗: ' + errorText);
    } catch (innerError) {
      console.error('無法獲取錯誤訊息:', innerError);
      throw new Error('創建訂單失敗，無法獲取錯誤訊息');
    }
  }

  // 13. 獲取網頁內容用於調試
  const content = await page.content();
  console.log('頁面內容:', content.substring(0, 500) + '...'); // 只打印前500字符

  // 14. 獲取API請求和回應的詳細信息
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`API請求: ${request.method()} ${request.url()}`);
      console.log('請求頭:', request.headers());
      const postData = request.postData();
      if (postData) console.log('請求體:', postData);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`API回應: ${response.status()} ${response.url()}`);
      response.text().then(text => {
        try {
          console.log('回應內容:', text.substring(0, 500) + '...');
        } catch (e) {
          console.log('無法打印回應內容');
        }
      });
    }
  });

  // 15. 截圖保存
  await page.screenshot({ path: 'order-result.png' });
  console.log('測試完成，截圖已保存');
});

// 單獨測試認證API
test('Test authentication API directly', async ({ request }) => {
  // 直接調用登入API
  const loginResponse = await request.post('http://localhost:8080/api/auth/signin', {
    data: {
      username: 'testuser', // 替換為您的測試用戶名
      password: 'password123' // 替換為您的測試密碼
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // 檢查回應
  console.log('API登入狀態碼:', loginResponse.status());
  
  // 解析並檢查API回應內容
  try {
    const responseBody = await loginResponse.json();
    console.log('API回應內容:', responseBody);

    // 如果登入成功，保存令牌
    if (loginResponse.ok()) {
      const token = responseBody.token;
      console.log('認證令牌:', token);

      // 使用令牌測試訂單API
      const orderResponse = await request.post('http://localhost:8080/api/orders', {
        data: {
          items: [
            {
              id: "1", // 請確保這是有效的票券ID
              concertId: "1",
              type: "VIP",
              quantity: 2
            }
          ]
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('訂單API狀態碼:', orderResponse.status());
      const orderResult = await orderResponse.json();
      console.log('訂單API回應:', orderResult);
    }
  } catch (e) {
    console.error('解析API回應時出錯:', e);
    throw e;
  }
});
