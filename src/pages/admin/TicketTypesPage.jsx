import React, { useState, useEffect } from 'react';
import TicketTypeService from '../../services/admin/ticketTypeService';

const TicketTypesPage = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 模態框狀態
  const [showModal, setShowModal] = useState(false);
  const [currentTicketType, setCurrentTicketType] = useState({
    name: '',
    description: '',
    price: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // 加載所有票種
  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const response = await TicketTypeService.getAllTicketTypes();
      setTicketTypes(response.data);
      setError(null);
    } catch (err) {
      setError('無法加載票種：' + (err.response?.data?.message || err.message));
      console.error('加載票種失敗:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTicketTypes();
  }, []);
  
  // 處理模態框輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTicketType({
      ...currentTicketType,
      [name]: value
    });
  };
  
  // 新增/編輯票種
  const handleSaveTicketType = async () => {
    try {
      // 驗證必填欄位
      if (!currentTicketType.name) {
        alert('請填寫票種名稱');
        return;
      }
      if (!currentTicketType.price) {
        alert('請填寫票種價格');
        return;
      }
      
      // 驗證價格為有效數字
      const price = parseFloat(currentTicketType.price);
      if (isNaN(price) || price <= 0) {
        alert('價格必須為大於0的數字');
        return;
      }
      
      if (isEditing) {
        await TicketTypeService.updateTicketType(currentTicketType.id, currentTicketType);
      } else {
        await TicketTypeService.createTicketType(currentTicketType);
      }
      
      // 重新加載數據
      loadTicketTypes();
      
      // 關閉模態框
      setShowModal(false);
      
      // 重置表單
      setCurrentTicketType({
        name: '',
        description: '',
        price: ''
      });
      
      setIsEditing(false);
    } catch (err) {
      alert('保存失敗: ' + (err.response?.data?.message || err.message));
      console.error('保存票種失敗:', err);
    }
  };
  
  // 編輯票種
  const handleEditTicketType = (ticketType) => {
    setIsEditing(true);
    setCurrentTicketType({
      id: ticketType.id,
      name: ticketType.name,
      description: ticketType.description || '',
      price: ticketType.price.toString()
    });
    setShowModal(true);
  };
  
  // 刪除票種
  const handleDeleteTicketType = async (id) => {
    if (window.confirm('確定要刪除此票種嗎？此操作無法撤銷，且可能影響已創建的票券。')) {
      try {
        await TicketTypeService.deleteTicketType(id);
        loadTicketTypes();
      } catch (err) {
        alert('刪除失敗: ' + (err.response?.data?.message || err.message));
        console.error('刪除票種失敗:', err);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">票種管理</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentTicketType({
              name: '',
              description: '',
              price: ''
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新增票種
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
                  名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  價格
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ticketTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    暫無票種，請添加
                  </td>
                </tr>
              ) : (
                ticketTypes.map((ticketType) => (
                  <tr key={ticketType.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticketType.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticketType.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticketType.description || '無描述'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${Number(ticketType.price).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* 編輯按鈕 */}
                        <button
                          onClick={() => handleEditTicketType(ticketType)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded"
                        >
                          編輯
                        </button>
                        
                        {/* 刪除按鈕 */}
                        <button
                          onClick={() => handleDeleteTicketType(ticketType.id)}
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

      {/* 新增/編輯票種模態框 */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {isEditing ? '編輯票種' : '新增票種'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={currentTicketType.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      value={currentTicketType.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      價格 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        min="0"
                        step="0.01"
                        value={currentTicketType.price}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">NTD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveTicketType}
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

export default TicketTypesPage;
