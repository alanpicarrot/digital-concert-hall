import React, { createContext, useContext } from "react";

// 創建一個上下文對象
const DataContext = createContext();

// 模擬數據
const concertData = {
  upcomingConcerts: [
    {
      id: 1,
      title: "貝多芬第九號交響曲",
      artist: "臺北交響樂團",
      date: "2025/04/15",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
    {
      id: 2,
      title: "莫札特鋼琴協奏曲",
      artist: "鋼琴家王小明與臺北交響樂團",
      date: "2025/04/22",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
    {
      id: 3,
      title: "巴赫無伴奏大提琴組曲",
      artist: "大提琴家李大華",
      date: "2025/05/01",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
  ],

  pastConcerts: [
    {
      id: 4,
      title: "蕭邦夜曲集",
      artist: "鋼琴家陳美麗",
      date: "2025/03/10",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
    {
      id: 5,
      title: "德布西印象集",
      artist: "鋼琴家張小剛",
      date: "2025/02/20",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
  ],
  
  artists: [
    {
      id: 1,
      name: "臺北交響樂團",
      type: "orchestra",
      image: "/api/placeholder/300/300",
      description: "臺北交響樂團是一支國際知名的管弦樂團，由知名指揮家張大師創立於1980年。樂團致力於推廣古典音樂，每年舉辦超過50場音樂會，曲目涵蓋從巴洛克到現代的各個時期。",
      achievements: ["2022年獲選亞洲最佳樂團", "與超過30位世界級獨奏家合作", "錄製超過20張專輯"],
      upcomingPerformances: [1]
    },
    {
      id: 2,
      name: "王小明",
      type: "pianist",
      image: "/api/placeholder/300/300",
      description: "王小明是國際知名的鋼琴家，畢業於茱莉亞音樂學院。他以精湛的技巧和深刻的音樂理解而聞名，尤其擅長演奏莫札特和貝多芬的作品。他曾在世界各地的知名音樂廳演出。",
      achievements: ["2021年國際鋼琴大賽金獎", "與全球十大交響樂團合作", "錄製莫札特鋼琴協奏曲全集"],
      upcomingPerformances: [2]
    },
    {
      id: 3,
      name: "李大華",
      type: "cellist",
      image: "/api/placeholder/300/300",
      description: "李大華是當代最傑出的大提琴家之一，以其豐富的音色和深厚的表現力著稱。他畢業於柏林音樂學院，師從大提琴大師約翰內斯·施密特。他的巴赫無伴奏大提琴組曲演繹被譽為當代最佳詮釋之一。",
      achievements: ["2020年格萊美獎最佳古典演奏", "與超過20個國家的樂團合作", "錄製巴赫無伴奏大提琴組曲全集"],
      upcomingPerformances: [3]
    },
    {
      id: 4,
      name: "陳美麗",
      type: "pianist",
      image: "/api/placeholder/300/300",
      description: "陳美麗是一位傑出的鋼琴演奏家，專精於浪漫主義時期的作品，尤其是蕭邦的作品。她的演奏被形容為「充滿詩意且技術精湛」。她畢業於巴黎音樂學院，現任教於國立臺灣藝術大學。",
      achievements: ["2019年蕭邦國際鋼琴大賽銀獎", "舉辦超過100場獨奏會", "錄製蕭邦夜曲全集"],
      pastPerformances: [4]
    },
    {
      id: 5,
      name: "張小剛",
      type: "pianist",
      image: "/api/placeholder/300/300",
      description: "張小剛是一位專注於印象派音樂的鋼琴家，他對德布西和拉威爾作品的詮釋廣受讚譽。他畢業於英國皇家音樂學院，曾與多個國際樂團合作演出。",
      achievements: ["2018年國際德布西比賽冠軍", "於卡內基音樂廳舉辦獨奏會", "錄製德布西鋼琴作品全集"],
      pastPerformances: [5]
    },
  ],
  
  livestreams: [
    {
      id: 1,
      title: "週末古典音樂直播",
      description: "每週日晚間的古典音樂現場直播，由臺北交響樂團演奏經典作品。",
      date: "2025/04/20",
      time: "19:00",
      image: "/api/placeholder/300/200",
      status: "upcoming"
    },
    {
      id: 2,
      title: "鋼琴大師班直播",
      description: "國際知名鋼琴家王小明的大師班直播，將分享演奏技巧和音樂詮釋。",
      date: "2025/05/05",
      time: "14:00",
      image: "/api/placeholder/300/200",
      status: "upcoming"
    },
    {
      id: 3,
      title: "蕭邦夜曲與前奏曲",
      description: "鋼琴家陳美麗演奏蕭邦精選作品的錄播，包括夜曲和前奏曲。",
      date: "2025/03/25",
      time: "20:00",
      image: "/api/placeholder/300/200",
      status: "available",
      duration: "90 分鐘"
    },
    {
      id: 4,
      title: "巴赫大提琴獨奏",
      description: "大提琴家李大華演奏巴赫無伴奏大提琴組曲的錄播。",
      date: "2025/02/15",
      time: "19:30",
      image: "/api/placeholder/300/200",
      status: "available",
      duration: "120 分鐘"
    }
  ]
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

const DataProvider = ({ children }) => {
  return (
    <DataContext.Provider value={concertData}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
