import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PerformanceService from '../services/admin/performanceService';
import ConcertService from '../services/admin/concertService';

const PerformancesPage = () => {
  const [searchParams] = useSearchParams();
  const concertId = searchParams.get('concertId');
  
  const [performances, setPerformances] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState(concertId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 模態框狀態
  const [showModal, setShowModal] = useState(false);
  const [currentPerformance, setCurrentPerformance] = useState({
    concertId: concertId || '',
    startTime: '',
    endTime: '',
    venue: '',
    status: 'scheduled',
    livestreamUrl: '',
    recordingUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // 加載所有音樂會
  const loadConcerts = async () => {
    try {
      const response = await ConcertService.getAllConcerts();
      setConcerts(response.data);
      
      // 如果沒有從 URL 參數獲取音樂會 ID，預設選擇第一個
      if (!concertId && response.data.length > 0) {
        setSelectedConcert(response.data[0].id.toString());
      }
    } catch (err) {
      console.error('加載音樂會失敗:', err);
    }
  };
  
  // 加載演出場次
  const loadPerformances = async () => {
    try {
      setLoading(true);
      
      let response;
      if (selectedConcert) {
        response = await PerformanceService.getPerformancesByConcertId(selectedConcert);
      } else {
        response = await PerformanceService.getAllPerformances();
      }
      
      setPerformances(response.data);
      setError(null);
    } catch (err) {
      setError('無法加載演出場次：' + (err.response?.data?.message || err.message));
      console.error('加載演出場次失敗:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadConcerts();
  }, []);
  
  useEffect(() => {
    if (selectedConcert || concerts.length > 0) {
      loadPerformances();
    }
  }, [selectedConcert]);
  
  // 處理音樂會選擇變更
  const handleConcertChange = (e) => {
    setSelectedConcert(e.target.value);
  };
  
  // 處理模態框輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPerformance({
      ...currentPerformance,
      [name]: value
    });
  };
  
  // 處理日期時間輸入
  const formatDateTimeForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16); // format: "YYYY-MM-DDThh:mm"
  };
  
  // 新增/編輯演出場次
  const handleSavePerformance = async () => {
    try {
      // 驗證必填欄位
      if (!currentPerformance.concertId) {
        alert('請選擇音樂會');
        return;
      }
      if (!currentPerformance.startTime) {
        alert('請選擇開始時間');
        return;
      }
      if (!currentPerformance.endTime) {
        alert('請選擇結束時間');
        return;
      }
      if (!currentPerformance.venue) {
        alert('請填寫場地');
        return;
      }
      
      // 驗證開始時間早於結束時間
      const startTime = new Date(currentPerformance.startTime);
      const endTime = new Date(currentPerformance.endTime);
      if (startTime >= endTime) {
        alert('開始時間必須早於結束時間');
        return;
      }
      
      // 處理日期時間格式
      const performanceData = {
        ...currentPerformance,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };
      
      if (isEditing) {
        await PerformanceService.updatePerformance(currentPerformance.id, performanceData);
      } else {
        await PerformanceService.createPerformance(performanceData);
      }
      
      // 重新加載數據
      loadPerformances();
      
      // 關閉模態框
      setShowModal(false);
      
      // 重置表單
      setCurrentPerformance({
        concertId: selectedConcert,
        startTime: '',
        endTime: '',
        venue: '',
        status: 'scheduled',
        livestreamUrl: '',
        recordingUrl: ''
      });
      
      setIsEditing(false);
    } catch (err) {
      alert('保存失敗: ' + (err.response?.data?.message || err.message));
      console.error('保存演出場次失敗:', err);
    }
  };
  
  // 編輯演出場次
  const handleEditPerformance = (performance) => {
    setIsEditing(true);
    setCurrentPerformance({
      id: performance.id,
      concertId: performance.concert.id,
      startTime: formatDateTimeForInput(performance.startTime),
      endTime: formatDateTimeForInput(performance.endTime),
      venue: performance.venue,
      status: performance.status,
      livestreamUrl: performance.livestreamUrl || '',
      recordingUrl: performance.recordingUrl || ''
    });
    setShowModal(true);
  };
  
  // 刪除演出場次
  const handleDeletePerformance = async (id) => {
    if (window.confirm('確定要刪除此演出場次嗎？此操作無法撤銷。')) {
      try {
        await PerformanceService.deletePerformance(id);
        loadPerformances();
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
      loadPerformances();
    } catch (err) {
      alert('更改狀態失敗: ' + (err.response?.data?.message || err.message));
      console.error('更改演出場次狀態失敗:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">演出場次管理</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentPerformance({
              concertId: selectedConcert,
              startTime: '',
              endTime: '',
              venue: '',
              status: 'scheduled',
              livestreamUrl: '',
              recordingUrl: ''
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          新增演出場次
        </button>
      </div>

      {/* 篩選區域 */}
      <div className="mb-6 bg-white p-4 rounded-md shadow">
        <div className="flex items-center space-x-4">
          <label htmlFor="concert-select" className="text-sm font-medium text-gray-700">
            選擇音樂會:
          </label>
          <select
            id="concert-select"
            value={selectedConcert}
            onChange={handleConcertChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
          >
            <option value="">所有音樂會</option>
            {concerts.map(concert => (
              <option key={concert.id} value={concert.id}>
                {concert.title}
              </option>
            ))}
          </select>
        </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
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
                  場地
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
                    {selectedConcert ? '此音樂會暫無演出場次，請添加' : '暫無演出場次，請添加'}
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
                        {performance.concert.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(performance.startTime).toLocaleString()}
                        <span className="mx-1">-</span>
                        {new Date(performance.endTime).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {performance.venue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            performance.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : performance.status === 'live'
                              ? 'bg-green-100 text-green-800'
                              : performance.status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {performance.status === 'scheduled'
                          ? '已排程'
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
                          <option value="live">直播中</option>
                          <option value="completed">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                        
                        {/* 查看票券按鈕 */}
                        <Link
                          to={`/tickets?performanceId=${performance.id}`}
                          className="text-teal-600 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded"
                        >
                          票券
                        </Link>
                        
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
                    <label htmlFor="concertId" className="block text-sm font-medium text-gray-700">
                      音樂會 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="concertId"
                      id="concertId"
                      value={currentPerformance.concertId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      required
                    >
                      <option value="">選擇音樂會</option>
                      {concerts.map(concert => (
                        <option key={concert.id} value={concert.id}>
                          {concert.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                        開始時間 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        id="startTime"
                        value={currentPerformance.startTime}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                        結束時間 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        id="endTime"
                        value={currentPerformance.endTime}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        required
                      />
                    </div>
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
                      <option value="live">直播中</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="livestreamUrl" className="block text-sm font-medium text-gray-700">
                      直播URL
                    </label>
                    <input
                      type="text"
                      name="livestreamUrl"
                      id="livestreamUrl"
                      value={currentPerformance.livestreamUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="recordingUrl" className="block text-sm font-medium text-gray-700">
                      錄播URL
                    </label>
                    <input
                      type="text"
                      name="recordingUrl"
                      id="recordingUrl"
                      value={currentPerformance.recordingUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSavePerformance}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
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
