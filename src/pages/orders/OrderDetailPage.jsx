import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import orderService from '../../services/orderService';

const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderNumber]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderDetail(orderNumber);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      setError('無法載入訂單資料，請稍後再試。');
      setLoading(false);
      console.error('獲取訂單詳情失敗:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm');
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '處理中',
      'paid': '已付款',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      'pending': '待處理',
      'completed': '已完成',
      'failed': '失敗'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/user/orders" className="text-blue-600 hover:text-blue-800">
          &larr; 返回訂單列表
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">訂單詳情</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : order ? (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm text-gray-500 uppercase tracking-wider">訂單編號</h3>
                <p className="text-lg font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 uppercase tracking-wider">訂單日期</h3>
                <p className="text-lg">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 uppercase tracking-wider">訂單狀態</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-3">付款資訊</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm text-gray-500 uppercase tracking-wider">付款方式</h3>
                <p className="text-lg">{order.paymentMethod || '未指定'}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 uppercase tracking-wider">付款狀態</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {getPaymentStatusText(order.paymentStatus)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold mb-3">訂單項目</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      音樂會
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      表演場地
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      表演時間
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      票種
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      數量
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      單價
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      小計
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.concertTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.performanceVenue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(item.performanceStartTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.ticketTypeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">NTD$ {item.unitPrice}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">NTD$ {item.subtotal}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="6" className="px-6 py-4 text-right font-medium">
                      總計:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">NTD$ {order.totalAmount}</div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {order.status === 'paid' && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Link 
                to="/user/tickets" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                查看我的票券
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl text-gray-600">找不到該訂單</h2>
          <Link 
            to="/user/orders" 
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            返回訂單列表
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
