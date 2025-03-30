/**
 * 前端健壯性代碼模式示例
 * 
 * 本文件展示數位音樂廳專案中用於增強前端代碼健壯性的各種模式
 */

// =====================================================
// 1. API 數據處理的防禦性編程模式
// =====================================================

/**
 * 加載演出場次 - 防禦式處理API返回數據
 * 確保即使API返回意外格式，也不會導致前端崩潰
 */
const loadPerformances = async (concertId) => {
  if (!concertId) return;
  
  try {
    setLoading(true);
    const response = await PerformanceService.getPerformancesByConcertId(concertId);
    
    // 詳細記錄API響應數據，便於診斷問題
    console.log('API Response:', response);
    console.log('Response data type:', typeof response.data, Array.isArray(response.data));
    
    // 多層次數據結構檢查和適配
    const performancesArray = Array.isArray(response.data) ? response.data : 
                             (response.data && Array.isArray(response.data.content)) ? response.data.content : 
                             [];
                             
    console.log('Processed performances array:', performancesArray);
    setPerformances(performancesArray);
    setError(null);
  } catch (err) {
    // 詳細記錄錯誤並提供友好的用戶提示
    console.error('API Error:', err);
    setError('無法加載演出場次：' + (err.response?.data?.message || err.message));
    setPerformances([]); // 確保即使發生錯誤，也將狀態設置為有效值
  } finally {
    setLoading(false);
  }
};

// =====================================================
// 2. 日期處理的防禦性編程模式
// =====================================================

/**
 * 處理日期時間格式化，對各種錯誤情況進行處理
 */
const formatDateSafely = (dateValue) => {
  let formattedDateTime = '';
  try {
    // 優先使用 startTime，如果不存在則嘗試 performanceDateTime
    const dateTime = new Date(dateValue.startTime || dateValue.performanceDateTime);
    
    // 檢查日期是否有效
    if (isNaN(dateTime.getTime())) {
      throw new Error('Invalid date value');
    }
    
    formattedDateTime = dateTime.toISOString().slice(0, 16);
  } catch (err) {
    console.error('Date formatting error:', err, dateValue);
    // 使用當前時間作為備用值，確保UI不會崩潰
    formattedDateTime = new Date().toISOString().slice(0, 16);
  }
  return formattedDateTime;
};

// =====================================================
// 3. 多級屬性安全訪問模式
// =====================================================

/**
 * 安全地訪問多級嵌套屬性，處理各種可能的空值
 */
const getConcertIdSafely = (performance, defaultId) => {
  // 優先嘗試直接屬性
  if (performance?.concertId) {
    return performance.concertId;
  }
  
  // 然後嘗試從關聯對象獲取
  if (performance?.concert?.id) {
    return performance.concert.id;
  }
  
  // 最後使用默認值
  return defaultId || null;
};

// 使用示例
const concertId = getConcertIdSafely(performance, selectedConcertId);

// =====================================================
// 4. API 請求數據預處理模式
// =====================================================

/**
 * 發送請求前確保數據類型正確，處理默認值
 */
const createPerformance = (performanceData) => {
  // 轉換前端數據模型為後端期望的格式
  const requestData = {
    concertId: Number(performanceData.concertId), // 確保是數字類型
    startTime: performanceData.performanceDateTime,
    endTime: calculateEndTime(performanceData.performanceDateTime, performanceData.duration),
    venue: performanceData.venue || '數位音樂廳主廳', // 提供默認值
    status: performanceData.status,
    livestreamUrl: performanceData.streamingUrl || null, // 處理可能為空的字段
    recordingUrl: performanceData.recordingUrl || null
  };
  
  // 記錄實際發送的請求數據，便於調試
  console.log('Sending performance creation request:', requestData);
  return axiosInstance.post('/admin/performances', requestData);
};

// =====================================================
// 5. 狀態顯示的安全處理模式
// =====================================================

/**
 * 根據狀態安全地顯示狀態文本，處理未知狀態
 */
const getStatusDisplay = (status) => {
  const statusMap = {
    'scheduled': '已排程',
    'active': '上架中',
    'live': '直播中',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  
  // 使用映射表獲取顯示文本，如果未找到則提供默認值
  return statusMap[status] || '未知狀態';
};

// 使用示例
<span className="status-badge">
  {getStatusDisplay(performance.status)}
</span>

/**
 * 最佳實踐總結：
 * 
 * 1. 始終使用 try-catch 包裝可能出錯的代碼
 * 2. 對API返回的數據進行類型檢查和結構檢查
 * 3. 提供詳細的日誌輸出，幫助診斷問題
 * 4. 為空值或未定義值提供合理的默認值
 * 5. 在處理嵌套數據結構時，使用可選鏈操作符 (?.)
 * 6. 對於重要的數據轉換和驗證邏輯，抽取為獨立函數
 * 7. 記錄發送和接收的數據，便於調試
 * 8. 使用映射表處理枚举值的顯示
 */
