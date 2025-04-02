# 用戶票券頁面代碼參考

本文檔提供了「我的票券」頁面實作的主要代碼結構，以便於日後參考和維護。

## 1. UserTicketsPage.jsx

用戶票券列表頁面，顯示用戶所有票券。

### 主要功能
- 顯示用戶所有票券的列表
- 支持分頁瀏覽
- 提供過濾功能（全部、有效、已使用、已過期）
- 處理載入狀態、空數據和錯誤情況

### 組件結構
```jsx
// 票券狀態標籤元件
const TicketStatusBadge = ({ status }) => {
  // 根據票券狀態返回不同的樣式和標籤文字
};

const UserTicketsPage = () => {
  // 狀態管理
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  // 載入票券數據
  const loadTickets = async () => {
    // 調用 API 獲取票券數據
  };

  // 頁面切換處理
  const handlePageChange = (newPage) => {
    // 更新頁碼，觸發重新載入
  };

  // 過濾處理
  const filterTickets = (filter) => {
    // 設置過濾條件
  };

  // 條件渲染：載入中
  if (loading && tickets.length === 0) {
    // 顯示載入指示器
  }

  // 條件渲染：出錯
  if (error) {
    // 顯示錯誤信息和可能的原因
  }

  // 條件渲染：無數據
  if (tickets.length === 0 && !loading) {
    // 顯示無票券提示
  }

  // 主要渲染邏輯
  return (
    <div>
      <h1>我的票券</h1>
      
      {/* 過濾選項 */}
      <div className="flex mb-6 border-b">
        {/* 過濾按鈕 */}
      </div>

      {/* 票券列表 */}
      <div className="space-y-4">
        {tickets.map(ticket => (
          <Link to={`/user/tickets/${ticket.id}`}>
            {/* 票券卡片 */}
          </Link>
        ))}
      </div>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          {/* 分頁控制按鈕 */}
        </div>
      )}
    </div>
  );
};
```

## 2. UserTicketDetailPage.jsx

票券詳情頁面，顯示單個票券的詳細信息。

### 主要功能
- 顯示票券的詳細信息（演出、時間、地點等）
- 根據票券狀態顯示不同內容（有效、已使用、已過期、已取消）
- 對於有效票券，顯示入場用 QR 碼
- 處理載入狀態、空數據和錯誤情況

### 組件結構
```jsx
const UserTicketDetailPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入票券詳情
  useEffect(() => {
    const loadTicketDetail = async () => {
      // 調用 API 獲取票券詳情
    };

    loadTicketDetail();
  }, [ticketId]);

  // 根據票券狀態獲取顯示詳情
  const getStatusDetails = (status) => {
    // 返回狀態相關信息
  };

  // 條件渲染：載入中
  if (loading) {
    // 顯示載入指示器
  }

  // 條件渲染：出錯
  if (error) {
    // 顯示錯誤信息和可能的原因
  }

  // 條件渲染：無數據
  if (!ticket) {
    // 顯示無票券提示
  }

  // 獲取狀態詳情
  const statusDetails = getStatusDetails(ticket.status);
  
  // 主要渲染邏輯
  return (
    <div>
      {/* 返回按鈕 */}
      
      {/* 票券狀態橫幅 */}
      
      {/* 票券主要資訊 */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        {/* 演出資訊 */}
        
        {/* 票券資訊 */}
      </div>
      
      {/* 根據票券狀態顯示不同內容 */}
      {ticket.status === 'VALID' && ticket.qrCode && (
        // QR碼進場區塊
      )}

      {ticket.status === 'CANCELED' && (
        // 取消的票券提示
      )}

      {ticket.status === 'USED' && (
        // 已使用的票券提示
      )}

      {ticket.status === 'EXPIRED' && (
        // 已過期的票券提示
      )}
    </div>
  );
};
```

## 3. dateUtils.js

日期格式化和處理工具函數。

### 主要功能
- 格式化日期時間
- 計算兩個日期之間的差距
- 檢查日期是否已過期
- 獲取相對時間描述
- 格式化持續時間

### 代碼結構
```javascript
/**
 * 格式化日期時間
 */
export const formatDate = (dateTime, options = { withTime: true }) => {
  // 格式化日期時間為字符串
};

/**
 * 計算兩個日期之間的差距（天數）
 */
export const daysBetween = (date1, date2) => {
  // 計算兩個日期之間的天數差距
};

/**
 * 檢查日期是否已過期（早於當前時間）
 */
export const isExpired = (date) => {
  // 檢查日期是否已過期
};

/**
 * 獲取相對時間描述（例如：3天前、剛剛）
 */
export const getRelativeTime = (date) => {
  // 返回相對時間描述
};

/**
 * 格式化持續時間（分鐘轉為小時和分鐘）
 */
export const formatDuration = (minutes) => {
  // 格式化時間持續時間
};
```

## 4. 路由配置 (AppRoutes.jsx 的更新)

添加票券相關路由。

```jsx
// 票券頁面導入
import UserTicketsPage from '../pages/user/UserTicketsPage';
import UserTicketDetailPage from '../pages/user/UserTicketDetailPage';

// 用戶相關頁面
<Route path="/user" element={<UserLayout />}>
  <Route path="orders" element={<PrivateRoute><UserOrdersPage /></PrivateRoute>} />
  <Route path="orders/:orderNumber" element={<PrivateRoute><UserOrderDetailPage /></PrivateRoute>} />
  <Route path="tickets" element={<PrivateRoute><UserTicketsPage /></PrivateRoute>} />
  <Route path="tickets/:ticketId" element={<PrivateRoute><UserTicketDetailPage /></PrivateRoute>} />
</Route>
```

## 5. API 服務 (ticketService.js)

票券相關 API 服務。

```javascript
import authService from './authService';
import { validateApiPath } from '../utils/apiUtils';

const API_BASE_PATH = '/api/users/me/tickets';
const { axiosInstance } = authService;

// 獲取用戶所有票券（分頁）
const getUserTickets = async (page = 0, size = 10) => {
  const path = validateApiPath(`${API_BASE_PATH}?page=${page}&size=${size}`);
  return axiosInstance.get(path);
};

// 獲取特定票券詳情（包含QR碼）
const getTicketDetail = async (ticketId) => {
  const path = validateApiPath(`${API_BASE_PATH}/${ticketId}`);
  return axiosInstance.get(path);
};

const TicketService = {
  getUserTickets,
  getTicketDetail
};

export default TicketService;
```

## 6. 特別注意事項

1. 後端 API 的實現狀態：
   - `getUserTickets` 方法已實現
   - `getUserTicketDetail` 方法目前僅有空實現（TODO 標記）

2. 前端容錯處理：
   - 已加入適當的加載狀態顯示
   - 已加入錯誤處理和友好提示
   - 考慮了資料格式可能存在的差異（例如 `ticket.concertTitle` 或 `ticket.concert?.title`）

3. 未來可能需要的更新：
   - 當後端完成 API 實現後，可能需要調整資料解析邏輯
   - 過濾功能目前僅為 UI 元素，實際功能可能需要與後端配合實現
