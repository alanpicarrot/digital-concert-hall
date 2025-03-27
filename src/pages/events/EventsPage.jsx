import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Calendar, Clock, MapPin } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // 正常情況下，這裡會從後端API獲取活動列表
        // 但為了測試，我們可以使用模擬數據
        const mockEvents = [
          {
            id: 1,
            name: '莫札特鋼琴協奏曲之夜',
            description: '由國際知名鋼琴家演繹莫札特最經典的鋼琴協奏曲，與管弦樂團共同呈現音樂盛宴。',
            date: '2025-04-15T19:30:00',
            venue: '國家音樂廳',
            imageUrl: 'https://via.placeholder.com/800x450?text=Mozart+Piano+Concert',
            ticketTypes: [
              { id: 1, name: 'VIP席', price: 1500, description: '最佳視聽位置，含精美節目冊' },
              { id: 2, name: