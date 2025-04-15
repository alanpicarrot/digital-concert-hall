import axios from "axios";

export const getTicketsByPerformanceId = async (performanceId) => {
  try {
    const response = await axios.get(
      `/api/performances/${performanceId}/tickets`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 確保 token 正確
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};
