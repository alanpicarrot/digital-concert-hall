# 支付功能實施指南

本文檔提供數位音樂廳專案中支付功能修改的實施步驟和注意事項，幫助開發團隊順利完成代碼改造。

## 前置準備

在開始實施前，請確保：

1. 開發環境已設置正確
2. 所有相關服務都可以正常啟動
3. 代碼庫已更新到最新版本並無未提交的更改
4. 後端依賴已正確安裝
5. 前端依賴已正確安裝

## 實施順序

為了減少整合問題，建議按照以下順序進行修改：

1. 後端模擬支付端點
2. 前端 Feature Flag 服務
3. 前端支付服務修改
4. 前端支付結果頁面修改
5. 開發者工具頁面（可選）

## 詳細步驟

### 1. 後端模擬支付端點

#### a. 修改 PaymentController.java

在 `backend/src/main/java/.../controller/PaymentController.java` 中添加模擬支付端點：

```java
/**
 * 模擬支付端點
 * 用於開發和測試階段，模擬支付處理
 */
@PostMapping("/mock-payment")
@CrossOrigin(origins = "*", maxAge = 3600)
@Transactional
public ResponseEntity<ApiResponse> mockPayment(@RequestParam String orderNumber) {
    try {
        logger.info("模擬支付請求: 訂單號 " + orderNumber);
        
        // 查找訂單
        Order order = orderService.findByOrderNumber(orderNumber);
        if (order == null) {
            logger.warning("模擬支付失敗: 找不到訂單 " + orderNumber);
            return ResponseEntity.badRequest().body(new ApiResponse(false, "訂單不存在"));
        }
        
        // 更新訂單狀態
        order.setStatus(OrderStatus.PAID);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaymentDate(new Date());
        orderRepository.save(order);
        
        logger.info("訂單狀態已更新為已支付: " + orderNumber);
        
        // 生成票券
        try {
            ticketService.generateTicketsForOrder(order);
            logger.info("已為訂單生成票券: " + orderNumber);
        } catch (Exception e) {
            logger.severe("生成票券時出錯: " + e.getMessage());
        }
        
        return ResponseEntity.ok(new ApiResponse(true, "支付模擬成功"));
    } catch (Exception e) {
        logger.severe("模擬支付處理過程中出錯: " + e.getMessage());
        return ResponseEntity.badRequest().body(new ApiResponse(false, "支付模擬失敗: " + e.getMessage()));
    }
}
```

#### b. 重啟後端服務

修改完成後，重啟後端服務以應用變更：

```bash
cd /projects/alanp/digital-concert-hall
kill -9 $(cat .backend.pid)
cd backend
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx1g" > ../backend.log 2>&1 & echo $! > ../.backend.pid
```

### 2. 前端 Feature Flag 服務

#### a. 創建 featureFlagService.js

在 `frontend-client/src/services/` 目錄下創建 `featureFlagService.js` 文件：

```bash
cd /projects/alanp/digital-concert-hall/frontend-client/src/services/
touch featureFlagService.js
```

編輯該文件，添加代碼：

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
    
    // 否則返回預設值
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

### 3. 前端支付服務修改

#### a. 修改 paymentService.js

在 `frontend-client/src/services/paymentService.js` 中更新代碼：

```javascript
// 引入 Feature Flag 服務
import FeatureFlags from './featureFlagService';
import authService from './authService';

const API_BASE_PATH = '/api/payment';
const { axiosInstance } = authService;

// 更新創建支付訂單方法
const createPayment = async (orderNumber) => {
  try {
    // 使用Feature Flag決定使用哪種支付方式
    if (FeatureFlags.isEnabled('USE_REAL_PAYMENT')) {
      // 使用真實綠界支付
      console.log('使用真實支付閘道');
      const path = `/api/payment/ecpay/create?orderNumber=${orderNumber}`;
      const response = await axiosInstance.post(path);
      return response.data;
    } else {
      // 使用模擬支付
      console.log('使用模擬支付閘道');
      const path = `/api/payment/mock-payment?orderNumber=${orderNumber}`;
      
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

// 保留其他現有方法
// ...

const PaymentService = {
  createPayment,
  // 其他方法...
};

export default PaymentService;
```

