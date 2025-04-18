import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import authService from "../../services/authService";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 組件加載時嘗試初始化系統
  useEffect(() => {
    const initSystem = async () => {
      try {
        // 從環境變量獲取API URL
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        console.log('使用API URL:', API_URL);
        
        // 使用 axios 實例以確保正確的路徑
        let response = null;
        let success = false;

        try {
          // 嘗試健康檢查端點
          response = await axios.get(`${API_URL}/health`);
          success = true;
        } catch (error) {
          console.log('健康檢查失敗，嘗試初始化端點...');
          try {
            response = await axios.get(`${API_URL}/api/setup/init`);
            success = true;
          } catch (setupError) {
            console.log('無法訪問 setup/init，嘗試其他路徑');
            try {
              response = await axios.get(`${API_URL}/setup/admin-init`);
              success = true;
            } catch (finalError) {
              console.error('所有初始化路徑均失敗');
            }
          }
        }

        if (success) {
          console.log('初始化成功:', response.data);
        }
      } catch (error) {
        console.error('初始化錯誤:', error.message);
      }
    };

    initSystem();
  }, []);

  // 檢查後端是否可用的狀態
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  // 組件加載時檢查後端是否可用
  useEffect(() => {
    const checkBackend = async () => {
      const available = await authService.checkBackendAvailability();
      setIsBackendAvailable(available);
    };
    
    checkBackend();
  }, []);

  // 創建測試用戶函數
  const createTestUser = async () => {
    try {
      // 檢查後端是否可用
      if (isBackendAvailable) {
        // 如果後端可用，使用原來的API調用邏輯
        let response = null;
        let success = false;
        
        try {
          // 先嘗試 /api/direct/create-test-user
          response = await axios.get("http://localhost:8080/api/direct/create-test-user");
          success = true;
        } catch (error) {
          console.log('使用 /api/direct/create-test-user 失敗，嘗試其他路徑...');
          try {
            // 再嘗試 /direct/create-test-user
            response = await axios.get("http://localhost:8080/direct/create-test-user");
            success = true;
          } catch (finalError) {
            console.error('所有創建測試用戶路徑均失敗');
          }
        }

        if (success) {
          console.log('創建測試用戶成功:', response.data);
          setEmail("testuser");
          setPassword("password123");
        }
      } else {
        // 如果後端不可用，直接設置測試用戶憑證
        console.log('後端不可用，使用模擬測試用戶');
        setEmail("testuser");
        setPassword("password123");
      }
    } catch (error) {
      console.error('創建用戶錯誤:', error.message);
      // 即使出錯，也設置測試用戶憑證
      setEmail("testuser");
      setPassword("password123");
    }
  };

  // 創建特定用戶函數
  const createSpecificUser = async (username, password) => {
    try {
      // 檢查後端是否可用
      if (isBackendAvailable) {
        // 如果後端可用，使用原來的API調用邏輯
        let response = null;
        let success = false;
        
        try {
          // 先嘗試 /api/direct/create-user
          response = await axios.get(`http://localhost:8080/api/direct/create-user/${username}/${password}`);
          success = true;
        } catch (error) {
          console.log('使用 /api/direct/create-user 失敗，嘗試其他路徑...');
          try {
            // 再嘗試 /direct/create-user
            response = await axios.get(`http://localhost:8080/direct/create-user/${username}/${password}`);
            success = true;
          } catch (finalError) {
            console.error(`所有創建用戶 ${username} 路徑均失敗`);
          }
        }

        if (success) {
          console.log(`創建用戶 ${username} 成功:`, response.data);
          setEmail(username);
          setPassword(password);
        }
      } else {
        // 如果後端不可用，直接設置用戶憑證
        console.log(`後端不可用，使用模擬用戶 ${username}`);
        setEmail(username);
        setPassword(password);
      }
    } catch (error) {
      console.error('創建用戶錯誤:', error.message);
      // 即使出錯，也設置用戶憑證
      setEmail(username);
      setPassword(password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      // 使用 AuthContext 的 login 方法
      const result = await login(email, password);

      if (result && result.success) {
        //setDebugInfo(prev => `${prev}\n登入成功: ${JSON.stringify(result.data)}`);
        navigate("/dashboard");
      } else {
        //setDebugInfo(prev => `${prev}\n登入失敗: ${result?.message || '未知錯誤'}`);
        setError(result?.message || "登入失敗，請確認帳號密碼是否正確");
      }
    } catch (err) {
      console.error("Login error:", err);
      //setDebugInfo(prev => `${prev}\n登入錯誤: ${err.message}`);
      if (err.response) {
        //setDebugInfo(prev => `${prev}\n響應狀態: ${err.response.status}\n響應數據: ${JSON.stringify(err.response.data)}`);
      }
      setError(
        err.response?.data?.message || "登入失敗，請確認帳號密碼是否正確"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserLogin = () => {
    createTestUser();
  };

  const handleTestEmailLogin = () => {
    createSpecificUser("test", "password123");
  };

  const handleAdminLogin = () => {
    createSpecificUser("admin", "admin123");
  };

  return (
    <div>
      <p className="mb-6 text-center text-sm text-gray-600">
        請輸入管理員帳號和密碼
      </p>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="email-address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            用戶名/電子郵件
          </label>
          <input
            id="email-address"
            name="email"
            type="text"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="用戶名或電子郵件"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            密碼
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white text-sm font-medium rounded-md ${
            loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "登入中..." : "登入"}
        </button>

        <div className="mt-4 flex flex-col space-y-2">
          <a
            href="/auth/register-admin"
            className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            創建新管理員帳號
          </a>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
