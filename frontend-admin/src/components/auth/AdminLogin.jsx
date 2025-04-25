import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

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
        const API_URL =
          process.env.REACT_APP_API_URL || "http://localhost:8080";
        // console.log("使用API URL:", API_URL);

        let response = null;
        let success = false;

        try {
          response = await axios.get(`${API_URL}/health`);
          success = true;
        } catch (error) {
          // console.log("健康檢查失敗，嘗試初始化端點...");
          try {
            response = await axios.get(`${API_URL}/api/setup/init`);
            success = true;
          } catch (setupError) {
            // console.log("無法訪問 setup/init，嘗試其他路徑");
            try {
              response = await axios.get(`${API_URL}/setup/admin-init`);
              success = true;
            } catch (finalError) {
              console.error("所有初始化路徑均失敗");
            }
          }
        }

        // if (success) {
        //   console.log("初始化成功:", response.data);
        // }
      } catch (error) {
        console.error("初始化錯誤:", error.message);
      }
    };

    initSystem();
  }, []);

  // Removed useEffect for checkBackendAvailability

  // Removed createTestUser function

  // Removed createSpecificUser function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // console.log("嘗試登入系統，用戶名:", email);

      const result = await login(email, password);

      if (result && result.success) {
        // console.log(
        //   "登入成功，用戶資料:",
        //   result.data ? result.data.username : "未知"
        // );
        navigate("/dashboard", { replace: true });
      } else {
        console.error("登入處理結果失敗:", result?.message || "未知錯誤");
        setError(result?.message || "登入失敗，請確認帳號密碼是否正確");
      }
    } catch (err) {
      console.error("登入處理過程中發生錯誤:", err);
      if (err.response) {
        console.error(
          `錯誤狀態: ${err.response.status}, 數據:`,
          err.response.data
        );
      }
      setError(
        err.response?.data?.message ||
          err.message ||
          "登入失敗，請確認帳號密碼是否正確"
      );
    } finally {
      setLoading(false);
    }
  };

  // Removed handleTestUserLogin function

  // Removed handleAdminLogin function

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
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            用戶名或電子郵件
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="輸入用戶名或電子郵件"
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
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="輸入密碼"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
        >
          {loading ? "登入中..." : "登入"}
        </button>
      </form>

      {/* Removed Test User and Admin Login buttons */}
    </div>
  );
};

export default AdminLogin;
