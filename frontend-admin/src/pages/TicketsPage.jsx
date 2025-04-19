import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TicketService from '../services/admin/ticketService';
import PerformanceService from '../services/admin/performanceService';
import TicketTypeService from '../services/admin/ticketTypeService';
import ConcertService from '../services/admin/concertService';

// 格式化日期函數
const formatDate = (dateString) => {
  if (!dateString) return '無效日期';
  try {
    // 嘗試解析各種可能的日期格式
    const date = new Date(dateString);
    // 檢查日期是否有效
    if (isNaN(date.getTime())) {
      return '無效日期';
    }
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('日期格式化錯誤:', error);
    return '無效日期';
  }
};

const TicketsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const performanceIdFromUrl = queryParams.get('performanceId');

  const [tickets, setTickets] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState(performanceIdFromUrl || '');
  const [selectedConcertId, setSelectedConcertId] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState({
    performanceId: performanceIdFromUrl || '',
    ticketTypeId: '',
    price: 0,
    totalQuantity: 100,
    availableQuantity: 100,
    description: '',
    status: 'inactive'  // 預設為「未上架」狀態，與表格初始狀態保持一致
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
      }
    };
    
    loadConcerts();
  }, []);
  
  // 加載所有票種
  useEffect(() => {
    const loadTicketTypes = async () => {
      try {
        const response = await TicketTypeService.getAllTicketTypes();
        setTicketTypes(response.data);
      } catch (err) {
        console.error('加載票種失敗:', err);
      }
    };
    
    loadTicketTypes();
  }, []);
  
  // 當選擇的音樂會ID變更時，加載對應的演出場次
  useEffect(() => {
    const loadPerformancesByConcert = async () => {
      if (!selectedConcertId) {
        setPerformances([]);
        return;
      }
      
      try {
        const response = await PerformanceService.getPerformancesByConcertId(selectedConcertId);
        setPerformances(response.data);
        
        // 如果URL中有performanceId，且該performanceId屬於當前選擇的音樂會，則保持選中狀態
        if (performanceIdFromUrl) {
          const performanceExists = response.data.some(p => p.id === parseInt(performanceIdFromUrl));
          if (!performanceExists) {
            setSelectedPerformanceId('');
            navigate('/tickets');
          }
        }
      } catch (err) {
        console.error('加載演出場次失敗:', err);
      }
    };
    
    loadPerformancesByConcert();
  }, [selectedConcertId, performanceIdFromUrl, navigate]);
  
  // 當URL中的performanceId變更或初始化時，查找該演出所屬的音樂會ID
  useEffect(() => {
    const findConcertIdByPerformance = async () => {
      if (!performanceIdFromUrl) return;
      
      try {
        const response = await PerformanceService.getPerformanceById(performanceIdFromUrl);
        setSelectedConcertId(response.data.concertId.toString());
        setSelectedPerformanceId(performanceIdFromUrl);
        loadTickets(performanceIdFromUrl);
      } catch (err) {
        console.error('獲取演出場次詳情失敗:', err);
        setLoading(false);
      }
    };
    
    findConcertIdByPerformance();
  }, [performanceIdFromUrl]);
  
  // 當選擇的演出場次ID變更時，更新URL並加載對應的票券
  const handlePerformanceChange = (e) => {
    const performanceId = e.target.value;
    setSelectedPerformanceId(performanceId);
    
    if (performanceId) {
      navigate(`/tickets?performanceId=${performanceId}`);
      loadTickets(performanceId);
    } else {
      navigate('/tickets');
      setTickets([]);
    }
  };
  
  // 加載票券
  const loadTickets = async (performanceId) => {
    if (!performanceId) return;
    
    try {
      setLoading(true);
      const response = await TicketService.getTicketsByPerformanceId(performanceId);
      
      // 為每個票券添加当前演出場次的ID，確保狀態正確處理
      const ticketsWithPerformanceId = response.data.map(ticket => ({
        ...ticket,
        price: ticket.ticketType?.price || 0,
        performanceId: parseInt(performanceId), // 確保每個票券都有正確的演出場次ID
        ticketTypeId: ticket.ticketType?.id, // 確保每個票券都有正確的票種ID
        status: ticket.status || 'inactive' // 確保狀態欄位有預設值
      }));
      
      console.log('加載到的票券数据:', ticketsWithPerformanceId);
      setTickets(ticketsWithPerformanceId);
      setError(null);
    } catch (err) {
      setError('無法加載票券：' + (err.response?.data?.message || err.message));
      console.error('加載票券失敗:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 處理模態框輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTicket({
      ...currentTicket,
      [name]: name === 'price' || name === 'totalQuantity' || name === 'availableQuantity' 
        ? (value ? parseInt(value) : 0)
        : value
    });
    
    // 如果選擇了票種，自動設置票價
    if (name === 'ticketTypeId' && value) {
      const selectedTicketType = ticketTypes.find(t => t.id === parseInt(value));
      if (selectedTicketType && selectedTicketType.price) {
        setCurrentTicket(prev => ({
          ...prev,
          price: selectedTicketType.price,
          [name]: value
        }));
      }
    }
  };
  
  // 新增/編輯票券
  const handleSaveTicket = async () => {
    try {
      if (!currentTicket.performanceId) {
        alert('請選擇演出場次');
        return;
      }
      
      if (!currentTicket.ticketTypeId) {
        alert('請選擇票種');
        return;
      }
      
      // 確保數字欄位為整數，確保狀態值正確
      const ticketData = {
        ...currentTicket,
        performanceId: parseInt(currentTicket.performanceId),
        ticketTypeId: parseInt(currentTicket.ticketTypeId),
        price: parseFloat(currentTicket.price) || 0,
        totalQuantity: parseInt(currentTicket.totalQuantity) || 0,
        availableQuantity: parseInt(currentTicket.availableQuantity) || 0,
        status: currentTicket.status // 確保狀態正確傳遞
      };
      
      console.log('準備提交的票券數據:', ticketData);
      console.log('票券狀態值:', ticketData.status);
      
      let response;
      if (isEditing) {
        response = await TicketService.updateTicket(ticketData.id, ticketData);
        console.log('更新票券回應:', response.data);
        
        // 更新本地状态，避免等待後端同步
        const updatedTickets = tickets.map(ticket => 
          ticket.id === ticketData.id ? { ...ticket, ...ticketData } : ticket
        );
        setTickets(updatedTickets);
      } else {
        response = await TicketService.createTicket(ticketData);
        console.log('創建票券回應:', response.data);
        
        // 如果後端返回了完整數據，則直接添加到列表
        if (response.data && response.data.id) {
          setTickets([...tickets, response.data]);
        }
      }
      
      // 延遲重新加載數據，以確保後端處理完成
      setTimeout(() => {
        loadTickets(ticketData.performanceId);
      }, 500);
      
      // 關閉模態框
      setShowModal(false);
      
      // 重置表單
      setCurrentTicket({
        performanceId: selectedPerformanceId,
        ticketTypeId: '',
        price: 0,
        totalQuantity: 100,
        availableQuantity: 100,
        description: '',
        status: 'inactive'  // 預設為「未上架」狀態，與表格初始狀態保持一致
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
    
    // 處理價格 - 可能來自 ticket.price 或 ticket.ticketType.price
    let price = 0;
    if (ticket.price) {
      price = ticket.price;
    } else if (ticket.ticketType && ticket.ticketType.price) {
      price = ticket.ticketType.price;
    }
    
    console.log('編輯票券數據:', ticket);
    console.log('票券狀態:', ticket.status);
    
    // 添加防禦性程式設計，確保值存在且能夠轉換為字符串
    // 標準化狀態值，確保使用明確的 'active' 或 'inactive'
    const status = ticket.status === 'active' ? 'active' : 'inactive';
    console.log('設定票券狀態為:', status);
    
    setCurrentTicket({
      id: ticket.id,
      performanceId: ticket.performanceId ? ticket.performanceId.toString() : '',
      ticketTypeId: ticket.ticketTypeId ? ticket.ticketTypeId.toString() : '',
      price: price,
      totalQuantity: ticket.totalQuantity || 0,
      availableQuantity: ticket.availableQuantity || 0,
      description: ticket.description || '',
      status: status // 使用標準化的狀態值
    });
    
    setShowModal(true);
  };
  
  // 刪除票券
  const handleDeleteTicket = async (id) => {
    if (window.confirm('確定要刪除此票券嗎？此操作無法撤銷，且可能會影響已經購買此票券的訂單。')) {
      try {
        await TicketService.deleteTicket(id);
        loadTickets(selectedPerformanceId);
      } catch (err) {
        alert('刪除失敗: ' + (err.response?.data?.message || err.message));
        console.error('刪除票券失敗:', err);
      }
    }
  };
  
  // 更新票券庫存
  const handleInventoryChange = async (id, totalQuantity, availableQuantity) => {
    try {
      await TicketService.updateTicketInventory(id, totalQuantity, availableQuantity);
      loadTickets(selectedPerformanceId);
    } catch (err) {
      alert('更新庫存失敗: ' + (err.response?.data?.message || err.message));
      console.error('更新票券庫存失敗:', err);
    }
  };
  
  // 獲取票種名稱
  const getTicketTypeName = (ticketTypeId) => {
    if (!ticketTypeId) return '未知票種';
    try {
      const ticketType = ticketTypes.find(t => t.id === parseInt(ticketTypeId));
      return ticketType ? ticketType.name : '未知票種';
    } catch (error) {
      console.error('獲取票種名稱錯誤:', error);
      return '未知票種';
    }
  };
  
  // 獲取演出場次信息
  const getPerformanceInfo = (performanceId) => {
    if (!performanceId) return '未知演出場次';
    try {
      const performance = performances.find(p => p.id === parseInt(performanceId));
      if (!performance) return '未知演出場次';
      
      // 格式化日期時間
      return formatDate(performance.performanceDateTime || performance.startTime);
    } catch (error) {
      console.error('獲取演出場次信息錯誤:', error);
      return '未知演出場次';
    }
  };
  
  // 獲取音樂會標題
  const getConcertTitle = (concertId) => {
    if (!concertId) return '未知音樂會';
    try {
      const concert = concerts.find(c => c.id === parseInt(concertId));
      return concert ? concert.title : '未知音樂會';
    } catch (error) {
      console.error('獲取音樂會標題錯誤:', error);
      return '未知音樂會';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">票券管理</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            // 確保有選擇的演出場次
            if (!selectedPerformanceId) {
              alert('請先選擇演出場次');
              return;
            }
            setCurrentTicket({
              performanceId: selectedPerformanceId,
              ticketTypeId: '',
              price: 0,
              totalQuantity: 100,
              availableQuantity: 100,
              description: '',
              status: 'inactive'  // 預設為「未上架」狀態，與表格初始狀態保持一致
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          disabled={!selectedPerformanceId}
        >
          新增票券
        </button>
      </div>

      {/* 音樂會和演出場次選擇器 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="concertId" className="block text-sm font-medium text-gray-700 mb-2">
            選擇音樂會
          </label>
          <select
            id="concertId"
            value={selectedConcertId}
            onChange={(e) => setSelectedConcertId(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
          <label htmlFor="performanceId" className="block text-sm font-medium text-gray-700 mb-2">
            選擇演出場次
          </label>
          <select
            id="performanceId"
            value={selectedPerformanceId}
            onChange={handlePerformanceChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            disabled={!selectedConcertId || performances.length === 0}
          >
            <option value="">-- 請選擇演出場次 --</option>
            {performances.map((performance) => (
              <option key={performance.id} value={performance.id}>
                {formatDate(performance.performanceDateTime || performance.startTime)}
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

      {/* 引導訊息 */}
      {!selectedConcertId && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                請先選擇一個音樂會，以查看其演出場次。
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedConcertId && !selectedPerformanceId && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                請選擇一個演出場次，以管理其票券。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 正在加載 */}
      {loading && selectedPerformanceId ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : selectedPerformanceId ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  票種
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  價格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  總庫存
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  可用庫存
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
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    暫無票券，請添加
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
                        {getTicketTypeName(ticket.ticketTypeId)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticket.description || '無描述'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      NT$ {ticket.price || (ticket.ticketType ? ticket.ticketType.price : 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.totalQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        ticket.availableQuantity <= 0 ? 'text-red-600' :
                        ticket.availableQuantity < 10 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {ticket.availableQuantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticket.availableQuantity === 0 ? '(已售罄)' : 
                         ticket.availableQuantity < 10 ? '(即將售罄)' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                      ticket.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}
                      >
                      {/* 直接基於當前狀態顯示，不使用複雜判斷 */}
                      {ticket.status === 'active' ? '上架中' : '未上架'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* 編輯按鈕 */}
                        <button
                          onClick={() => handleEditTicket(ticket)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded"
                        >
                          編輯
                        </button>
                        
                        {/* 快速調整庫存按鈕 */}
                        <button
                          onClick={() => {
                            const newAvailable = prompt(
                              `請輸入新的可用庫存數量（目前為 ${ticket.availableQuantity}）：`,
                              ticket.availableQuantity
                            );
                            
                            if (newAvailable !== null) {
                              const numAvailable = parseInt(newAvailable);
                              if (!isNaN(numAvailable) && numAvailable >= 0) {
                                handleInventoryChange(ticket.id, null, numAvailable);
                              } else {
                                alert('請輸入有效的數字');
                              }
                            }
                          }}
                          className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
                        >
                          庫存
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
      ) : null}

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
                    <label htmlFor="modal-performanceId" className="block text-sm font-medium text-gray-700">
                      演出場次 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="performanceId"
                      id="modal-performanceId"
                      value={currentTicket.performanceId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      required
                      disabled={isEditing}
                    >
                      <option value="">-- 請選擇演出場次 --</option>
                      {performances.map((performance) => (
                        <option key={performance.id} value={performance.id}>
                        {formatDate(performance.performanceDateTime || performance.startTime)}
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
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      required
                    >
                      <option value="">-- 請選擇票種 --</option>
                      {ticketTypes.map((ticketType) => (
                        <option key={ticketType.id} value={ticketType.id}>
                          {ticketType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    票價(NT$) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2 items-center">
                    <input
                      type="number"
                      name="price"
                      id="price"
                      value={currentTicket.price}
                      onChange={handleInputChange}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        required
                        />
                        {currentTicket.ticketTypeId && (
                          <button
                            type="button"
                            onClick={() => {
                              const selectedTicketType = ticketTypes.find(
                                t => t.id === parseInt(currentTicket.ticketTypeId)
                              );
                              if (selectedTicketType && selectedTicketType.price) {
                                setCurrentTicket({
                                  ...currentTicket,
                                  price: selectedTicketType.price
                                });
                              }
                            }}
                            className="mt-1 px-3 py-2 bg-gray-100 text-xs text-gray-700 rounded hover:bg-gray-200"
                          >
                            使用票種預設價格
                          </button>
                        )}
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="totalQuantity" className="block text-sm font-medium text-gray-700">
                        總庫存 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="totalQuantity"
                        id="totalQuantity"
                        value={currentTicket.totalQuantity}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700">
                        可用庫存 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="availableQuantity"
                        id="availableQuantity"
                        value={currentTicket.availableQuantity}
                        onChange={handleInputChange}
                        min="0"
                        max={currentTicket.totalQuantity}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      描述
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={currentTicket.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      狀態 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={currentTicket.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      required
                    >
                      <option value="active">上架中</option>
                      <option value="inactive">未上架</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveTicket}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
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