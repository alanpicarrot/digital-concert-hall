import React, { useEffect, useState } from "react";
import { getConcertList } from "../services/concertService";

const ConcertsPage = () => {
  const [concerts, setConcerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConcerts = async () => {
      try {
        const data = await getConcertList();
        setConcerts(data);
      } catch (err) {
        console.error("加載音樂會失敗:", err);
        setError("無法加載音樂會列表，請稍後再試。");
      }
    };

    loadConcerts();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>音樂會列表</h1>
      <ul>
        {concerts.map((concert) => (
          <li key={concert.id}>{concert.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConcertsPage;
