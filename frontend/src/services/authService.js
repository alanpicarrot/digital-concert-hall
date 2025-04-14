import axios from "axios";

const API_URL = "/api/admin/concerts";
const BASE_URL = "http://localhost:8080/api"; // Updated backend port

export const getAuthToken = () => {
  // Retrieve the token from localStorage or another secure storage
  return localStorage.getItem("authToken");
};

export const fetchConcerts = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`, // Add the token to the Authorization header
      },
    });
    return response.data;
  } catch (error) {
    console.error("API 錯誤:", error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await fetch(`${BASE_URL}/ping`);
    if (response.ok) {
      console.log("健康檢查成功:", response.status);
      return true;
    }
  } catch (error) {
    console.error("嘗試健康檢查端點失敗:", error);
  }
  return false;
};
