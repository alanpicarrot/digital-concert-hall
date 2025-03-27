import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/me/orders');
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders', err);
        setError('無法載入訂單資料，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 只用於開發測試：建立模擬訂單
  const createTestOrder = async () => {
    try {
      setLoading(true);
      // 使用當前時間戳加上隨機數建立訂單編號
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      const orderNumber = `DCH${timestamp}${randomNum}`;
      
      // 這裡假設後端有個 /api/test/orders 端點用於建立測試訂單
      // 在實際專案中，這會被實際的訂單創建流程替代
      const response = await axios.post('/api/test/orders', {
        orderNumber,
        totalAmount: 1000,
        items: [
          { name: '標準票券', quantity: 2, price: 500 }
        ]
      });
      
      // 添加新訂單到列表
      setOrders(prevOrders => [response.data, ...prevOrders]);
    } catch (err) {
      console.error('Error creating test order', err);
      alert('建立測試訂單失敗');
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 size={36} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg my-6 flex items-start">
        <AlertCircle className="text-red-500 mr-3 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800">發生錯誤</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的訂單</h1>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={createTestOrder}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            建立測試訂單
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-medium mb-2">您尚未有任何訂單</h2>
          <p className="text-gray-500 mb-6">開始探索音樂廳的精彩演出，購買您喜愛的票券吧！</p>
          <Link 
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            瀏覽演出
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      NT$ {order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status === 'paid' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          已付款
                        </span>
                      ) : order.status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          待付款
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          已取消
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {order.status === 'pending' ? (
                        <Link 
                          to={`/checkout/${order.orderNumber}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          去付款
                        </Link>
                      ) : null}
                      <Link 
                        to={`/user/orders/${order.orderNumber}`}
                        className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                      >
                        詳情 <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;
