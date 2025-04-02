# 支付功能實作方案：Feature Flag + 模擬支付閘道

本文檔提供數位音樂廳專案中支付功能的實作方案，採用Feature Flag與模擬支付閘道結合的方式，以簡化開發流程並保持代碼結構的完整性。

## 方案概述

目前綠界支付整合遇到問題：即使進行了修復，前台仍無法產生成功的訂單，且交易無法連動到後台。為解決此問題，我們採用**方案3（Feature Flag）結合方案2的部分元素**：

1. 使用Feature Flag框架管理支付模式的切換
2. 實現一個簡化但結構完整的模擬支付閘道
3. 保留已有的綠界支付代碼，但在此階段通過Flag禁用它

## 實作步驟

### 1. 建立Feature Flag服務

在前端創建Feature Flag服務，用於控制支付模式：

```javascript
// 在frontend-client/src/services/featureFlagService.js
const FeatureFlags = {
  // 支付相關
  USE_REAL_PAYMENT: false, // 開發階段設為false
  
  // 其他功能flags可在此添加
  ENABLE_TICKET_GENERATION: true,
  
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
  }
};

export default FeatureFlags;
```

### 2. 在後端實現模擬支付閘道

在PaymentController.java中添加模擬支付端點：

```java
// 在PaymentController.java添加模擬支付端點
@PostMapping("/mock-payment")
@CrossOrigin(origins = "*", maxAge = 3600)
public ResponseEntity<ApiResponse> mockPayment(@RequestParam String orderNumber) {
    try {
        logger.info("模擬支付請求: 訂單號 {}", orderNumber);
        
        // 查找訂單
        Order order = orderService.findByOrderNumber(orderNumber);
        if (order == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "訂單不存在"));
        }
        
        // 更新訂單狀態
        order.setStatus(OrderStatus.PAID);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaymentDate(new Date());
        orderRepository.save(order);
        
        // 生成票券
        ticketService.generateTicketsForOrder(order);
        
        logger.info("模擬支付成功: 訂單號 {}, 已生成票券", orderNumber);
        
        return ResponseEntity.ok(new ApiResponse(true, "支付模擬成功"));
    } catch (Exception e) {
        logger.error("模擬支付失敗: {}", e.getMessage(), e);
        return ResponseEntity.badRequest().body(new ApiResponse(false, "支付模擬失敗: " + e.getMessage()));
    }
}
```

### 3. 修改支付服務，使用Feature Flag控制

更新前端支付服務，使用Feature Flag來控制使用真實支付還是模擬支付：

```javascript
// 在frontend-client/src/services/paymentService.js
import FeatureFlags from './featureFlagService';
import authService from './authService';

const API_BASE_PATH = '/api/payment';
const { axiosInstance } = authService;

// 創建支付訂單
const createPayment = async (orderNumber) => {
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
    const response = await axiosInstance.post(path);
    return {
      success: true,
      message: '模擬支付已處理',
      paymentUrl: `/payment/result?orderNumber=${orderNumber}&success=true&simulatedPayment=true`
    };
  }
};

// 其他方法...

const PaymentService = {
  createPayment,
  // 其他方法...
};

export default PaymentService;
```

### 4. 更新付款結果頁面處理

修改PaymentResultPage.jsx以處理模擬支付結果：

```javascript
// 在PaymentResultPage.jsx
import FeatureFlags from '../services/featureFlagService';

// 在useEffect中
useEffect(() => {
  const processPaymentResult = async () => {
    try {
      setLoading(true);
      
      // 檢查是否為模擬支付
      const isSimulated = searchParams.get('simulatedPayment') === 'true';
      
      if (isSimulated) {
        // 模擬支付已在後端完成處理，直接設置成功
        setSuccess(true);
        setLoading(false);
        return;
      }
      
      // 以下是真實支付處理邏輯
      // ...現有代碼...
      
    } catch (error) {
      console.error('處理支付結果時出錯:', error);
      setError('處理支付結果時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  processPaymentResult();
}, [searchParams, navigateTo]);
```

### 5. 新增開發者工具頁面（可選）

創建一個開發者工具頁面，用於控制Feature Flags：

```jsx
// 在DevToolsPage.jsx
import React, { useState, useEffect } from 'react';
import FeatureFlags from '../services/featureFlagService';

const DevToolsPage = () => {
  const [flags, setFlags] = useState({});
  
  useEffect(() => {
    // 獲取所有flags
    const allFlags = {};
    Object.keys(FeatureFlags).forEach(key => {
      if (typeof FeatureFlags[key] !== 'function') {
        allFlags[key] = FeatureFlags.isEnabled(key);
      }
    });
    setFlags(allFlags);
  }, []);
  
  const toggleFlag = (flagName) => {
    const newValue = !flags[flagName];
    FeatureFlags.setFlag(flagName, newValue);
    setFlags({...flags, [flagName]: newValue});
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">開發者工具</h1>
      
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Feature Flags</h2>
        
        <div className="space-y-2">
          {Object.keys(flags).map(flagName => (
            <div key={flagName} className="flex items-center justify-between p-2 border-b">
              <span>{flagName}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={flags[flagName]}
                  onChange={() => toggleFlag(flagName)}
                />
                <div className={`w-11 h-6 rounded-full peer ${flags[flagName] ? 'bg-blue-600' : 'bg-gray-200'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevToolsPage;
```

## 方案優勢

1. **開發靈活性**：可隨時切換真實/模擬支付，無需修改代碼
2. **代碼結構完整**：保留了完整的支付流程架構
3. **易於維護**：Feature Flag框架可以未來用於其他功能
4. **簡化測試**：開發過程中使用模擬支付，減少對第三方服務的依賴

## 實施建議

1. 先實現Feature Flag框架和模擬支付閘道
2. 測試訂單到票券的完整流程，確保資料流正確
3. 在開發和測試環境中使用模擬支付
4. 待基本功能穩定後，逐步整合真實的綠界支付

## 後續維護

1. 保持Feature Flag框架的更新，適應新需求
2. 定期檢查模擬支付與真實支付之間的差異，確保兼容性
3. 在上線前進行真實支付的完整測試
