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
                setError(null);
                console.log(`加載 ${concertId} 音樂會的 ${ticketType} 票券詳情...`);
                
                const details = await concertService.getTicketDetails(concertId, ticketType);
                
                // 確保返回的數據是有效的
                if (!details) {
                    throw new Error('無法獲取票券詳情');
                }
                
                console.log(`成功加載票券詳情:`, details);
                
                // 驗證票券類型是否匹配 - 忽略大小寫和空格差異
                if (details.type) {
                    const normalizedRequestType = ticketType.toLowerCase().replace(/\s+/g, '');
                    const normalizedResponseType = details.type.toLowerCase().replace(/\s+/g, '');
                    
                    if (normalizedResponseType !== normalizedRequestType) {
                        console.warn(`票券類型不匹配: 請求=${ticketType}, 回應=${details.type}`);
                    }
                }

                setTicketDetails(details);
            } catch (error) {
                console.error('加載票券詳情失敗:', error);
                toast.showError('無法加載票券詳情', error.message);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        
        loadTicketDetails();
    }, [concertId, ticketType, toast]);

    if (loading) {
        return <div className="container mx-auto px-4 py-6">
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                <div className="ml-3">加載票券詳情中...</div>
            </div>
        </div>;
    }

    if (error || !ticketDetails) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                    <p className="font-bold">無法加載票券詳情</p>
                    <p>{error?.message || '請嘗試重新整理頁面或選擇其他票券'}</p>
                    <button 
                        onClick={() => window.location.href = `/concerts/${concertId}`}
                        className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded"
                    >
                        回到音樂會詳情
                    </button>
                </div>
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
