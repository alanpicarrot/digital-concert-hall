import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const UserOrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/me/orders/${orderNumber}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details', err);
        setError('無法載入訂單詳情，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrderDetail();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 size={36} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 bg-red-50 rounded-lg my-6 flex items-start">
          <AlertCircle className="text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">發生錯誤</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => navigate('/user/orders')}
              className="mt-4 text-red-800 underline"
            >
              返回訂單列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold mb-4 text-center">找不到訂單</h2>
          <p className="text-gray-600 mb-6 text-center">無法找到訂單編號為 {orderNumber} 的訂單詳情。</p>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/user/orders')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              返回訂單列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/user/orders')}
            className="text-gray-600 hover:text-gray-900 flex items-center mr-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            返回列表
          </button>
          <h1 className="text-2xl font-bold">訂單詳情</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">訂單 #{order.orderNumber}</h2>
                <p className="text-gray-500 text-sm">
                  建立時間：{new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="ml-4">
                {order.status === 'paid' ? (
                  <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                    <CheckCircle size={16} className="mr-1" />
                    <span className="font-medium text-sm">已付款</span>
                  </div>
                ) : order.status === 'pending' ? (
                  <div className="flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    <Clock size={16} className="mr-1" />
                    <span className="font-medium text-sm">待付款</span>
                  </div>
                ) : (
                  <div className="flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
                    <AlertCircle size={16} className="mr-1" />
                    <span className="font-medium text-sm">已取消</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="font-semibold mb-3">訂單項目</h3>
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium">{item.ticket.ticketType.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.ticket.event?.name || '音樂會'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div>NT$ {item.price} x {item.quantity}</div>
                    <div className="font-medium">NT$ {item.price * item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">小計：</span>
                <span>NT$ {order.subtotalAmount}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">折扣：</span>
                  <span className="text-green-600">- NT$ {order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                <span>總計：</span>
                <span className="text-indigo-600">NT$ {order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {order.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">訂單尚未付款</h3>
            <p className="text-yellow-700 mb-4">
              請儘快完成付款以確保您的票券。未付款的訂單可能會在系統中自動取消。
            </p>
            <Link 
              to={`/checkout/${order.orderNumber}`}
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg"
            >
              前往付款
            </Link>
          </div>
        )}

        {order.status === 'paid' && order.tickets && order.tickets.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 text-green-800">票券已產生</h3>
            <p className="text-green-700 mb-4">
              您可以在「我的票券」頁面查看和下載電子票券。
            </p>
            <Link 
              to="/user/tickets"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              查看我的票券
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrderDetailPage;
