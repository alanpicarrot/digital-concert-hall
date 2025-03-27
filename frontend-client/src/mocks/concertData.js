export const mockConcerts = [
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
  {
    id: 2,
    title: '莫札特弦樂四重奏之夜',
    performer: '台北弦樂四重奏團',
    performerTitle: '室內樂團',
    performerBio: '台北弦樂四重奏團由四位頂尖的弦樂演奏家組成，專注於演奏古典和浪漫時期的室內樂作品。樂團成員均畢業於國際知名音樂學院，並在歐美及亞洲巡演獲得廣泛讚譽。',
    date: '2025-04-20T20:00:00',
    endTime: '2025-04-20T22:00:00',
    duration: 120,
    image: 'https://via.placeholder.com/800x500?text=Mozart+Quartet',
    gallery: [
      'https://via.placeholder.com/600x400?text=Mozart+1',
      'https://via.placeholder.com/600x400?text=Mozart+2',
      'https://via.placeholder.com/600x400?text=Mozart+3'
    ],
    location: '數位音樂廳主廳',
    address: '台北市信義區松高路1號',
    genre: '古典音樂',
    description: '這場音樂會將呈現莫札特最精彩的弦樂四重奏作品，展現他優雅成熟的創作風格。台北弦樂四重奏團將帶領觀眾進入莫札特細膩又富有情感的音樂世界。',
    program: [
      { name: '弦樂四重奏K.155', duration: '15分鐘' },
      { name: '弦樂四重奏K.421', duration: '25分鐘' },
      { name: '中場休息', duration: '20分鐘' },
      { name: '弦樂四重奏K.465「不協和音」', duration: '30分鐘' }
    ],
    ticketAreas: [
      { id: 'vip', name: 'VIP座位', price: 1000, available: 20 },
      { id: 'a', name: 'A區座位', price: 700, available: 35 },
      { id: 'b', name: 'B區座位', price: 500, available: 50 },
      { id: 'c', name: 'C區座位', price: 350, available: 65 }
    ],
    reviews: [
      { id: 1, user: '古典愛好者', rating: 5, comment: '精彩絕倫的演出，四位演奏家的配合天衣無縫！' },
      { id: 2, user: '樂迷小王', rating: 4, comment: '不協和音四重奏的詮釋特別出色，令人回味無窮。' }
    ]
  },
  {
    id: 3,
    title: '爵士樂之夜',
    performer: '藍調爵士樂團',
    performerTitle: '爵士樂團',
    performerBio: '藍調爵士樂團是一支結合了傳統爵士和現代元素的頂尖樂團，由鋼琴家、薩克斯風手、貝斯手和鼓手組成。樂團成員均有豐富的演出經驗，曾在各大爵士音樂節亮相並獲得廣泛讚譽。',
    date: '2025-04-25T20:30:00',
    endTime: '2025-04-25T22:30:00',
    duration: 120,
    image: 'https://via.placeholder.com/800x500?text=Jazz+Night',
    gallery: [
      'https://via.placeholder.com/600x400?text=Jazz+1',
      'https://via.placeholder.com/600x400?text=Jazz+2',
      'https://via.placeholder.com/600x400?text=Jazz+3'
    ],
    location: '數位音樂廳小廳',
    address: '台北市信義區松高路1號',
    genre: '爵士樂',
    description: '一場融合經典爵士與現代元素的精彩演出。藍調爵士樂團將帶來多首耳熟能詳的爵士標準曲目，以及他們的原創作品。這將是一個充滿即興演奏和動人旋律的夜晚。',
    program: [
      { name: '經典爵士組曲', duration: '30分鐘' },
      { name: '原創作品演出', duration: '25分鐘' },
      { name: '中場休息', duration: '15分鐘' },
      { name: '爵士即興演奏', duration: '35分鐘' }
    ],
    ticketAreas: [
      { id: 'vip', name: 'VIP座位', price: 800, available: 25 },
      { id: 'a', name: 'A區座位', price: 600, available: 40 },
      { id: 'b', name: 'B區座位', price: 400, available: 55 },
      { id: 'c', name: 'C區座位', price: 300, available: 70 }
    ],
    reviews: [
      { id: 1, user: '爵士發燒友', rating: 5, comment: '極具魅力的演出，樂手們的即興發揮讓人驚艷！' },
      { id: 2, user: '音樂學生', rating: 4, comment: '很享受這場演出，特別是原創曲目充滿創意。' },
      { id: 3, user: '週末觀眾', rating: 5, comment: '氛圍非常棒，音樂和場地的結合相得益彰。' }
    ]
  }
];