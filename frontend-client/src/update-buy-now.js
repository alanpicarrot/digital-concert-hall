// 將此代碼片段覆蓋到 ConcertDetailPage.jsx 中的 handleBuyNow 函數內部
// 在確認用戶已登錄並且已選擇座位區域後：

// 將購票信息存入 sessionStorage，以便結帳頁面可以使用
const ticketInfo = {
  concertId: concert.id,
  concertTitle: concert.title,
  ticketId: selectedSeatingArea.id, // 確保添加票券ID
  ticketType: selectedSeatingArea.name,
  ticketPrice: selectedSeatingArea.price,
  quantity: quantity,
  totalAmount: calculateTotal(),
  // 添加演出時間和地點信息
  performanceTime: selectedSeatingArea.performance ? 
                    `${formatDate(selectedSeatingArea.performance.startTime)} ${formatTime(selectedSeatingArea.performance.startTime)}` : 
                    concert.date ? `${formatDate(concert.date)} ${formatTime(concert.date)}` : null,
  venue: selectedSeatingArea.performance ? 
          selectedSeatingArea.performance.venue : 
          concert.location || '數位音樂廳',
  purchaseTime: new Date().toISOString() // 添加購買時間戳記
};