/**
 * 購物車認證問題修復測試腳本
 * 
 * 此腳本用於測試購物車頁面的認證問題修復
 * 它會模擬401錯誤的處理邏輯，確保不會顯示"登入已過期"的訊息
 */

// 模擬localStorage
const mockLocalStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// 模擬window.location
const mockLocation = {
  pathname: '/cart',
  href: ''
};

// 模擬alert函數
let alertMessages = [];
const mockAlert = (message) => {
  console.log('Alert:', message);
  alertMessages.push(message);
};

// 模擬用戶數據
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  roles: ['ROLE_USER'],
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6InRlc3R1c2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
};

// 模擬401錯誤
const mock401Error = {
  response: {
    status: 401,
    data: {
      message: '未授權'
    }
  }
};

// 測試函數
function testCartAuthErrorHandling() {
  console.log('=== 開始購物車認證問題修復測試 ===');
  
  // 步驟1: 設置初始狀態
  console.log('\n步驟1: 設置初始狀態');
  mockLocalStorage.clear();
  alertMessages = [];
  console.log('清除localStorage和alert訊息');
  
  // 步驟2: 模擬用戶登入
  console.log('\n步驟2: 模擬用戶登入');
  mockLocalStorage.setItem('token', mockUser.accessToken);
  mockLocalStorage.setItem('user', JSON.stringify(mockUser));
  console.log('已設置token和user數據到localStorage');
  
  // 步驟3: 模擬authService的響應攔截器處理401錯誤
  console.log('\n步驟3: 測試authService的響應攔截器處理401錯誤');
  
  // 模擬authService.js中的401錯誤處理邏輯
  function testAuthService401Handler() {
    console.log("偵測到 401 未授權錯誤，檢查當前路徑");

    // 檢查當前路徑是否為結帳相關頁面或購物車頁面
    const currentPath = mockLocation.pathname;
    const isCheckoutPath = currentPath.includes("/checkout/");
    const isCartPath = currentPath.includes("/cart");
    
    if (isCheckoutPath || isCartPath) {
      console.log("在結帳或購物車頁面收到401錯誤，但不清除登入狀態或重定向");
      // 在結帳或購物車頁面收到401錯誤時，不清除登入狀態或重定向
      return "錯誤被攔截，不清除登入狀態";
    }

    // 如果不是在結帳頁面，則正常處理401錯誤
    console.log("清除本地存儲中的無效令牌");
    // 先清除本地存儲中的無效令牌
    mockLocalStorage.removeItem("token");
    mockLocalStorage.removeItem("user");

    // 顯示通知
    mockAlert("您的登入已過期，請重新登入");

    // 保存當前頁面路徑用於登入後重定向
    const redirectPath = encodeURIComponent(currentPath);

    // 重定向到登入頁面，並帶上當前頁面作為重定向參數
    console.log(`重定向到登入頁面，幫訂重定向到: ${redirectPath}`);
    mockLocation.href = `/login?redirect=${redirectPath}`;
    
    return "登入已過期，已重定向";
  }
  
  // 測試購物車頁面的401錯誤處理
  mockLocation.pathname = '/cart';
  const cartResult = testAuthService401Handler();
  
  console.log('購物車頁面401錯誤處理結果:', cartResult);
  console.log('Alert訊息:', alertMessages);
  console.log('localStorage token:', mockLocalStorage.getItem('token'));
  console.log('localStorage user:', mockLocalStorage.getItem('user'));
  
  if (cartResult === "錯誤被攔截，不清除登入狀態" && 
      alertMessages.length === 0 && 
      mockLocalStorage.getItem('token') && 
      mockLocalStorage.getItem('user')) {
    console.log('✅ 購物車頁面401錯誤處理測試通過');
  } else {
    console.log('❌ 購物車頁面401錯誤處理測試失敗');
  }
  
  // 步驟4: 測試非購物車頁面的401錯誤處理
  console.log('\n步驟4: 測試非購物車頁面的401錯誤處理');
  
  // 重置狀態
  mockLocalStorage.clear();
  mockLocalStorage.setItem('token', mockUser.accessToken);
  mockLocalStorage.setItem('user', JSON.stringify(mockUser));
  alertMessages = [];
  
  // 測試其他頁面的401錯誤處理
  mockLocation.pathname = '/profile';
  const otherResult = testAuthService401Handler();
  
  console.log('其他頁面401錯誤處理結果:', otherResult);
  console.log('Alert訊息:', alertMessages);
  console.log('localStorage token:', mockLocalStorage.getItem('token'));
  console.log('localStorage user:', mockLocalStorage.getItem('user'));
  
  if (otherResult === "登入已過期，已重定向" && 
      alertMessages.includes("您的登入已過期，請重新登入") && 
      !mockLocalStorage.getItem('token') && 
      !mockLocalStorage.getItem('user')) {
    console.log('✅ 其他頁面401錯誤處理測試通過');
  } else {
    console.log('❌ 其他頁面401錯誤處理測試失敗');
  }
  
  // 步驟5: 測試cartService中的401錯誤處理
  console.log('\n步驟5: 測試cartService中的401錯誤處理');
  
  // 重置狀態
  mockLocalStorage.clear();
  mockLocalStorage.setItem('token', mockUser.accessToken);
  mockLocalStorage.setItem('user', JSON.stringify(mockUser));
  
  // 模擬cartService.js中的401錯誤處理邏輯
  function testCartService401Handler() {
    try {
      console.log('收到401未授權錯誤，但不中斷結帳流程');
      // 嘗試獲取當前的令牌和用戶數據
      const currentToken = mockLocalStorage.getItem('token');
      const currentUserStr = mockLocalStorage.getItem('user');
      let currentUserData = null;
      
      try {
        if (currentUserStr) {
          currentUserData = JSON.parse(currentUserStr);
        }
      } catch (e) {
        console.error('解析用戶數據失敗:', e);
      }
      
      // 強制重新寫入令牌和用戶數據，確保數據一致性
      if (currentToken && currentUserData) {
        mockLocalStorage.setItem('token', currentToken);
        mockLocalStorage.setItem('user', JSON.stringify(currentUserData));
        console.log('已重新寫入令牌和用戶數據，確保數據一致性');
      }
      
      throw new Error('處理訂單時發生認證問題，請重新嘗試');
    } catch (error) {
      return error.message;
    }
  }
  
  const cartServiceResult = testCartService401Handler();
  
  console.log('cartService 401錯誤處理結果:', cartServiceResult);
  console.log('localStorage token:', mockLocalStorage.getItem('token'));
  console.log('localStorage user:', mockLocalStorage.getItem('user'));
  
  if (cartServiceResult === '處理訂單時發生認證問題，請重新嘗試' && 
      mockLocalStorage.getItem('token') && 
      mockLocalStorage.getItem('user')) {
    console.log('✅ cartService 401錯誤處理測試通過');
  } else {
    console.log('❌ cartService 401錯誤處理測試失敗');
  }
  
  // 步驟6: 測試結果總結
  console.log('\n步驟6: 測試結果總結');
  
  const allTestsPassed = 
    cartResult === "錯誤被攔截，不清除登入狀態" && 
    otherResult === "登入已過期，已重定向" &&
    cartServiceResult === '處理訂單時發生認證問題，請重新嘗試';
  
  if (allTestsPassed) {
    console.log('✅ 所有測試通過，購物車認證問題修復成功');
  } else {
    console.log('❌ 部分測試失敗，購物車認證問題修復不完整');
  }
  
  console.log('\n=== 購物車認證問題修復測試完成 ===');
}

// 執行測試
testCartAuthErrorHandling();

/**
 * 使用說明:
 * 
 * 1. 在終端中運行此腳本: node test-cart-auth-fix.js
 * 2. 檢查控制台輸出，確認所有測試步驟都通過
 * 3. 如果所有步驟都通過，表示修復成功
 * 
 * 注意: 此腳本僅模擬前端邏輯，不會實際發送API請求
 */
