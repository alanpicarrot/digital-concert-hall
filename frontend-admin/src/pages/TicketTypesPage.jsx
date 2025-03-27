import React, { useState, useEffect } from 'react';
import TicketTypeService from '../services/admin/ticketTypeService';

const TicketTypesPage = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 表單狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [currentTicketType, setCurrentTicketType] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'STANDARD' // 預設類別
  });

  // 載入票種資料
  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const response = await TicketTypeService.getAllTicketTypes();
      setTicketTypes(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load ticket types:', err);
      setError('載入票種資料失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketTypes();
  }, []);

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'create') {
        await TicketTypeService.createTicketType(currentTicketType);
      } else {
        await TicketTypeService.updateTicketType(currentTicketType.id, currentTicketType);
      }
      
      setIsModalOpen(false);
      loadTicketTypes(); // 重新載入票種列表
    } catch (err) {
      console.error('Error saving ticket type:', err);
      setError('儲存票種資料失敗');
    }
  };

  // 處理表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTicketType({
      ...currentTicketType,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };

  // 開啟新增表單
  const openCreateForm = () => {
    setCurrentTicketType({
      name: '',
      description: '',
      price: 0,
      category: 'STANDARD'
    });
    setFormMode('create');
    setIsModalOpen(true);
  };

  // 開啟編輯表單
  const openEditForm = (ticketType) => {
    setCurrentTicketType({...ticketType});
    setFormMode('edit');
    setIsModalOpen(true);
  };

  // 刪除票種
  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此票種嗎？此操作無法恢復！')) {
      try {
        await TicketTypeService.deleteTicketType(id);
        loadTicketTypes(); // 重新載入票種列表
      } catch (err) {
        console.error('Error deleting ticket type:', err);
        setError('刪除票種失敗');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">票種管理</h1>
        <button 
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          新增票種
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

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
                  票種名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  價格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類別
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ticketTypes.length > 0 ? (
                ticketTypes.map((ticketType) => (
                  <tr key={ticketType.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticketType.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{ticketType.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${ticketType.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticketType.category === 'PREMIUM' 
                          ? 'bg-purple-100 text-purple-800' 
                          : ticketType.category === 'VIP' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {ticketType.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditForm(ticketType)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        編輯
                      </button>
                      <button 
                        onClick={() => handleDelete(ticketType.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    尚無票種資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 票種編輯/新增 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-lg mx-4">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {formMode === 'create' ? '新增票種' : '編輯票種'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    票種名稱
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentTicketType.name}
                    onChange={handleInputChange}
                    required
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    描述
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={currentTicketType.description}
                    onChange={handleInputChange}
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                    價格
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={currentTicketType.price}
                    onChange={handleInputChange}
                    required
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                    類別
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={currentTicketType.category}
                    onChange={handleInputChange}
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="STANDARD">標準</option>
                    <option value="PREMIUM">精選</option>
                    <option value="VIP">貴賓</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
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

export default TicketTypesPage;