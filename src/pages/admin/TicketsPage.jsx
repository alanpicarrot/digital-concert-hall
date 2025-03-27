import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import TicketService from '../../services/admin/ticketService';
import PerformanceService from '../../services/admin/performanceService';
import TicketTypeService from '../../services/admin/ticketTypeService';

const TicketsPage = () => {
  const [searchParams] = useSearchParams();
  const performanceId = searchParams.get('performanceId');

  const [tickets, setTickets] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedPerformance, setSelectedPerformance] = useState(performanceId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模態框狀態
  const [showModal, setShowModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState({
    performanceId: performanceId || '',
    ticketTypeId: '',
    totalQuantity: '',
    availableQuantity: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // 加載所有演出場次
  const loadPerformances = async () => {
    try {
      const response = await PerformanceService.getAllPerformances();
      setPerformances(response.data);

      // 如果沒有從 URL 參數獲取演出場次 ID，預設選擇第一個
      if (!performanceId && response.data.length > 0) {
        setSelectedPerformance(response.data[0].id.toString());
      }
    } catch (err) {
      console.error('加載演出場次失敗:', err);
    }
  };

  // 加載所有票種
  const loadTicketTypes = async () => {
    try {
      const response = await TicketTypeService.getAllTicketTypes();
      setTicketTypes(response.data);
    } catch (err) {
      console.error('加載票種失敗:', err);
    }
  };

  // 加載票券
  const loadTickets = async () => {
    try {
      setLoading(true);

      let response;
      if (selectedPerformance) {
        response = await TicketService.getTicketsByPerformanceId(selectedPerformance);
      } else {
        response = await TicketService.getAllTickets();
      }

      setTickets(response.data);
      setError(null);
    } catch (err) {
      setError('無法加載票券：' + (err.response?.data?.message || err.message));
      console.error('加載票券失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformances();
    loadTicketTypes();
  }, []);

  useEffect(() => {
    if (selectedPerformance || performances.length > 0) {
      loadTickets();
    }
  }, [selectedPerformance]);

  // 處理演出場次選擇變更
  const handlePerformanceChange = (e) => {
    setSelectedPerformance(e.target.value);
  };

  // 處理模態框輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTicket({
      ...currentTicket,
      [name]: value
    });
  };

  // 新增/編輯票券
  const handleSaveTicket = async () => {
    try {
      // 驗證必填欄位
      if (!currentTicket.performanceId) {
        alert('請選擇演出場次');
        return;
      }
      if (!currentTicket.ticketTypeId) {
        alert('請選擇票種');
        return;
      }
      if (!currentTicket.totalQuantity) {
        alert('請輸入總數量');
        return;
      }
      if (!currentTicket.availableQuantity && currentTicket.availableQuantity !== '0') {
        alert('請輸入可用數量');
        return;
      }

      // 驗證數量為正整數
      const totalQuantity = parseInt(currentTicket.totalQuantity);
      const availableQuantity = parseInt(currentTicket.availableQuantity);

      if (isNaN(totalQuantity) || totalQuantity <= 0) {
        alert('總數量必須為大於0的整數');
        return;
      }
      if (isNaN(availableQuantity) || availableQuantity < 0) {
        alert('可用數量必須為大於等於0的整數');
        return;
      }
      if (availableQuantity > totalQuantity) {
        alert('可用數量不能超過總數量');
        return;
      }

      const ticketData = {
        ...currentTicket,
        totalQuantity: totalQuantity,
        availableQuantity: availableQuantity
      };

      if (isEditing) {
        await TicketService.updateTicket(currentTicket.id, ticketData);
      } else {
        await TicketService.createTicket(ticketData);
      }

      // 重新加載數據
      loadTickets();

      // 關閉模態框
      setShowModal(false);

      // 重置表單
      setCurrentTicket({
        performanceId: selectedPerformance,
        ticketTypeId: '',
        totalQuantity: '',
        availableQuantity: ''
      });

      setIsEditing(false);
    } catch (err) {
      alert('保存失敗: ' + (err.response?.data?.message || err.message));
      console.error('保存票券失敗:', err);
    }
  };

  // 編輯票券
  const handleEditTicket = (ticket) => {
    setIsEditing(true);
    setCurrentTicket({
      id: ticket.id,
      performanceId: ticket.performance.id,
      ticketTypeId: ticket.ticketType.id,
      totalQuantity: ticket.totalQuantity.toString(),
      availableQuantity: ticket.availableQuantity.toString()
    });
    setShowModal(true);
  };

  // 刪除票券
  const handleDeleteTicket = async (id) => {
    if (window.confirm('確定要刪除此票券嗎？此操作無法撤銷。如果已售出票券，將無法刪除。')) {
      try {
        await TicketService.deleteTicket(id);
        loadTickets();
      } catch (err) {
        alert('刪除失敗: ' + (err.response?.data?.message || err.message));
        console.error('刪除票券失敗:', err);
      }
    }
  };

  // 更新票券庫存
  const handleUpdateInventory = (ticket) => {
    setCurrentTicket({
      id: ticket.id,
      performanceId: ticket.performance.id,
      ticketTypeId: ticket.ticketType.id,
      totalQuantity: ticket.totalQuantity.toString(),
      availableQuantity: ticket.availableQuantity.toString()
    });
    setShowModal(true);
    setIsEditing(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">票券管理</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentTicket({
              performanceId: selectedPerformance,
              ticketTypeId: '',
              totalQuantity: '',
              availableQuantity: ''
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新增票券
        </button>
      </div>

      {/* 篩選區域 */}
      <div className="mb-6 bg-white p-4 rounded-md shadow">
        <div className="flex items-center space-x-4">
          <label htmlFor="performance-select" className="text-sm font-medium text-gray-700">
            選擇演出場次:
          </label>
          <select
            id="performance-select"
            value={selectedPerformance}
            onChange={handlePerformanceChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">所有場次</option>
            {performances.map(performance => (
              <option key={performance.id} value={performance.id}>
                {performance.concert.title} - {new Date(performance.startTime).toLocaleString()} - {performance.venue}
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                  演出場次
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  票種
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  價格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  庫存
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {selectedPerformance ? '此場次暫無票券，請添加' : '暫無票券，請添加'}
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.performance.concert.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ticket.performance.startTime).toLocaleString()} | {ticket.performance.venue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.ticketType.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${Number(ticket.ticketType.price).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        可用: <span className={ticket.availableQuantity === 0 ? "text-red-600 font-bold" : ""}>{ticket.availableQuantity}</span> / 總計: {ticket.totalQuantity}
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className={`h-full rounded-full ${
                            (ticket.availableQuantity / ticket.totalQuantity) > 0.6
                              ? 'bg-green-500'
                              : (ticket.availableQuantity / ticket.totalQuantity) > 0.3
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${(ticket.availableQuantity / ticket.totalQuantity) * 100}%`
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* 更新庫存按鈕 */}
                        <button
                          onClick={() => handleUpdateInventory(ticket)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded"
                        >
                          更新庫存
                        </button>
                        
                        {/* 編輯按鈕 */}
                        <button
                          onClick={() => handleEditTicket(ticket)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded"
                        >
                          編輯
                        </button>
                        
                        {/* 刪除按鈕 */}
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
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

      {/* 新增/編輯票券模態框 */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {isEditing ? '編輯票券' : '新增票券'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="performanceId" className="block text-sm font-medium text-gray-700">
                      演出場次 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="performanceId"
                      id="performanceId"
                      value={currentTicket.performanceId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      disabled={isEditing}
                    >
                      <option value="">選擇演出場次</option>
                      {performances.map(performance => (
                        <option key={performance.id} value={performance.id}>
                          {performance.concert.title} - {new Date(performance.startTime).toLocaleString()} - {performance.venue}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ticketTypeId" className="block text-sm font-medium text-gray-700">
                      票種 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="ticketTypeId"
                      id="ticketTypeId"
                      value={currentTicket.ticketTypeId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      disabled={isEditing}
                    >
                      <option value="">選擇票種</option>
                      {ticketTypes.map(ticketType => (
                        <option key={ticketType.id} value={ticketType.id}>
                          {ticketType.name} - ${Number(ticketType.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="totalQuantity" className="block text-sm font-medium text-gray-700">
                        總數量 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="totalQuantity"
                        id="totalQuantity"
                        min="1"
                        value={currentTicket.totalQuantity}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700">
                        可用數量 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="availableQuantity"
                        id="availableQuantity"
                        min="0"
                        value={currentTicket.availableQuantity}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveTicket}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
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

export default TicketsPage;