### 4. 前端支付結果頁面修改

#### a. 修改 PaymentResultPage.jsx

修改 `frontend-client/src/pages/payment/PaymentResultPage.jsx` 以處理模擬支付結果：

```jsx
// 在文件頂部引入 Feature Flag 服務
import FeatureFlags from '../../services/featureFlagService';

// 找到處理支付結果的 useEffect
useEffect(() => {
  const processPaymentResult = async () => {
    try {
      setLoading(true);
      
      // 獲取URL參數
      const merchantTradeNo = searchParams.get('orderNumber');
      const isSuccess = searchParams.get('success') === 'true';
      const isSimulated = searchParams.get('simulatedPayment') === 'true';
      
      setOrderNumber(merchantTradeNo);
      
      // 如果沒有訂單號，則導航到訂單頁面
      if (!merchantTradeNo) {
        navigate('/user/orders');
        return;
      }
      
      console.log('處理支付結果:', { 
        merchantTradeNo, 
        isSuccess, 
        isSimulated 
      });
      
      // 檢查是否為模擬支付
      if (isSimulated) {
        console.log('檢測到模擬支付結果');
        // 模擬支付已在後端完成處理，直接設置成功
        setSuccess(true);
        setLoading(false);
        return;
      }
      
      // 以下是現有的真實支付處理邏輯
      // ...
    } catch (error) {
      console.error('處理支付結果時出錯:', error);
      setError('處理支付結果時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  processPaymentResult();
}, [searchParams, navigate]);
```

### 5. 開發者工具頁面（可選）

#### a. 創建開發者工具目錄和頁面

```bash
cd /projects/alanp/digital-concert-hall/frontend-client/src/pages
mkdir -p developer
touch developer/DevToolsPage.jsx
```

#### b. 編輯 DevToolsPage.jsx

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

#### c. 更新路由配置

在 `AppRoutes.jsx` 中添加開發者工具頁面的路由：

```jsx
// 先引入開發者工具頁面組件
import DevToolsPage from '../pages/developer/DevToolsPage';

// 在路由配置中添加（僅在開發環境中可見）
{process.env.NODE_ENV === 'development' && (
  <Route path="/developer/tools" element={<DevToolsPage />} />
)}
```

### 6. 重啟前端服務

完成所有修改後，重啟前端服務以應用變更：

```bash
cd /projects/alanp/digital-concert-hall
kill -9 $(cat .frontend-client.pid)
cd frontend-client
npm run start > ../frontend-client.log 2>&1 & echo $! > ../.frontend-client.pid
```

## 測試方案

### 1. 基本支付流程測試

1. 創建新訂單
2. 進入結帳頁面
3. 確認使用模擬支付（Feature Flag 為 false）
4. 點擊支付按鈕
5. 驗證是否跳轉到支付結果頁面
6. 驗證訂單狀態是否更新為已支付
7. 驗證是否生成了票券

### 2. 開發者工具測試

1. 訪問 `/developer/tools` 頁面
2. 測試切換 Feature Flag 功能
3. 啟用真實支付模式進行測試（如果有測試環境的綠界支付）
4. 再次切換回模擬支付模式

### 3. 異常情況測試

1. 測試網絡斷開時的處理
2. 測試後端服務異常時的錯誤提示
3. 測試支付失敗時的用戶體驗

## 常見問題與處理

### 1. 後端API路徑不匹配

問題：前端請求的API路徑與後端定義的不一致
解決：檢查API路徑配置，確保前後端一致

### 2. 跨域問題

問題：模擬支付API返回跨域錯誤
解決：確保後端API有正確的CORS配置 (`@CrossOrigin`)

### 3. 訂單狀態未更新

問題：支付成功但訂單狀態未更新
解決：檢查交易過程中的日誌，確認事務是否正確提交

### 4. 票券未生成

問題：訂單狀態已更新但未生成票券
解決：檢查 `ticketService.generateTicketsForOrder` 實現

## 後續優化建議

1. 完善日誌記錄，便於排查問題
2. 添加更多的Feature Flags以控制其他功能
3. 為模擬支付添加故意延遲的選項，更接近真實場景
4. 考慮添加支付重試機制和幂等性處理
5. 完善錯誤處理和用戶提示
