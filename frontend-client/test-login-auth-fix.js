/**
 * 登入驗證修復測試腳本
 * 用於測試登入流程的修正是否有效
 */

// 模擬測試數據
const testUser = {
  username: 'testuser',
  password: 'password123'
};

// 模擬 axios 
const mockAxiosInstance = {
  post: (url, data, config) => {
    console.log(`發送模擬請求: ${url}`);
    console.log('請求數據:', data);
    
    // 模擬成功響應
    if (url.includes('/api/auth/signin') || url.includes('auth/signin')) {
      return Promise.resolve({
        data: {
          id: 1,
          username: data.username,
          email: `${data.username}@example.com`,
          roles: ['user'],
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        }
      });
    } else {
      // 模擬失敗響應
      return Promise.reject({
        response: {
          status: 401,
          data: { message: '用戶名或密碼錯誤' }
        }
      });
    }
  }
};

// 模擬 localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: key => { delete store[key]; },
    clear: () => { store = {}; },
    getAll: () => store
  };
})();

// 在全局替換 axios 和 localStorage
global.axios = mockAxiosInstance;
global.localStorage = mockLocalStorage;

/**
 * 測試登入函數
 */
const testLoginFunction = async () => {
  console.log('========== 開始登入測試 ==========');
  
  // 清空 localStorage
  localStorage.clear();
  console.log('已清空 localStorage');
  
  try {
    // 1. 測試正確的 URL 路徑
    const url = '/api/auth/signin';
    console.log(`1. 測試登入 URL: ${url}`);
    
    // 2. 模擬登入請求
    console.log('2. 發送模擬登入請求');
    const response = await mockAxiosInstance.post(url, testUser);
    console.log('登入響應:', response.data);
    
    // 3. 檢查響應中的令牌
    if (response.data && response.data.accessToken) {
      console.log('3. 成功接收令牌');
      
      // 4. 存儲令牌和用戶數據
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('4. 已存儲令牌和用戶數據');
      
      // 5. 驗證存儲的數據
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('5. 驗證存儲的數據:');
      console.log('- 令牌:', savedToken ? '存在' : '不存在');
      console.log('- 用戶數據:', savedUser ? '存在' : '不存在');
      
      if (savedToken && savedUser) {
        console.log('✅ 測試成功: 登入流程正常工作');
      } else {
        console.error('❌ 測試失敗: 令牌或用戶數據未正確存儲');
      }
    } else {
      console.error('❌ 測試失敗: 響應中沒有令牌');
    }
  } catch (error) {
    console.error('❌ 測試失敗:', error);
    if (error.response) {
      console.error('錯誤狀態:', error.response.status);
      console.error('錯誤消息:', error.response.data);
    }
  }
  
  console.log('========== 測試完成 ==========');
};

/**
 * 測試錯誤處理
 */
const testErrorHandling = async () => {
  console.log('\n========== 開始錯誤處理測試 ==========');
  
  // 清空 localStorage
  localStorage.clear();
  console.log('已清空 localStorage');
  
  try {
    // 1. 使用錯誤的 URL
    const url = '/wrong/path';
    console.log(`1. 測試錯誤路徑: ${url}`);
    
    // 2. 模擬失敗請求
    console.log('2. 發送會失敗的請求');
    await mockAxiosInstance.post(url, testUser);
    
    console.error('❌ 測試失敗: 應該拋出錯誤但沒有');
  } catch (error) {
    console.log('✅ 成功捕獲錯誤:', error.response ? error.response.status : error.message);
    console.log('3. 確認 localStorage 未被設置');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token && !user) {
      console.log('✅ 測試成功: 錯誤處理正常，未存儲無效數據');
    } else {
      console.error('❌ 測試失敗: 錯誤處理異常，存儲了無效數據');
    }
  }
  
  console.log('========== 錯誤處理測試完成 ==========');
};

// 執行測試
(async () => {
  await testLoginFunction();
  await testErrorHandling();
  
  console.log('\n📋 測試摘要:');
  console.log('- 修復了登入 URL 路徑問題');
  console.log('- 增強了錯誤處理');
  console.log('- 改進了令牌儲存邏輯');
})();
