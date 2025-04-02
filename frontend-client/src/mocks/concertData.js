// 不使用模擬數據，確保系統從後端API獲取真實數據
export const mockConcerts = [];

/* 
// 以下是原始的模擬數據，現已禁用，留作參考
export const mockConcertsDisabled = [
  {
    id: 1,
    title: '貝多芬鋼琴奏鳴曲全集音樂會',
    performer: '王小明',
    performerTitle: '鋼琴獨奏家',
    performerBio: '王小明是一位國際知名的鋼琴家，曾在世界各地演出貝多芬的全套鋼琴奏鳴曲。他以精湛的技巧和深刻的音樂詮釋聞名。王小明畢業於茱莉亞音樂學院，師從多位著名鋼琴大師。',
    date: '2025-04-15T19:30:00',
    endTime: '2025-04-15T21:30:00',
    duration: 120,
    image: 'https://via.placeholder.com/800x500?text=Beethoven+Concert',
    gallery: [
      'https://via.placeholder.com/600x400?text=Beethoven+1',
      'https://via.placeholder.com/600x400?text=Beethoven+2',
      'https://via.placeholder.com/600x400?text=Beethoven+3'
    ],
    location: '數位音樂廳主廳',
    address: '台北市信義區松高路1號',
    genre: '古典音樂',
    description: '這場音樂會將呈現貝多芬最著名的鋼琴奏鳴曲，包括《月光》、《悲愴》和《熱情》。王小明將以其深厚的音樂造詣和精湛的技巧，帶領觀眾體驗貝多芬音樂中的情感與力量。',
    program: [
      { name: '鋼琴奏鳴曲第8號「悲愴」', duration: '20分鐘' },
      { name: '鋼琴奏鳴曲第14號「月光」', duration: '15分鐘' },
      { name: '中場休息', duration: '20分鐘' },
      { name: '鋼琴奏鳴曲第23號「熱情」', duration: '25分鐘' },
      { name: '鋼琴奏鳴曲第32號', duration: '25分鐘' }
    ],
    ticketAreas: [
      { id: 'vip', name: 'VIP座位', price: 1200, available: 15 },
      { id: 'a', name: 'A區座位', price: 800, available: 30 },
      { id: 'b', name: 'B區座位', price: 600, available: 45 },
      { id: 'c', name: 'C區座位', price: 400, available: 60 }
    ],
    reviews: [
      { id: 1, user: '音樂愛好者', rating: 5, comment: '非常震撼的演出，演奏家的技巧令人嘆為觀止！' },
      { id: 2, user: '古典樂迷', rating: 4, comment: '精彩的演繹，特別是悲愴奏鳴曲的第二樂章十分動人。' },
      { id: 3, user: '週末觀眾', rating: 5, comment: '絕佳的音樂會體驗，音響效果和演奏都很完美。' }
    ]
  },
  // ... 其他音樂會數據已省略
];
*/