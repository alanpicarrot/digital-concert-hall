# 數位音樂廳專案 - 前後端API整合問題排解

## 問題描述與解決方案記錄

### 問題一：API路徑前綴問題（演出場次保存失敗）

**錯誤訊息**：
```
保存失敗: 發生錯誤: No static resource api/admin/concerts
```

**問題分析**：
後端應用在 `application.properties` 中設定 `server.servlet.context-path=/api`，這表示所有後端API路徑都自動添加了 `/api` 前綴。而前端服務中，在 `authService.js` 中又設定 `API_BASE = ${API_URL}/api`，並在各個服務中仍然使用了 `/api/admin/concerts` 格式的路徑，導致實際請求路徑變成 `/api/api/admin/...`。

**解決方案**：
修改所有admin服務檔案，移除路徑中的 `/api` 前綴，讓axiosInstance自動處理前綴。

```javascript
// 修改前
const getAllConcerts = () => {
  return axiosInstance.get('/api/admin/concerts');
};

// 修改後
const getAllConcerts = () => {
  return axiosInstance.get('/admin/concerts');
};
```

修改的檔案包括：
- `concertService.js`
- `performanceService.js`
- `ticketService.js`
- `ticketTypeService.js`
- `adminUserService.js`

### 問題二：JSON序列化無限遞迴（演出場次創建）

**錯誤訊息**：
```
Runtime exception: Could not write JSON: Infinite recursion (StackOverflowError)
```

**問題分析**：
後端實體類之間存在循環引用關係。`Concert` 有一個 `performances` 列表，每個 `Performance` 又引用回它的 `concert`，導致Jackson序列化時陷入無限遞迴。

**解決方案**：
使用 Jackson的 `@JsonManagedReference` 和 `@JsonBackReference` 註解處理循環引用：

1. 在 `Concert` 類的 `performances` 列表上添加 `@JsonManagedReference`
2. 在 `Performance` 類的 `concert` 屬性上添加 `@JsonBackReference`
3. 在 `Performance` 類中添加 `getConcertId()` 方法，方便前端獲取關聯ID
4. 在 `Performance` 類的 `tickets` 列表上添加 `@JsonIgnore`
5. 在 `Ticket` 類的 `performance` 屬性上添加 `@JsonBackReference`

```java
// Concert.java
@OneToMany(mappedBy = "concert", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
@JsonManagedReference
private List<Performance> performances = new ArrayList<>();

// Performance.java
@ManyToOne
@JoinColumn(name = "concert_id", nullable = false)
@JsonBackReference
private Concert concert;

// 添加便捷方法
public Long getConcertId() {
    return concert != null ? concert.getId() : null;
}

@OneToMany(mappedBy = "performance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
@JsonIgnore
private List<Ticket> tickets = new ArrayList<>();
```

### 問題三：前端數據處理問題（performances.map is not a function）

**錯誤訊息**：
```
ERROR performances.map is not a function TypeError: performances.map is not a function
```

**問題分析**：
後端返回的數據格式與前端預期的不一致，導致 `performances` 變數不是陣列。

**解決方案**：
1. 增強前端數據處理能力：
   - 添加類型檢查，確保 `performances` 始終是陣列
   - 添加詳細的日誌記錄
   - 處理可能的 null 值

```javascript
// 修改 loadPerformances 函數確保處理各種數據格式
const loadPerformances = async (concertId) => {
  if (!concertId) return;
  
  try {
    setLoading(true);
    const response = await PerformanceService.getPerformancesByConcertId(concertId);
    console.log('API Response:', response);
    console.log('Response data type:', typeof response.data, Array.isArray(response.data));
    
    // 確保資料是陣列
    const performancesArray = Array.isArray(response.data) ? response.data : 
                              (response.data && Array.isArray(response.data.content)) ? response.data.content : 
                              [];
                             
    console.log('Processed performances array:', performancesArray);
    setPerformances(performancesArray);
    setError(null);
  } catch (err) {
    console.error('API Error:', err);
    setError('無法加載演出場次：' + (err.response?.data?.message || err.message));
    setPerformances([]); // 確保即使發生錯誤，也會設置為空陣列
  } finally {
    setLoading(false);
  }
};
```

2. 改進日期時間處理：
   - 優先使用 `startTime` 字段，然後再使用 `performanceDateTime`
   - 處理可能的日期解析錯誤

```javascript
// 改進日期時間處理
let formattedDateTime = '';
try {
  // 優先使用 startTime，如果不存在則使用 performanceDateTime
  const dateTime = new Date(performance.startTime || performance.performanceDateTime);
  formattedDateTime = dateTime.toISOString().slice(0, 16);
} catch (err) {
  console.error('Date formatting error:', err, performance);
  // 使用當前時間作為備用
  formattedDateTime = new Date().toISOString().slice(0, 16);
}
```

3. 增強 concertId 處理：
   - 添加對不同數據結構的支持
   - 更好的類型處理

```javascript
// 確保 concertId 的一致性
const concertId = performance.concertId || 
                 (performance.concert ? performance.concert.id : null) || 
                 selectedConcertId;
```

4. 在 `performanceService.js` 中改進請求數據處理：
   - 確保 `concertId` 是數字
   - 處理可能為 null 的字段

```javascript
// 創建新演出場次
const createPerformance = (performanceData) => {
  // 將前端的資料模型轉換為後端需要的模型
  const requestData = {
    concertId: Number(performanceData.concertId), // 確保是數字
    startTime: performanceData.performanceDateTime,
    // 使用 performanceDateTime 和 duration 計算 endTime
    endTime: calculateEndTime(performanceData.performanceDateTime, performanceData.duration),
    venue: performanceData.venue || '數位音樂廳主廳',
    status: performanceData.status,
    livestreamUrl: performanceData.streamingUrl || null,
    recordingUrl: performanceData.recordingUrl || null
  };
  
  console.log('Sending performance creation request:', requestData);
  return axiosInstance.post('/admin/performances', requestData);
};
```

## 結論

這些修改解決了數位音樂廳專案中的幾個關鍵問題：

1. 前後端API路徑配置不匹配
2. 實體類之間的循環引用導致序列化問題
3. 前端數據處理不夠健壯

透過這些修改，我們確保了：

- 前端能夠正確連接到後端API
- 後端能夠正確序列化和反序列化數據
- 前端能夠處理各種可能的數據結構和錯誤情況

這些修改顯著提高了應用的穩定性和可靠性，確保了音樂會和演出場次的創建和管理功能能夠正常運作。

## 技術要點摘要

1. **API路徑管理**：確保前後端的API路徑一致，避免重複前綴
2. **JSON序列化處理**：使用 `@JsonManagedReference`、`@JsonBackReference` 和 `@JsonIgnore` 正確處理循環引用
3. **前端數據防禦式編程**：增加類型檢查、錯誤處理和默認值
4. **日期時間處理**：安全地處理日期時間格式化和解析
5. **中間層數據轉換**：確保前端發送給後端的數據符合後端的期望格式
