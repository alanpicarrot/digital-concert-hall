# 支付功能實作代碼範例

本文檔提供數位音樂廳專案中支付功能實作的詳細代碼範例，可作為開發參考。

## 前端代碼範例

### 1. Feature Flag 服務 (featureFlagService.js)

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

### 2. 修改支付服務 (paymentService.js)

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

/**
 * 查詢支付狀態
 * @param {string} orderNumber - 訂單編號
 * @returns {Promise<Object>} - 支付狀態
 */
const getPaymentStatus = async (orderNumber) => {
  try {
    const path = `/api/payment/status?orderNumber=${orderNumber}`;
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

### 3. 修改支付結果頁面 (PaymentResultPage.jsx)

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FeatureFlags from '../services/featureFlagService';
import authService from '../services/authService';
import { Link } from 'react-router-dom';

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  
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
        
        // 真實支付邏輯
        if (isSuccess) {
          console.log('支付成功，通知後端更新訂單狀態');
          
          // 在開發環境中，調用test-notify API來更新訂單狀態
          if (process.env.NODE_ENV === 'development') {
            try {
              // 使用普通的fetch而非帶有驗證信息的axiosInstance
              const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/payment/ecpay/test-notify?orderNumber=${merchantTradeNo}&success=true`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('使用fetch調用結果:', response.status);
              
              if (response.ok) {
                console.log('訂單狀態已更新為已支付');
                setSuccess(true);
              } else {
                setError('支付通知處理失敗');
              }
            } catch (fetchError) {
              console.error('使用fetch更新訂單狀態失敗:', fetchError);
              setError('支付通知處理失敗');
            }
          } else {
            // 生產環境中，假設綠界已經通過後端回調更新了訂單狀態
            setSuccess(true);
          }
        } else {
          setError('支付處理失敗');
        }
      } catch (error) {
        console.error('處理支付結果時出錯:', error);
        setError('處理支付結果時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [searchParams, navigate]);
  
  // 顯示載入中狀態
  if (loading) {
    return (
      <div className="container mx-auto my-8 p-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <h2 className="text-xl font-semibold">處理支付結果中...</h2>
        </div>
      </div>
    );
  }
  
  // 顯示成功狀態
  if (success) {
    return (
      <div className="container mx-auto my-8 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">支付成功</h2>
            <p className="text-gray-600 text-center">
              您的訂單已支付成功！
              <br />訂單編號: {orderNumber}
            </p>
            <div className="flex space-x-4 mt-4">
              <Link to={`/user/orders/${orderNumber}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                查看訂單
              </Link>
              <Link to="/user/tickets" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                查看票券
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 顯示錯誤狀態
  return (
    <div className="container mx-auto my-8 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">支付失敗</h2>
          <p className="text-gray-600 text-center">
            {error || '處理您的支付時發生錯誤'}
            <br />訂單編號: {orderNumber}
          </p>
          <div className="flex space-x-4 mt-4">
            <Link to={`/user/orders/${orderNumber}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              查看訂單
            </Link>
            <Link to="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
```

### 4. 開發者工具頁面 (DevToolsPage.jsx)

```jsx
import React, { useState, useEffect } from 'react';
import FeatureFlags from '../services/featureFlagService';

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

## 後端代碼範例

### 1. 模擬支付控制器 (PaymentController.java)

```java
// 在現有的PaymentController.java中添加

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.logging.Logger;

// 現有的控制器定義
@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    
    private static final Logger logger = Logger.getLogger(PaymentController.class.getName());
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private TicketService ticketService;
    
    // 現有的方法...
    
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
                // 不要因為票券生成失敗而回滾整個交易
                // 可以在此添加重試邏輯或通知機制
            }
            
            return ResponseEntity.ok(new ApiResponse(true, "支付模擬成功"));
        } catch (Exception e) {
            logger.severe("模擬支付處理過程中出錯: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, "支付模擬失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 獲取訂單支付狀態
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse> getPaymentStatus(@RequestParam String orderNumber) {
        try {
            Order order = orderService.findByOrderNumber(orderNumber);
            if (order == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "訂單不存在"));
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("orderNumber", order.getOrderNumber());
            data.put("paymentStatus", order.getPaymentStatus().toString());
            data.put("orderStatus", order.getStatus().toString());
            data.put("paymentDate", order.getPaymentDate());
            
            return ResponseEntity.ok(new ApiResponse(true, "獲取支付狀態成功", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "獲取支付狀態失敗: " + e.getMessage()));
        }
    }
}
```

### 2. 修改路由配置 (AppRoutes.jsx)

將開發者工具頁面添加到路由中：

```jsx
// 在前端的AppRoutes.jsx中添加
import DevToolsPage from '../pages/developer/DevToolsPage';

// 在路由配置中添加
<Routes>
  {/* 其他路由... */}
  
  {/* 開發者工具頁面 - 僅在開發環境中可見 */}
  {process.env.NODE_ENV === 'development' && (
    <Route path="/developer/tools" element={<DevToolsPage />} />
  )}
  
  {/* 其他路由... */}
</Routes>
```

### 3. 更新訂單服務 (OrderService.java)

優化訂單支付處理：

```java
// 在OrderService.java中添加或更新

@Service
public class OrderServiceImpl implements OrderService {
    
    private static final Logger logger = Logger.getLogger(OrderServiceImpl.class.getName());
    
    // 其他方法...
    
    /**
     * 處理訂單支付成功
     */
    @Override
    @Transactional
    public Order processPaymentSuccess(String orderNumber) throws Exception {
        logger.info("處理訂單支付成功: " + orderNumber);
        
        Order order = findByOrderNumber(orderNumber);
        if (order == null) {
            throw new Exception("訂單不存在: " + orderNumber);
        }
        
        // 檢查訂單狀態，避免重複處理
        if (OrderStatus.PAID.equals(order.getStatus()) || PaymentStatus.PAID.equals(order.getPaymentStatus())) {
            logger.info("訂單已經支付，跳過處理: " + orderNumber);
            return order;
        }
        
        // 更新訂單狀態
        order.setStatus(OrderStatus.PAID);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaymentDate(new Date());
        
        // 保存更新
        Order savedOrder = orderRepository.save(order);
        logger.info("訂單狀態已更新為已支付: " + orderNumber);
        
        // 返回更新後的訂單
        return savedOrder;
    }
    
    /**
     * 處理訂單支付失敗
     */
    @Override
    @Transactional
    public Order processPaymentFailure(String orderNumber, String failureReason) throws Exception {
        logger.info("處理訂單支付失敗: " + orderNumber + ", 原因: " + failureReason);
        
        Order order = findByOrderNumber(orderNumber);
        if (order == null) {
            throw new Exception("訂單不存在: " + orderNumber);
        }
        
        // 更新訂單狀態
        order.setPaymentStatus(PaymentStatus.FAILED);
        order.setPaymentNote(failureReason);
        
        // 保存更新
        Order savedOrder = orderRepository.save(order);
        logger.info("訂單狀態已更新為支付失敗: " + orderNumber);
        
        // 返回更新後的訂單
        return savedOrder;
    }
}
```

## 實施步驟

1. 添加Feature Flag服務
   - 創建 `frontend-client/src/services/featureFlagService.js`
   - 添加基本的flags和管理方法

2. 修改支付服務
   - 更新 `frontend-client/src/services/paymentService.js`
   - 添加對Feature Flag的支持

3. 添加後端模擬支付控制器
   - 修改 `backend/src/main/java/com/your/package/controller/PaymentController.java`
   - 添加模擬支付端點

4. 修改訂單處理服務
   - 更新 `backend/src/main/java/com/your/package/service/OrderServiceImpl.java`
   - 優化訂單支付處理邏輯

5. 添加開發者工具頁面
   - 創建 `frontend-client/src/pages/developer/DevToolsPage.jsx`
   - 更新路由配置以包含此頁面

6. 測試支付流程
   - 測試使用模擬支付
   - 測試訂單狀態更新
   - 測試票券生成
