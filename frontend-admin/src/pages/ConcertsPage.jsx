import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConcertService from '../services/admin/concertService';

const ConcertsPage = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentConcert, setCurrentConcert] = useState({
    title: '',
    description: '',
    programDetails: '',
    posterUrl: '',
    brochureUrl: '',
    status: 'inactive'
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // 加載所有音樂會
  const loadConcerts = async () => {
    try {
      setLoading(true);
      const response = await ConcertService.getAllConcerts();
      setConcerts(response.data);
      setError(null);
    } catch (err) {
      setError('無法加載音樂會列表：' + (err.response?.data?.message || err.message));
      console.error('加載音樂會失敗:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadConcerts();
  }, []);
  
  // 處理模態框輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentConcert({
      ...currentConcert,
      [name]: value
    });
  };
  
  // 新增/編輯音樂會
  const handleSaveConcert = async () => {
    try {
      if (isEditing) {
        await ConcertService.updateConcert(currentConcert.id, currentConcert);
      } else {
        await ConcertService.createConcert(currentConcert);
      }
      
      // 重新加載數據
      loadConcerts();
      
      // 關閉模態框
      setShowModal(false);
      
      // 重置表單
      setCurrentConcert({
        title: '',
        description: '',
        programDetails: '',
        posterUrl: '',
        brochureUrl: '',
        status: 'inactive'
      });
      
      setIsEditing(false);
    } catch (err) {
      alert('保存失敗: ' + (err.response?.data?.message || err.message));
      console.error('保存音樂會失敗:', err);
    }
  };
  
  // 編輯音樂會
  const handleEditConcert = (concert) => {
    setIsEditing(true);
    setCurrentConcert({
      id: concert.id,
      title: concert.title,
      description: concert.description || '',
      programDetails: concert.programDetails || '',
      posterUrl: concert.posterUrl || '',
      brochureUrl: concert.brochureUrl || '',
      status: concert.status
    });
    setShowModal(true);
  };
  
  // 刪除音樂會
  const handleDeleteConcert = async (id) => {
    if (window.confirm('確定要刪除此音樂會嗎？此操作無法撤銷。')) {
      try {
        await ConcertService.deleteConcert(id);
        loadConcerts();
      } catch (err) {
        alert('刪除失敗: ' + (err.response?.data?.message || err.message));
        console.error('刪除音樂會失敗:', err);
      }
    }
  };
  
  // 更改音樂會狀態
  const handleStatusChange = async (id, status) => {
    try {
      await ConcertService.updateConcertStatus(id, status);
      loadConcerts();
    } catch (err) {
      alert('更改狀態失敗: ' + (err.response?.data?.message || err.message));
      console.error('更改音樂會狀態失敗:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">音樂會管理</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentConcert({
              title: '',
              description: '',
              programDetails: '',
              posterUrl: '',
              brochureUrl: '',
              status: 'inactive'
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          新增音樂會
        </button>
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
                  標題
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  創建日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最後更新
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {concerts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    暫無音樂會，請添加
                  </td>
                </tr>
              ) : (
                concerts.map((concert) => (
                  <tr key={concert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {concert.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {concert.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            concert.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : concert.status === 'upcoming'
                              ? 'bg-blue-100 text-blue-800'
                              : concert.status === 'past'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {concert.status === 'active'
                          ? '上架中'
                          : concert.status === 'upcoming'
                          ? '即將推出'
                          : concert.status === 'past'
                          ? '已結束'
                          : '未上架'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(concert.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(concert.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* 狀態變更下拉選單 */}
                        <select
                          className="text-sm border rounded p-1"
                          value={concert.status}
                          onChange={(e) => handleStatusChange(concert.id, e.target.value)}
                        >
                          <option value="active">上架中</option>
                          <option value="inactive">未上架</option>
                          <option value="upcoming">即將推出</option>
                          <option value="past">已結束</option>
                        </select>
                        
                        {/* 查看演出按鈕 */}
                        <Link
                          to={`/performances?concertId=${concert.id}`}
                          className="text-teal-600 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded"
                        >
                          演出
                        </Link>
                        
                        {/* 編輯按鈕 */}
                        <button
                          onClick={() => handleEditConcert(concert)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded"
                        >
                          編輯
                        </button>
                        
                        {/* 刪除按鈕 */}
                        <button
                          onClick={() => handleDeleteConcert(concert.id)}
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

      {/* 新增/編輯音樂會模態框 */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {isEditing ? '編輯音樂會' : '新增音樂會'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      標題 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={currentConcert.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      描述
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={currentConcert.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="programDetails" className="block text-sm font-medium text-gray-700">
                      節目詳情
                    </label>
                    <textarea
                      name="programDetails"
                      id="programDetails"
                      value={currentConcert.programDetails}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="posterUrl" className="block text-sm font-medium text-gray-700">
                      海報URL
                    </label>
                    <input
                      type="text"
                      name="posterUrl"
                      id="posterUrl"
                      value={currentConcert.posterUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="brochureUrl" className="block text-sm font-medium text-gray-700">
                      小冊子URL
                    </label>
                    <input
                      type="text"
                      name="brochureUrl"
                      id="brochureUrl"
                      value={currentConcert.brochureUrl}
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
                      value={currentConcert.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      required
                    >
                      <option value="active">上架中</option>
                      <option value="inactive">未上架</option>
                      <option value="upcoming">即將推出</option>
                      <option value="past">已結束</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveConcert}
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

export default ConcertsPage;
