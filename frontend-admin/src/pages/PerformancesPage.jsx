import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PerformanceService from '../services/admin/performanceService';
import ConcertService from '../services/admin/concertService';

const PerformancesPage = () => {
  // 新增錯誤處理
  console.log('PerformancesPage component initialized');
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const concertIdFromUrl = queryParams.get('concertId');

  const [performances, setPerformances] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConcertId, setSelectedConcertId] = useState(concertIdFromUrl || '');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentPerformance, setCurrentPerformance] = useState({
    concertId: concertIdFromUrl || '',
    performanceDateTime: '',
    duration: 120,
    streamingUrl: '',
    venue: '數位音樂廳主廳',  // 默認場地
    status: 'active'
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // 加載所有音樂會
  useEffect(() => {
    const loadConcerts = async () => {
      try {
        const response = await ConcertService.getAllConcerts();
        setConcerts(response.data);
      } catch (err) {
        console.error('加載音樂會失敗:', err);
        setError('無法加載音樂會列表：' + (err.response?.data?.message || err.message));
      }
    };
    
    loadConcerts();
  }, []);
  
  // 當URL中的concertId變更或初始化時，加載對應演出場次
  useEffect(() => {
    if (concertIdFromUrl) {
      setSelectedConcertId(concertIdFromUrl);
      loadPerformances(concertIdFromUrl);
    } else {
      setLoading(false);
    }
  }, [concertIdFromUrl]);
  
  // 當選擇的音樂會ID變更時，更新URL並加載對應的演出場次
  const handleConcertChange = (e) => {
    const concertId = e.target.value;
    setSelectedConcertId(concertId);
    
    if (concertId) {
      navigate(`/performances?concertId=${concertId}`);
      loadPerformances(concertId);
    } else {
      navigate('/performances');
      setPerformances([]);
    }
  };
  
  // 加載演出場次
  const loadPerformances = async (concertId) => {
    if (!concertId) return;
    
    try {
      setLoading(true);
      const response = await PerformanceService.getPerformancesByConcertId(concertId);
      console.log('API Response:', response); // 打印返回的整個響應
      console.log('Response data type:', typeof response.data, Array.isArray(response.data)); // 檢查資料類型
      
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
  
  // 處理模態框輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPerformance({
      ...currentPerformance,
      [name]: value
    });
  };
  
  // 新增/編輯演出場次
  const handleSavePerformance = async () => {
    try {
      if (!currentPerformance.concertId) {
        alert('請選擇音樂會');
        return;
      }
      
      if (!currentPerformance.performanceDateTime) {
        alert('請選擇演出時間');
        return;
      }
      
      if (isEditing) {
        await PerformanceService.updatePerformance(currentPerformance.id, currentPerformance);
      } else {
        await PerformanceService.createPerformance(currentPerformance);
      }
      
      // 重新加載數據
      loadPerformances(currentPerformance.concertId);
      
      // 關閉模態框
      setShowModal(false);
      
      // 重置表單
      setCurrentPerformance({
        concertId: selectedConcertId,
        performanceDateTime: '',
        duration: 120,
        streamingUrl: '',
        venue: '數位音樂廳主廳',
        status: 'active'
      });
      
      setIsEditing(false);
    } catch (err) {
      alert('保存失敗: ' + (err.response?.data?.message || err.message));
      console.error('保存演出場次失敗:', err);
    }
  };
  
  // 編輯演出場次
  const handleEditPerformance = (performance) => {
    console.log('Editing performance:', performance);
    // 格式化日期時間為input datetime-local所需格式
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
    
    // 確保資料結構的一致性
    const concertId = performance.concertId || 
                      (performance.concert ? performance.concert.id : null) || 
                      selectedConcertId;
    
    setIsEditing(true);
    setCurrentPerformance({
      id: performance.id,
      concertId: concertId,
      performanceDateTime: formattedDateTime,
      duration: performance.duration || 120,
      streamingUrl: performance.livestreamUrl || '',
      venue: performance.venue || '數位音樂廳主廳',
      status: performance.status || 'active'
    });
    setShowModal(true);
  };
  
  // 刪除演出場次
  const handleDeletePerformance = async (id) => {
    if (window.confirm('確定要刪除此演出場次嗎？此操作無法撤銷。')) {
      try {
        await PerformanceService.deletePerformance(id);
        loadPerformances(selectedConcertId);
      } catch (err) {
        alert('刪除失敗: ' + (err.response?.data?.message || err.message));
        console.error('刪除演出場次失敗:', err);
      }
    }
  };
  
  // 更改演出場次狀態
  const handleStatusChange = async (id, status) => {
    try {
      await PerformanceService.updatePerformanceStatus(id, status);
      loadPerformances(selectedConcertId);
    } catch (err) {
      alert('更改狀態失敗: ' + (err.response?.data?.message || err.message));
      console.error('更改演出場次狀態失敗:', err);
    }
  };

  // 獲取音樂會標題
  const getConcertTitle = (concertId) => {
    if (!concertId) return '未知音樂會';
    
    // 嘗試將 concertId 轉換為數字，以避免字符串和數字比較的問題
    let numericId;
    try {
      numericId = parseInt(concertId);
    } catch (err) {
      console.error('Error parsing concertId:', err, concertId);
      return '未知音樂會';
    }
    
    const concert = concerts.find(c => c.id === numericId);
    return concert ? concert.title : '未知音樂會';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">演出場次管理</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentPerformance({
              concertId: selectedConcertId,
              performanceDateTime: '',
              duration: 120,
              streamingUrl: '',
              venue: '數位音樂廳主廳',
              status: 'active'
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          disabled={!selectedConcertId}
        >
          新增演出場次
        </button>
      </div>

      {/* 音樂會選擇器 */}
      <div className="mb-6">
        <label htmlFor="concertId" className="block text-sm font-medium text-gray-700 mb-2">
          選擇音樂會
        </label>
        <select
          id="concertId"
          value={selectedConcertId}
          onChange={handleConcertChange}
          className="block w-full md:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        >
          <option value="">-- 請選擇音樂會 --</option>
          {concerts.map((concert) => (
            <option key={concert.id} value={concert.id}>
              {concert.title}
            </option>
          ))}
        </select>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* 正在加載 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : selectedConcertId ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  音樂會
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時長(分鐘)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performances.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    暫無演出場次，請添加
                  </td>
                </tr>
              ) : (
                performances.map((performance) => (
                  <tr key={performance.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {performance.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getConcertTitle(performance.concertId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(performance.startTime || performance.performanceDateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {performance.duration || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            performance.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : performance.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : performance.status === 'live'
                              ? 'bg-purple-100 text-purple-800'
                              : performance.status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {performance.status === 'scheduled'
                          ? '已排程'
                          : performance.status === 'active'
                          ? '上架中'
                          : performance.status === 'live'
                          ? '直播中'
                          : performance.status === 'completed'
                          ? '已完成'
                          : '已取消'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* 狀態變更下拉選單 */}
                        <select
                          className="text-sm border rounded p-1"
                          value={performance.status}
                          onChange={(e) => handleStatusChange(performance.id, e.target.value)}
                        >
                          <option value="scheduled">已排程</option>
                          <option value="active">上架中</option>
                          <option value="live">直播中</option>
                          <option value="completed">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                        
                        {/* 查看票券按鈕 */}
                        <button
                          onClick={() => navigate(`/tickets?performanceId=${performance.id}`)}
                          className="text-teal-600 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded"
                        >
                          票券
                        </button>
                        
                        {/* 編輯按鈕 */}
                        <button
                          onClick={() => handleEditPerformance(performance)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded"
                        >
                          編輯
                        </button>
                        
                        {/* 刪除按鈕 */}
                        <button
                          onClick={() => handleDeletePerformance(performance.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                請先選擇一個音樂會，以查看或管理其演出場次。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 新增/編輯演出場次模態框 */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {isEditing ? '編輯演出場次' : '新增演出場次'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="modal-concertId" className="block text-sm font-medium text-gray-700">
                      音樂會 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="concertId"
                      id="modal-concertId"
                      value={currentPerformance.concertId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      required
                    >
                      <option value="">-- 請選擇音樂會 --</option>
                      {concerts.map((concert) => (
                        <option key={concert.id} value={concert.id}>
                          {concert.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="performanceDateTime" className="block text-sm font-medium text-gray-700">
                      演出日期時間 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="performanceDateTime"
                      id="performanceDateTime"
                      value={currentPerformance.performanceDateTime}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      演出時長(分鐘) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      value={currentPerformance.duration}
                      onChange={handleInputChange}
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                      場地 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="venue"
                      id="venue"
                      value={currentPerformance.venue}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="streamingUrl" className="block text-sm font-medium text-gray-700">
                      直播URL
                    </label>
                    <input
                      type="text"
                      name="streamingUrl"
                      id="streamingUrl"
                      value={currentPerformance.streamingUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      狀態 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={currentPerformance.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      required
                    >
                      <option value="scheduled">已排程</option>
                      <option value="active">上架中</option>
                      <option value="live">直播中</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSavePerformance}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isEditing ? '更新' : '創建'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancesPage;