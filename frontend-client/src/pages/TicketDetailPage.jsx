import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import concertService from '../services/concertService';
import TicketInfoCard from '../components/tickets/TicketInfoCard';

function TicketDetailPage() {
    const { concertId, ticketType } = useParams();
    const toast = useToast();
    const [ticketDetails, setTicketDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTicketDetails = async () => {
            try {
                setLoading(true);
                const details = await concertService.getTicketDetails(concertId, ticketType);
                
                // 驗證票券類型是否匹配 - 忽略大小寫和空格差異
                const normalizedRequestType = ticketType.toLowerCase().replace(/\s+/g, '');
                const normalizedResponseType = details.type.toLowerCase().replace(/\s+/g, '');
                
                if (normalizedResponseType !== normalizedRequestType) {
                    console.warn(`票券類型不匹配: 請求=${ticketType}, 回應=${details.type}`);
                    // 不中斷執行，但記錄警告
                }

                setTicketDetails(details);
                setLoading(false);
            } catch (error) {
                console.error('載入票券詳情失敗:', error);
                toast.showError('無法載入票券詳情', error.message);
                setError(error);
                setLoading(false);
            }
        };
        
        loadTicketDetails();
    }, [concertId, ticketType, toast]);

    if (loading) {
        return <div>載入中...</div>;
    }

    if (error) {
        return (
            <div className="text-red-600">
                載入票券詳情時發生錯誤。請稍後再試。
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">
                {ticketDetails.concert.title} - {ticketDetails.type} 票券
            </h1>
            
            <TicketInfoCard 
                ticket={ticketDetails}
                onAddToCart={() => {/* 加入購物車邏輯 */}}
            />
        </div>
    );
}

export default TicketDetailPage;
