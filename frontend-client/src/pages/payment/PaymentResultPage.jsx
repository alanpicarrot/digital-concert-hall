import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 從URL參數獲取支付結果
  const queryParams = new URLSearchParams(location.search);
  const merchantTradeNo = queryParams.get('MerchantTradeNo');
  const rtnCode = queryParams.get('RtnCode'); // 1 為成功
  const rtnMsg = queryParams.get('RtnMsg');
  
  useEffect(() => {
    // 如果沒有訂單編號，重定向到訂單列表
    if (!merchantTradeNo) {
      navigate('/user/orders');
      return;
    }
    
    // 獲取訂單詳情
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/api/users/me/orders/${merchantTradeNo}`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
    
    // 如果支付成功，5秒後自動跳轉到訂單詳情
    if (rtnCode === '1') {
      const timer = setTimeout(() => {
        navigate(`/user/orders/${merchantTradeNo}`);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [merchantTradeNo, rtnCode, navigate]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-indigo-600 animate-spin mb-4" />
          <p className="text-xl text-gray-600">處理中，請稍候...</p>
        </div>
      </div>
    );
  }
  
  const isSuccess = rtnCode === '1';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        {isSuccess ? (
          <>
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">支付成功</h2>
            <p className="text-gray-600 mb-4">
              您的訂單已成功付款，感謝您的購買！
            </p>
            {orderDetails && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">訂單編號: {orderDetails.orderNumber}</p>
                <p className="text-sm text-gray-600 mb-1">訂單狀態: {orderDetails.status === 'paid' ? '已付款' : orderDetails.status}</p>
                <p className="text-sm text-gray-600">訂單金額: NT$ {orderDetails.totalAmount}</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-6">
              頁面將在5秒後自動跳轉至訂單詳情...
            </p>
            <div className="flex justify-between">
              <Link
                to="/"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
              >
                返回首頁
              </Link>
              <Link
                to={`/user/orders/${merchantTradeNo}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center"
              >
                查看訂單 <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">支付失敗</h2>
            <p className="text-gray-600 mb-4">
              很抱歉，您的付款未能完成。
            </p>
            <p className="text-sm text-red-500 mb-6 p-4 bg-red-50 rounded-lg">
              錯誤訊息: {rtnMsg || '未知錯誤'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
              >
                返回購物車
              </button>
              <button
                onClick={() => navigate(`/checkout/${merchantTradeNo}`)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
              >
                重新嘗試
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
