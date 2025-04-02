# 修復數位音樂廳後台未登入時顯示testuser的問題

## 問題描述
當數位音樂廳後台啟動服務時，右上角顯示testuser，但實際上並未登入。需要讓後台服務啟動時，如果沒有帳號登入，不顯示任何帳號名稱，而是顯示登入按鈕。

## 分析過程

首先查看了以下關鍵組件：
- AuthContext.jsx - 認證上下文，負責管理登入狀態
- AuthService.js - 認證服務，包含登入、登出等功能
- AdminLayout.jsx - 管理後台的主佈局，顯示頂部用戶名和登入/登出按鈕
- AdminRoute.jsx - 權限控制組件，保護需登入才能訪問的頁面

發現問題原因：
1. AuthContext.jsx中有特殊處理"testuser"的邏輯
2. 登入狀態判斷不嚴格，只檢查localStorage中是否有用戶信息
3. 界面上未區分登入/未登入狀態的顯示邏輯

## 解決方案

1. **修改index.js**：添加啟動檢查代碼，確保應用程序載入時清除無效登入狀態
```javascript
// 啟動時清除任何過期或測試用戶資訊
const cleanupStorage = () => {
  console.log('應用啟動: 清除過期用戶資訊');
  const isValidSession = () => {
    const adminUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');
    return adminUser && token && JSON.parse(adminUser).username !== 'testuser';
  };
  
  if (!isValidSession()) {
    console.log('清除無效的登入資訊');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

cleanupStorage();
```

2. **修改AuthContext.jsx**：改進初始化和登入邏輯，移除對"testuser"的特殊處理
```javascript
// 初始化時從 localStorage 獲取管理員信息
useEffect(() => {
  const initAuth = () => {
    try {
      // 清除所有人預設的情況
      console.log('開始登入檢查，確保沒有預設用戶');
      window.testUserCleared = true;
      
      // 首先假設沒有登入
      setUser(null);
      setIsAuthenticated(false);
      
      // 然後檢查是否真的登入了
      const adminUser = AuthService.getCurrentAdmin();
      const token = localStorage.getItem('adminToken');
      
      // 只有當同時有用戶數據和令牌時才設置認證狀態
      if (adminUser && token) {
        // 進一步檢查用戶數據是否完整
        if (adminUser.username && adminUser.roles) {
          console.log('在本地存儲找到有效的用戶登入', adminUser.username);
          setUser(adminUser);
          setIsAuthenticated(true);
        } else {
          // 數據不完整，清除
          console.log('本地存儲的用戶數據不完整，清除');
          AuthService.logout();
        }
      } else {
        // 不存在憑證，確保登出狀態
        console.log('沒有發現有效的用戶登入憑證');
        AuthService.logout();
      }
    } catch (error) {
      console.error('初始化管理員認證狀態失敗', error);
      // 清除可能錯誤的存儲
      AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, []);
```

3. **修改登入邏輯**：確保登入前先清除狀態，登入失敗時正確設置狀態
```javascript
// 登入函數
const login = async (username, password) => {
  try {
    console.log('Context: 嘗試登入', { username });
    setLoading(true);
    
    // 確保登入前先清除狀態
    setUser(null);
    setIsAuthenticated(false);
    
    // 嘗試登入處理
    try {
      console.log('嘗試登入處理: 使用提供的憑證');
      const data = await AuthService.login(username, password);
      
      // 確認返回數據完整性
      if (data && data.username && data.accessToken) {
        console.log('登入成功:', data.username);
        setUser(data);
        setIsAuthenticated(true);
        return { success: true, data };
      } else {
        console.error('登入失敗: 返回數據不完整');
        setUser(null);
        setIsAuthenticated(false);
        return { 
          success: false, 
          message: '登入失敗: 用戶數據不完整'
        };
      }
    } catch (error) {
      console.error('登入處理失敗:', error);
      setUser(null);
      setIsAuthenticated(false);
      return { 
        success: false, 
        message: error.response?.data?.message || '登入失敗，請檢查您的帳號和密碼'
      };
    }
  } catch (error) {
    console.error('管理員登入失敗', error);
    setUser(null);
    setIsAuthenticated(false);
    return { 
      success: false, 
      message: error.response?.data?.message || '登入失敗，請檢查您的帳號和密碼，或確認您擁有管理員權限'
    };
  } finally {
    setLoading(false);
  }
};
```

4. **修改AdminLayout.jsx**：根據登入狀態顯示不同內容
```javascript
<div className="ml-4 flex items-center md:ml-6">
  {isAuthenticated ? (
    <div className="relative flex items-center">
      <span className="hidden md:inline-block text-gray-700 mr-3">
        {user?.username || '管理員'}
      </span>
      <button
        onClick={handleLogout}
        className="bg-teal-100 p-1 rounded-full text-teal-800 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
      >
        <LogOut className="h-6 w-6" />
        <span className="ml-2 hidden md:inline-block">登出</span>
      </button>
    </div>
  ) : (
    <div className="relative flex items-center">
      <Link to="/auth/login"
        className="bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center px-4 py-2 font-medium"
      >
        <span>登入</span>
      </Link>
    </div>
  )}
</div>
```

5. **強化AdminRoute.jsx**：更嚴格的身份驗證檢查
```javascript
// 更嚴格的身份驗證
// 確保清除無效的登入狀態
if (!localStorage.getItem('adminToken')) {
  console.log('沒有有效的登入令牌，清除狀態');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
}

// 如果用戶未登入或沒有用戶信息，重定向到登入頁面
if (!isAuthenticated || !user) {
  console.log('未登入或沒有用戶信息，重定向到登入頁面');
  return <Navigate to="/auth/login" state={{ from: location }} replace />;
}
```

6. **改進authService.js**的登出函數
```javascript
// 登出函數
const logout = () => {
  console.log('執行管理員登出操作');
  
  // 先清除本地存儲，確保即使 API 調用失敗也能登出
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // 確保清除任何測試用戶的痕跡
  if (window.testUserCleared === undefined) {
    window.testUserCleared = true;
    console.log('清除測試用戶狀態');
  }
  
  // 嘗試調用後端登出 API
  try {
    const endpoint = validateApiPath('/api/auth/logout');
    axiosInstance.post(endpoint).catch(err => {
      console.log('登出 API 調用失敗，但本地存儲已清除', err);
    });
  } catch (error) {
    console.error('登出 API 調用失敗', error);
  }
};
```

## 問題解決
經過上述改進，數位音樂廳後台在未登入時不再顯示testuser，而是正確顯示登入按鈕，解決了原有問題。
