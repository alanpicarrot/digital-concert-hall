import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// 創建不帶認證的 axios 實例
const publicAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const publicApiService = {
  getAllConcerts: async () => {
    const path = validateApiPath("/api/concerts");
    const response = await publicAxios.get(path);
    return response.data;
  },

  getUpcomingConcerts: async () => {
    const path = validateApiPath("/api/concerts/upcoming");
    const response = await publicAxios.get(path);
    return response.data;
  },

  getPastConcerts: async () => {
    const path = validateApiPath("/api/concerts/past");
    const response = await publicAxios.get(path);
    return response.data;
  },
};
