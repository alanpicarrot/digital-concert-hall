import React, { useState, useEffect } from 'react';
import TicketService from '../services/admin/ticketService';
import TicketTypeService from '../services/admin/ticketTypeService';
import performanceService from '../services/admin/performanceService';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerformance, setSelectedPerformance] = useState('');
  
  // 表單狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit' or 'inventory'
  const [currentTicket, setCurrentTicket] = useState({
    performanceId: '',
    ticketTypeId: '',
    seatSection: '',
    rowNumber: '',
    seatNumber: '',
    status: 'AVAILABLE',
    totalQuantity: 0,
    availableQuantity: 0
  });

  // 載入票券資料
  const loadTickets = async (performanceId = '') => {
    try {
      setLoading(true);
      let response;
      
      if (performanceId) {
        response = await TicketService.getTicketsByPerformanceId(performanceId);
      } else {
        response = await TicketService.getAllTickets();
      }
      
      setTickets(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('載入票券資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入初始資料
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // 載入演出場次資料
        const performancesResponse = await performanceService.getAllPerformances();
        setPerformances(performancesResponse.data);
        
        // 載入票種資料
        const ticketTypesResponse = await TicketTypeService.getAllTicketTypes();
        setTicketTypes(ticketTypesResponse.data);
        
        // 載入所有票券
        await loadTickets();
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('載入初始資料失敗');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // 處理演出場次選擇變更
  const handlePerformanceChange = (e) => {
    const performanceId = e.target.value;
    setSelectedPerformance(performanceId);
    
    if (performanceId) {
      loadTickets(performanceId);
    } else {
      loadTickets();
    }
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'create') {
        await TicketService.createTicket(currentTicket);
      } else if (formMode === 'edit') {
        await TicketService.updateTicket(currentTicket.id, currentTicket);
      } else if (formMode === 'inventory') {
        await TicketService.updateTicketInventory(
          currentTicket.id, 
          currentTicket.totalQuantity, 
          currentTicket.availableQuantity
        );
      }
      
      setIsModalOpen(false);
      loadTickets(selectedPerformance);
    } catch (err) {
      console.error('Error saving ticket:', err);
      setError('儲存票券資料失敗');
    }
  };

  // 處理表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTicket({
      ...currentTicket,
      [name]: ['totalQuantity', 'availableQuantity'].includes(name) 
        ? parseInt(value, 10) 
        : value
    });
  };

  // 開啟新增表單
  const openCreateForm = () => {
    setCurrentTicket({
      performanceId: selectedPerformance || '',
      ticketTypeId: '',
      seatSection: '',
      rowNumber: '',
      seatNumber: '',
      status: 'AVAILABLE',
      totalQuantity: 0,
      availableQuantity: 0
    });
    setFormMode('create');
    setIsModalOpen(true);
  };

  // 開啟編輯表單
  const openEditForm = (ticket) => {
    setCurrentTicket({...ticket});
    setFormMode('edit');
    setIsModalOpen(true);
  };

  // 開啟庫存管理表單
  const openInventoryForm = (ticket) => {
    setCurrentTicket({...ticket});
    setFormMode('inventory');
    setIsModalOpen(true);
  };

  // 刪除票券
  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此票券嗎？此操作無法恢復！')) {
      try {
        await TicketService.deleteTicket(id);
        loadTickets(selectedPerformance);
      } catch (err) {
        console.error('Error deleting ticket:', err);
        setError('刪除票券失敗');
      }
    }
  };

  // 獲取票種名稱
  const getTicketTypeName = (ticketTypeId) => {
    const ticketType = ticketTypes.find(type => type.id === ticketTypeId);
    return ticketType ? ticketType.name : '未知票種';
  };

  // 獲取演出名稱
  const getPerformanceName = (performanceId) => {
    const performance = performances.find(perf => perf.id === performanceId);
    return performance ? performance.title : '未知演出';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">票券管理</h1>
        <button 
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          新增票券
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="performance" className="block text-sm font-medium text-gray-700 mb-2">
          選擇演出場次
        </label>
        <select
          id="performance"
          name="performance"
          value={selectedPerformance}
          onChange={handlePerformanceChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">所有場次</option>
          {performances.map(performance => (
            <option key={performance.id} value={performance.id}>
              {performance.title} - {new Date(performance.startTime).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">載入中...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  演出場次
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  票種
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  座位資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  庫存
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
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPerformanceName(ticket.performanceId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getTicketTypeName(ticket.ticketTypeId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {ticket.seatSection} {ticket.rowNumber && `${ticket.rowNumber}排`} {ticket.seatNumber && `${ticket.seatNumber}號`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.availableQuantity} / {ticket.totalQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticket.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800' 
                          : ticket.status === 'RESERVED' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {ticket.status === 'AVAILABLE' ? '可售' : 
                         ticket.status === 'RESERVED' ? '已預訂' : '已售出'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openInventoryForm(ticket)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        庫存
                      </button>
                      <button 
                        onClick={() => openEditForm(ticket)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        編輯
                      </button>
                      <button 
                        onClick={() => handleDelete(ticket.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    尚無票券資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 票券編輯/新增/庫存管理 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-lg mx-4">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {formMode === 'create' 
                  ? '新增票券' 
                  : formMode === 'edit' 
                    ? '編輯票券' 
                    : '管理票券庫存'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-4">
                {formMode !== 'inventory' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="performanceId">
                        演出場次
                      </label>
                      <select
                        id="performanceId"
                        name="performanceId"
                        value={currentTicket.performanceId}
                        onChange={handleInputChange}
                        required
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">請選擇演出場次</option>
                        {performances.map(performance => (
                          <option key={performance.id} value={performance.id}>
                            {performance.title} - {new Date(performance.startTime).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ticketTypeId">
                        票種
                      </label>
                      <select
                        id="ticketTypeId"
                        name="ticketTypeId"
                        value={currentTicket.ticketTypeId}
                        onChange={handleInputChange}
                        required
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">請選擇票種</option>
                        {ticketTypes.map(ticketType => (
                          <option key={ticketType.id} value={ticketType.id}>
                            {ticketType.name} - ${ticketType.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="seatSection">
                        座位區域
                      </label>
                      <input
                        type="text"
                        id="seatSection"
                        name="seatSection"
                        value={currentTicket.seatSection}
                        onChange={handleInputChange}
                        required
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="例如: A區, 一樓中央區, 貴賓區"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rowNumber">
                          排號 (選填)
                        </label>
                        <input
                          type="text"
                          id="rowNumber"
                          name="rowNumber"
                          value={currentTicket.rowNumber}
                          onChange={handleInputChange}
                          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="例如: 5, A"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="seatNumber">
                          座號 (選填)
                        </label>
                        <input
                          type="text"
                          id="seatNumber"
                          name="seatNumber"
                          value={currentTicket.seatNumber}
                          onChange={handleInputChange}
                          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="例如: 12, B5"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                        狀態
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={currentTicket.status}
                        onChange={handleInputChange}
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="AVAILABLE">可售</option>
                        <option value="RESERVED">已預訂</option>
                        <option value="SOLD">已售出</option>
                      </select>
                    </div>
                  </>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalQuantity">
                      總庫存量
                    </label>
                    <input
                      type="number"
                      id="totalQuantity"
                      name="totalQuantity"
                      min="0"
                      value={currentTicket.totalQuantity}
                      onChange={handleInputChange}
                      required
                      className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="availableQuantity">
                      可售庫存量
                    </label>
                    <input
                      type="number"
                      id="availableQuantity"
                      name="availableQuantity"
                      min="0"
                      max={currentTicket.totalQuantity}
                      value={currentTicket.availableQuantity}
                      onChange={handleInputChange}
                      required
                      className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {currentTicket.availableQuantity > currentTicket.totalQuantity && (
                      <p className="text-red-500 text-xs mt-1">可售庫存不能超過總庫存</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={currentTicket.availableQuantity > currentTicket.totalQuantity}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  儲存
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;