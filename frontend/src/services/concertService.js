import { fetchConcerts } from "./authService";

export const getConcertList = async () => {
  try {
    const concerts = await fetchConcerts();
    return concerts;
  } catch (error) {
    console.error("獲取音樂會列表失敗:", error);
    throw error;
  }
};
