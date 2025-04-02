# 數位音樂廳支付功能改進方案實作記錄

本文檔記錄了數位音樂廳專案中支付功能改進方案的實作過程和討論。

## 專案需求背景

目前數位音樂廳專案的綠界支付功能遇到問題，即使進行了修復，前台仍無法產生成功的訂單，且交易無法連動到後台。需要一個更靈活的方式來確保訂單流程可以先正常運作。

## 實作方案

採用「**Feature Flag + 模擬支付閘道**」的解決方案，這種方式可以保持代碼結構的完整性，同時提供靈活的功能切換能力。方案的核心思想是：

1. 保留已有的綠界支付代碼
2. 添加模擬支付功能作為替代
3. 使用 Feature Flag 控制在不同環境中使用哪種支付方式

## 實作步驟

### 1. 建立 Feature Flag 服務

在前端創建 `featureFlagService.js` 以管理功能標誌：

```javascript
/**
 * Feature Flag 服務
 * 用於控制功能的開關，便於開發和測試
 */

const FeatureFlags = {
  // 支付相關
  USE_REAL_PAYMENT: false, // 開發階段設為false
  
  // 其他功能flags可在此添加
  ENABLE_TICKET_GENERATION: true,
  DEBUG_MODE: false,
  
  // 獲取flag值的方法
  isEnabled: function(flagName) {
    // 先檢查localStorage是否有覆寫設定
    const localOverride = localStorage.getItem(`flag_${flagName}`);
    if (localOverride !== null) {
      return localOverride === 'true';
    }
    
    // 如果沒有本地覆寫，可以從配置或環境變量中獲取
    // 目前僅返回預設值
    return this[flagName] === true;
  },
  
  // 方便開發時覆寫flag的方法
  setFlag: function(flagName, value) {
    localStorage.setItem(`flag_${flagName}`, value.toString());
    console.log(`Feature flag ${flagName} set to ${value}`);
  },
  
  // 重置所有flags到默認值
  resetAllFlags: function() {
    Object.keys(this).forEach(key => {
      if (typeof this[key] !== 'function') {
        localStorage.removeItem(`flag_${key}`);
      }
    });
    console.log('All feature flags reset to default values');
  },
  
  // 獲取所有flags的當前狀態
  getAllFlags: function() {
    const flags = {};
    Object.keys(this).forEach(key => {
      if (typeof this[key] !== 'function') {
        flags[key] = this.isEnabled(key);
      }
    });
    return flags;
  }
};

export default FeatureFlags;
```

檔案位置：`/projects/alanp/digital-concert-hall/frontend-client/src/services/featureFlagService.js`

### 2. 修改支付服務

更新支付服務以使用 Feature Flag 控制支付方式：

```javascript
/**
 * 支付服務
 * 整合支付相關 API
 */

import FeatureFlags from './featureFlagService';
import authService from './authService';

const API_BASE_PATH = '/api/payment';
const { axiosInstance } = authService;

/**
 * 創建支付訂單
 * @param {string} orderNumber - 訂單編號
 * @returns {Promise<Object>} - 支付結果
 */
const createPayment = async (orderNumber) => {
  try {
    // 使用Feature Flag決定使用哪種支付方式
    if (FeatureFlags.isEnabled('USE_REAL_PAYMENT')) {
      // 使用真實綠界支付
      console.log('使用真實支付閘道');
      const path = `${API_BASE_PATH}/ecpay/create?orderNumber=${orderNumber}`;
      const response = await axiosInstance.post(path);
      return response.data;
    } else {
      // 使用模擬支付
      console.log('使用模擬支付閘道');
      const path = `${API_BASE_PATH}/mock-payment?orderNumber=${orderNumber}`;
      
      try {
        const response = await axiosInstance.post(path);
        console.log('模擬支付API響應:', response.data);
        
        return {
          success: true,
          message: '模擬支付已處理',
          paymentUrl: `/payment/result?orderNumber=${orderNumber}&success=true&simulatedPayment=true`
        };
      } catch (error) {
        console.error('模擬支付API調用錯誤:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('創建支付訂單時出錯:', error);
    throw error;
  }
};

/**
 * 查詢支付狀態
 * @param {string} orderNumber - 訂單編號
 * @returns {Promise<Object>} - 支付狀態
 */
const getPaymentStatus = async (orderNumber) => {
  try {
    const path = `${API_BASE_PATH}/status?orderNumber=${orderNumber}`;
    const response = await axiosInstance.get(path);
    return response.data;
  } catch (error) {
    console.error('查詢支付狀態時出錯:', error);
    throw error;
  }
};

const PaymentService = {
  createPayment,
  getPaymentStatus
};

export default PaymentService;
```

