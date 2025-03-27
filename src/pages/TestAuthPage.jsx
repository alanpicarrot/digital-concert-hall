import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/authService';

const TestAuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState({
    all: null,
    user: null,
    mod: null,
    admin: null,
    authInfo: null
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
  }, []);
  
  const testEndpoint = async (endpoint) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await AuthService.axiosInstance.get(`/test/${endpoint}`);
      setResults(prev => ({ ...prev, [endpoint]: response.data }));
    } catch (err) {
      console.error(`Test ${endpoint} failed:`, err);
      setResults(prev => ({ 
        ...prev, 
        [endpoint]: `Error: ${err.response?.status || 'Unknown'} - ${err.response?.data?.message || err.message}` 
      }));
    } finally {
      setLoading(false);
    }
  };
  
  const testAllEndpoints = async () => {
    await testEndpoint('all');
    await testEndpoint('user');
    await testEndpoint('mod');
    await testEndpoint('admin');
    await testEndpoint('auth-info');
  };
  
  const resetResults = () => {
    setResults({
      all: null,
      user: null,
      mod: null,
      admin: null,
      authInfo: null
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">JWT 身份驗證測試</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">當前登入狀態</h2>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          {currentUser ? (
            <div>
              <p className="text-green-600 font-medium">已登入</p>
              <div className="mt-2">
                <p><span className="font-medium">用戶名：</span> {currentUser.username}</p>
                <p><span className="font-medium">電子郵件：</span> {currentUser.email}</p>
                <p><span className="font-medium">角色：</span> {currentUser.roles?.join(', ')}</p>
                <p><span className="font-medium">令牌：</span> {localStorage.getItem('token')?.substring(0, 20)}...</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-medium">未登入</p>
              <p className="mt-2">請先登入以測試受保護的端點</p>
              <Link to="/login" className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                前往登入
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 mb-8">
          <button
            onClick={testAllEndpoints}
            disabled={loading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
          >
            {loading ? '測試中...' : '測試所有端點'}
          </button>
          
          <button
            onClick={resetResults}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            重置結果
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">公開端點 (/test/all)</h3>
            <button
              onClick={() => testEndpoint('all')}
              disabled={loading}
              className="mb-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              測試
            </button>
            <div className="bg-gray-50 p-4 rounded-md">
              {results.all !== null ? (
                <pre className="whitespace-pre-wrap">{typeof results.all === 'object' ? JSON.stringify(results.all, null, 2) : results.all}</pre>
              ) : (
                <p className="text-gray-500">未測試</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">用戶端點 (/test/user)</h3>
            <button
              onClick={() => testEndpoint('user')}
              disabled={loading}
              className="mb-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              測試
            </button>
            <div className="bg-gray-50 p-4 rounded-md">
              {results.user !== null ? (
                <pre className="whitespace-pre-wrap">{typeof results.user === 'object' ? JSON.stringify(results.user, null, 2) : results.user}</pre>
              ) : (
                <p className="text-gray-500">未測試</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">版主端點 (/test/mod)</h3>
            <button
              onClick={() => testEndpoint('mod')}
              disabled={loading}
              className="mb-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              測試
            </button>
            <div className="bg-gray-50 p-4 rounded-md">
              {results.mod !== null ? (
                <pre className="whitespace-pre-wrap">{typeof results.mod === 'object' ? JSON.stringify(results.mod, null, 2) : results.mod}</pre>
              ) : (
                <p className="text-gray-500">未測試</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">管理員端點 (/test/admin)</h3>
            <button
              onClick={() => testEndpoint('admin')}
              disabled={loading}
              className="mb-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              測試
            </button>
            <div className="bg-gray-50 p-4 rounded-md">
              {results.admin !== null ? (
                <pre className="whitespace-pre-wrap">{typeof results.admin === 'object' ? JSON.stringify(results.admin, null, 2) : results.admin}</pre>
              ) : (
                <p className="text-gray-500">未測試</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">身份驗證信息 (/test/auth-info)</h3>
            <button
              onClick={() => testEndpoint('auth-info')}
              disabled={loading}
              className="mb-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              測試
            </button>
            <div className="bg-gray-50 p-4 rounded-md">
              {results.authInfo !== null ? (
                <pre className="whitespace-pre-wrap">{typeof results.authInfo === 'object' ? JSON.stringify(results.authInfo, null, 2) : results.authInfo}</pre>
              ) : (
                <p className="text-gray-500">未測試</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage;
