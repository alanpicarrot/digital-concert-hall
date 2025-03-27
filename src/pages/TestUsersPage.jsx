import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// 開發環境測試頁面 - 用於創建測試用戶和數據
const TestUsersPage = () => {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/api/debug/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('獲取用戶列表失敗，請確保後端服務運行正常。');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUser = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await axios.get('/api/debug/create-test-user');
      setMessage('測試用戶創建成功！用戶名: testuser, 密碼: password123');
      console.log('Created test user:', response.data);
      
      // 刷新用戶列表
      fetchUsers();
    } catch (error) {
      console.error('Error creating test user:', error);
      setError('創建測試用戶失敗，請確保後端服務運行正常。');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestData = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await axios.get('/api/debug/create-test-data');
      setMessage(response.data || '測試數據創建成功！');
    } catch (error) {
      console.error('Error creating test data:', error);
      setError('創建測試數據失敗，請確保後端服務運行正常。');
    } finally {
      setIsLoading(false);
    }
  };

  // 在組件掛載時加載用戶列表
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">開發測試工具</h1>
        <p className="mb-6 text-gray-600">此頁面僅用於開發環境，用於創建測試用戶和數據。</p>
        
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p>{message}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <button
            onClick={createTestUser}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 flex-1"
          >
            {isLoading ? '處理中...' : '創建測試用戶'}
          </button>
          
          <button
            onClick={createTestData}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 flex-1"
          >
            {isLoading ? '處理中...' : '創建測試數據'}
          </button>
          
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 flex-1"
          >
            {isLoading ? '處理中...' : '刷新用戶列表'}
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">用戶列表</h2>
          {isLoading ? (
            <p className="text-gray-500">載入中...</p>
          ) : users.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3">ID</th>
                  <th className="text-left py-2 px-3">用戶名</th>
                  <th className="text-left py-2 px-3">電子郵件</th>
                  <th className="text-left py-2 px-3">角色</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="py-2 px-3">{user.id}</td>
                    <td className="py-2 px-3">{user.username}</td>
                    <td className="py-2 px-3">{user.email}</td>
                    <td className="py-2 px-3">
                      {user.roles ? 
                        user.roles.map(role => 
                          role && role.name ? role.name.replace('ROLE_', '') : ''
                        ).join(', ') : 
                        ''
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">沒有找到任何用戶。</p>
          )}
        </div>
        
        <div className="mt-8 pt-4 border-t">
          <h3 className="font-bold text-lg mb-2">測試用戶憑證</h3>
          <p className="mb-1"><span className="font-medium">用戶名:</span> testuser</p>
          <p className="mb-4"><span className="font-medium">密碼:</span> password123</p>
          
          <div className="flex space-x-4">
            <Link to="/login" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              前往登入頁面
            </Link>
            <Link to="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUsersPage;
