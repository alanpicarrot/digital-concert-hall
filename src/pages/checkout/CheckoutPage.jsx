import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CreditCard } from 'lucide-react';
import axios from 'axios';

const CheckoutPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 獲取訂單詳情
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/me/orders/${orderNumber}`);
        setOrder(response.data);
        
        // 如果訂單已支付，直接導向到訂單詳情頁
        if (response.data.status === 'paid') {
          navigate(`/user/orders/${orderNumber}`);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('無法載入訂單資訊，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber, navigate]);

  // 處理支付請求
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      
      // 創建表單請求，返回HTML
      const response = await axios.post(
        '/api/payment/ecpay/create',
        { orderNumber },
        { responseType: 'text' }
      );
      
      // 創建一個臨時的HTML元素來處理返回的表單
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = response.data;
      
      // 將返回的HTML插入到body並提交表單
      document.body.appendChild(tempDiv);
      
      // 如果測試環境, 我們可以添加一個模擬的延遲
      if (process.env.NODE_ENV === 'development') {
        const testMode = true; // 設置為true以使用開發測試模式
        
        if (testMode) {
          // 模擬流程 - 僅在開發環境中
          setTimeout(() => {
            // 使用管理員測試API模擬支付成功
            axios.post(`/api/payment/ecpay/test-notify?orderNumber=${orderNumber}&success=true`)
              .then(() => {
                navigate(`/payment/result?MerchantTradeNo=${orderNumber}&RtnCode=1&RtnMsg=交易成功`);
              })
              .catch(error => {
                console.error('Error simulating payment:', error);
                setPaymentLoading(false);
                setError('模擬支付失敗，請稍後再試。');
              });
          }, 2000);
          return;
        }
      }
      
      // 如果不是測試模式，自動提交表單
      const form = tempDiv.querySelector('form');
      if (form) {
        form.submit();
      } else {
        setError('無法處理支付表單，請稍後再試。');
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('建立支付請求失敗，請稍後再試。');
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-indigo-600 animate-spin mb-4" />
          <p className="text-xl text-gray-600">載入訂單資訊中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-center">發生錯誤</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/user/orders')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg"
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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-bold mb-4">找不到訂單</h2>
          <p className="text-gray-600 mb-6">無法找到指定的訂單信息。</p>
          <button
            onClick={() => navigate('/user/orders')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg"
          >
            返回訂單列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">確認訂單並付款</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">訂單摘要</h2>
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">訂單編號：</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">訂單日期：</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">訂單狀態：</span>
                <span className="font-medium">
                  {order.status === 'pending' ? '待付款' : 
                   order.status === 'paid' ? '已付款' : 
                   order.status === 'cancelled' ? '已取消' : order.status}
                </span>
              </div>
            </div>
            
            <h3 className="font-semibold mb-3">訂購項目</h3>
            <div className="mb-4 pb-4 border-b border-gray-200">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <div className="flex-1">
                    <span className="font-medium">{item.ticket.ticketType.name}</span>
                    <span className="text-gray-500 text-sm ml-2">x {item.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span>NT$ {item.price}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-600">小計：</span>
              <span className="font-medium">NT$ {order.subtotalAmount}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-600">折扣：</span>
                <span className="font-medium text-green-600">- NT$ {order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2 border-t border-gray-200">
              <span className="text-lg font-semibold">總計：</span>
              <span className="text-xl font-bold text-indigo-600">NT$ {order.totalAmount}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">付款方式</h2>
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex items-center">
              <input
                type="radio"
                id="credit-card"
                name="payment-method"
                checked={true}
                readOnly
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="credit-card" className="ml-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium">信用卡支付</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  使用綠界金流處理，安全便捷
                </p>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-6 rounded-lg"
          >
            返回
          </button>
          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className={`flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-8 rounded-lg ${
              paymentLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {paymentLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                處理中...
              </>
            ) : (
              '確認付款'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
