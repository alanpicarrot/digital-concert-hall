// direct-api-test.js
const { test, expect } = require('@playwright/test');

// 直接測試後端API，不依賴前端UI
test('Direct API testing for auth and orders', async ({ request }) => {
  // 1. 測試登入API
  console.log('開始測試登入API');
  const loginResponse = await request.post('http://localhost:8080/api/auth/signin', {
    data: {
      username: 'testuser', // 替換為您的測試用戶名
      password: 'password123' // 替換為您的測試密碼
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // 檢查登入回應
  console.log('登入API回應狀態碼:', loginResponse.status());
  let token = '';
  
  if (loginResponse.status() === 401) {
    console.error('登入失敗: 401 Unauthorized');
    try {
      const errorBody = await loginResponse.json();
      console.error('錯誤詳情:', JSON.stringify(errorBody));
    } catch (e) {
      const errorText = await loginResponse.text();
      console.error('錯誤回應:', errorText);
    }
    throw new Error('登入API失敗，請檢查用戶名和密碼');
  } 
  else if (!loginResponse.ok()) {
    console.error(`登入失敗: ${loginResponse.status()}`);
    try {
      const errorBody = await loginResponse.json();
      console.error('錯誤詳情:', JSON.stringify(errorBody));
    } catch (e) {
      const errorText = await loginResponse.text();
      console.error('錯誤回應:', errorText);
    }
    throw new Error(`登入API失敗: ${loginResponse.status()}`);
  }
  else {
    // 登入成功，獲取令牌
    const responseBody = await loginResponse.json();
    console.log('登入API成功，回應內容:', JSON.stringify(responseBody));
    
    token = responseBody.token || responseBody.accessToken;
    if (!token) {
      console.error('未能從回應中獲取令牌');
      console.log('完整回應:', JSON.stringify(responseBody));
      throw new Error('回應中未包含token或accessToken');
    }
    
    console.log('獲取到認證令牌:', token.substring(0, 20) + '...');
  }

  // 2. 測試驗證令牌API (如果有的話)
  console.log('開始測試令牌驗證');
  try {
    const tokenCheckResponse = await request.get('http://localhost:8080/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('令牌驗證API回應狀態碼:', tokenCheckResponse.status());
    if (tokenCheckResponse.ok()) {
      const userInfo = await tokenCheckResponse.json();
      console.log('當前登入用戶信息:', JSON.stringify(userInfo));
    } else {
      console.error('令牌驗證失敗');
    }
  } catch (e) {
    console.log('令牌驗證API可能不存在或其他錯誤:', e.message);
  }

  // 3. 測試訂單API
  console.log('開始測試訂單創建API');
  const orderData = {
    items: [
      {
        id: "1", // 替換為有效的票券ID
        concertId: "1", // 替換為有效的音樂會ID
        type: "VIP",
        quantity: 1
      }
    ]
  };
  
  try {
    const orderResponse = await request.post('http://localhost:8080/api/orders', {
      data: orderData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('訂單API回應狀態碼:', orderResponse.status());
    
    if (orderResponse.ok()) {
      const orderResult = await orderResponse.json();
      console.log('訂單創建成功:', JSON.stringify(orderResult));
      console.log('訂單號:', orderResult.orderNumber);
    } else {
      console.error('訂單創建失敗');
      try {
        const errorBody = await orderResponse.json();
        console.error('錯誤詳情:', JSON.stringify(errorBody));
      } catch (e) {
        const errorText = await orderResponse.text();
        console.error('錯誤回應:', errorText);
      }
    }
  } catch (e) {
    console.error('訂單API請求出錯:', e.message);
  }
  
  // 4. 測試訂單權限檢查API
  console.log('測試訂單權限檢查API');
  try {
    const authTestResponse = await request.get('http://localhost:8080/api/orders/auth-test', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('權限檢查API回應狀態碼:', authTestResponse.status());
    if (authTestResponse.ok()) {
      const authTestResult = await authTestResponse.json();
      console.log('權限檢查結果:', JSON.stringify(authTestResult));
    } else {
      console.error('權限檢查API失敗');
    }
  } catch (e) {
    console.error('權限檢查API請求出錯:', e.message);
  }
});