檔案位置：`/projects/alanp/digital-concert-hall/frontend-client/src/services/paymentService.js`

### 3. 後端模擬支付端點

檢查發現後端已經實現了模擬支付的端點：

```java
/**
 * 模擬支付 - 用於開發環境，直接完成支付流程
 */
@PostMapping("/mock-payment")
@CrossOrigin(origins = "*", maxAge = 3600)
@Transactional
public ResponseEntity<ApiResponse> mockPayment(@RequestParam String orderNumber) {
    try {
        System.out.println("模擬支付請求: 訂單號 " + orderNumber);
        
        // 查找訂單
        Order order = orderService.getOrderEntityByOrderNumber(orderNumber);
        if (order == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "訂單不存在"));
        }
        
        // 更新訂單狀態
        orderService.updateOrderStatus(orderNumber, "paid");
        
        // 生成票券
        ticketService.generateTicketsForOrder(orderNumber);
        
        System.out.println("模擬支付成功: 訂單號 " + orderNumber + ", 已生成票券");
        
        return ResponseEntity.ok(new ApiResponse(true, "支付模擬成功"));
    } catch (Exception e) {
        System.err.println("模擬支付失敗: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.badRequest().body(new ApiResponse(false, "支付模擬失敗: " + e.getMessage()));
    }
}
```

檔案位置：`/projects/alanp/digital-concert-hall/backend/src/main/java/com/digitalconcerthall/controller/PaymentController.java`

### 4. 修改支付結果頁面

更新支付結果頁面以處理模擬支付結果：

```jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight, Home, ShoppingCart, User } from 'lucide-react';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import FeatureFlags from '../../services/featureFlagService';

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 從URL參數獲取支付結果
  const queryParams = new URLSearchParams(location.search);
  
  // 支持兩種參數格式：綠界原始格式和模擬支付格式
  const merchantTradeNo = queryParams.get('MerchantTradeNo') || queryParams.get('orderNumber');
  const rtnCode = queryParams.get('RtnCode'); // 綠界格式：1 為成功
  const rtnMsg = queryParams.get('RtnMsg');
  const isSuccess = rtnCode === '1' || queryParams.get('success') === 'true';
  const isSimulated = queryParams.get('simulatedPayment') === 'true';
  
  // useEffect 處理邏輯...
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* 頂部狀態條 */}
        <div className={`w-full h-2 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>
        
        <div className="p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-3">付款成功</h2>
              <p className="text-gray-600 mb-6">
                您的訂單已成功付款處理，謝謝您的購買！
                {isSimulated && FeatureFlags.isEnabled('DEBUG_MODE') && (
                  <span className="block mt-2 text-xs bg-gray-100 text-gray-500 p-1 rounded">
                    (模擬支付模式)
                  </span>
                )}
              </p>
              
              {/* 其他UI元素... */}
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                <XCircle size={40} className="text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-3">付款未完成</h2>
              <p className="text-gray-600 mb-6">
                很抱歉，您的付款處理未能完成。
              </p>
              
              {/* 其他UI元素... */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
```

檔案位置：`/projects/alanp/digital-concert-hall/frontend-client/src/pages/payment/PaymentResultPage.jsx`

### 5. 添加開發者工具頁面

創建一個開發者工具頁面，用於控制 Feature Flags：

```jsx
import React, { useState, useEffect } from 'react';
import FeatureFlags from '../../services/featureFlagService';

const DevToolsPage = () => {
  const [flags, setFlags] = useState({});
  
  useEffect(() => {
    // 獲取所有flags
    setFlags(FeatureFlags.getAllFlags());
  }, []);
  
  const toggleFlag = (flagName) => {
    const newValue = !flags[flagName];
    FeatureFlags.setFlag(flagName, newValue);
    setFlags({...flags, [flagName]: newValue});
  };
  
  const resetAllFlags = () => {
    FeatureFlags.resetAllFlags();
    setFlags(FeatureFlags.getAllFlags());
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">開發者工具</h1>
          <button 
            onClick={resetAllFlags}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            重置所有設置
          </button>
        </div>
        
        <div className="bg-gray-50 rounded p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
          
          <div className="space-y-4">
            {Object.keys(flags).map(flagName => (
              <div key={flagName} className="flex items-center justify-between p-3 border-b border-gray-200">
                <div>
                  <span className="font-medium">{flagName}</span>
                  {flagName === 'USE_REAL_PAYMENT' && (
                    <p className="text-sm text-gray-500 mt-1">
                      控制是否使用真實綠界支付或模擬支付
                    </p>
                  )}
                  {flagName === 'ENABLE_TICKET_GENERATION' && (
                    <p className="text-sm text-gray-500 mt-1">
                      控制是否在訂單完成後自動生成票券
                    </p>
                  )}
                  {flagName === 'DEBUG_MODE' && (
                    <p className="text-sm text-gray-500 mt-1">
                      啟用詳細日誌和開發調試功能
                    </p>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={flags[flagName]}
                    onChange={() => toggleFlag(flagName)}
                  />
                  <div className={`w-11 h-6 rounded-full peer ${flags[flagName] ? 'bg-blue-600' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded p-4">
          <h2 className="text-xl font-semibold mb-4">系統狀態</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">模式</div>
              <div className="font-medium">{process.env.NODE_ENV || 'development'}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">API 基礎路徑</div>
              <div className="font-medium truncate">{process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">支付模式</div>
              <div className="font-medium">{flags.USE_REAL_PAYMENT ? '真實支付' : '模擬支付'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevToolsPage;
```

檔案位置：`/projects/alanp/digital-concert-hall/frontend-client/src/pages/developer/DevToolsPage.jsx`

### 6. 修改路由配置

將開發者工具頁面添加到路由配置中：

```jsx
// 開發者工具頁面 - 僅在開發環境中可見
{process.env.NODE_ENV === 'development' && (
  <Route path="developer/tools" element={<DevToolsPage />} />
)}
```

檔案位置：`/projects/alanp/digital-concert-hall/frontend-client/src/router/AppRoutes.jsx`

## 使用方法

### 1. 開發環境中的支付測試

- 使用模擬支付：確保 `USE_REAL_PAYMENT` flag 設為 `false`（默認）
- 測試完整訂單流程

### 2. 切換到真實支付閘道

- 訪問 `/developer/tools` 頁面
- 將 `USE_REAL_PAYMENT` flag 設為 `true`
- 測試真實支付流程（需要綠界環境設置正確）

### 3. 調試模式

- 通過開發者工具頁面開啟 `DEBUG_MODE`
- 獲取更詳細的日誌和模擬支付提示

### Feature Flag 設置方式

這些 Feature Flag 設置是通過以下幾種方式來控制的：

1. **通過開發者工具頁面（圖形化界面）**：
   - 訪問 `/developer/tools` 頁面
   - 在此頁面上，您可以看到所有 Feature Flags 並通過切換開關來啟用或禁用它們
   - 這是最直觀、最推薦的方式

2. **通過修改代碼（預設值）**：
   - 編輯 `/frontend-client/src/services/featureFlagService.js` 文件中的預設值
   - 將 `USE_REAL_PAYMENT`, `DEBUG_MODE` 等值設為 `true` 或 `false`

3. **通過瀏覽器控制台（高級用戶）**：
   - 打開瀏覽器開發者工具（F12）
   - 在控制台中輸入：`localStorage.setItem('flag_USE_REAL_PAYMENT', 'true')` 來啟用真實支付
   - 或者輸入：`localStorage.setItem('flag_DEBUG_MODE', 'true')` 來啟用調試模式
   - 重新加載頁面使設置生效

通過開發者工具頁面或瀏覽器控制台設置的值會存儲在瀏覽器的 localStorage 中，它們會在當前瀏覽器中持續生效，除非您使用開發者工具頁面上的「重置所有設置」按鈕，或者手動清除瀏覽器的 localStorage。

## 方案優勢

1. **開發靈活性**：可隨時切換真實/模擬支付，無需修改代碼
2. **代碼結構完整**：保留了完整的支付流程架構
3. **易於維護**：Feature Flag框架可以未來用於其他功能
4. **簡化測試**：開發過程中使用模擬支付，減少對第三方服務的依賴

## 後續建議

1. **進一步測試**：
   - 測試訂單流程的各種場景（成功、失敗、超時等）
   - 確保票券生成正常工作

2. **生產環境配置**：
   - 在生產環境中預設 `USE_REAL_PAYMENT` 為 `true`
   - 考慮增加一個管理員界面來在生產環境中控制 Feature Flags

3. **持續整合**：
   - 隨著綠界支付問題的解決，繼續完善真實支付流程
   - 考慮添加更多的 Feature Flags 來控制其他功能

---

*本文檔由數位音樂廳開發團隊於 2025-04-02 生成，用於記錄支付功能改進方案的實作過程。*