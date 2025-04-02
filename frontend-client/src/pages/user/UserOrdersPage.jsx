import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import axios from 'axios';
import { 
  Loader2, ArrowRight, AlertCircle, CheckCircle, 
  Calendar, CreditCard, Clock, ShoppingBag, Music,
  Filter, RefreshCw, Plus
} from 'lucide-react';

const UserOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // 載入訂單資料
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // 檢查用戶登入狀態
      if (!authService.isTokenValid()) {
        console.log('用戶未登入或登入狀態失效，將重定向到登入頁面');
        navigate('/auth/login', {
          state: { 
            from: '/user/orders',
            message: '請先登入以查看您的訂單'
          }
        });
        return;
      }
      
      console.log('開始載入用戶訂單...');
      
      // 嘗試使用 fetch 代替 axiosInstance
      try {
        // 先嘗試使用已設置好的 orderService
        const data = await orderService.getUserOrders();
        // 確保返回的數據是一個數組
        const orderArray = Array.isArray(data) ? data : (data && data.content ? data.content : []);
        
        console.log('成功載入訂單數據:', { count: orderArray.length });
        
        // 按照訂單日期排序，最新的在前面
        const sortedOrders = orderArray.sort((a, b) => 
          new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt)
        );
        
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
        setActiveFilter('all');
      } catch (serviceError) {
        console.error('使用orderService載入訂單時出錯:', serviceError);
        
        // 如果 orderService 失敗，嘗試使用 fetch 直接呼叫 API
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:8081/api/orders/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          const orderArray = Array.isArray(data) ? data : (data && data.content ? data.content : []);
          
          console.log('使用fetch成功載入訂單數據:', { count: orderArray.length });
          
          const sortedOrders = orderArray.sort((a, b) => 
            new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt)
          );
          
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
          setActiveFilter('all');
        } catch (fetchError) {
          console.error('使用fetch載入訂單數據失敗:', fetchError);
          throw fetchError; // 將錯誤向上拋出以供外層catch捕獲
        }
      }
    } catch (err) {
      console.error('Error fetching orders', err);
      setError('無法載入訂單資料，請稍後再試。' + (err.message ? ` (${err.message})` : ''));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // 檢測 URL 中是否有刷新參數，如果有，強制刷新
    const forceRefresh = new URLSearchParams(window.location.search).get('refresh');
    console.log("訂單頁面載入，是否強制刷新: ", !!forceRefresh);
    fetchOrders();
  }, [navigate, window.location.search]);

  // 過濾訂單 - 修改以同時檢查訂單狀態和付款狀態
  const filterOrders = (status) => {
    setActiveFilter(status);
    let filtered = [];
    
    if (status === 'all') {
      filtered = orders;
      setFilteredOrders(orders);
    } else if (status === 'paid') {
      // 檢查 status === 'paid' 或 paymentStatus === 'paid'
      filtered = orders.filter(order => 
        order.status === 'paid' || order.paymentStatus === 'paid'
      );
      setFilteredOrders(filtered);
    } else {
      // 對其他狀態同時檢查 status 和 paymentStatus
      filtered = orders.filter(order => 
        order.status === status || order.paymentStatus === status
      );
      setFilteredOrders(filtered);
    }
    
    // 偵錯日誌
    console.log(`過濾訂單，狀態: ${status}，結果數量: ${filtered?.length || 0}`);
  };
  
  // 刷新訂單列表
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };
  
  // 格式化日期時間
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // 只用於開發測試：建立模擬訂單
  const createTestOrder = async () => {
    try {
      setLoading(true);
      // 使用當前時間戳加上隨機數建立訂單編號
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      const orderNumber = `DCH-${timestamp.toString().slice(-8)}${randomNum.toString().padStart(3, '0')}`;
      
      // 創建模擬訂單數據
      const mockOrder = {
        orderNumber: orderNumber,
        orderDate: new Date().toISOString(),
        totalAmount: 1500,
        status: 'pending',
        items: [
          { 
            concertTitle: '測試音樂會',
            description: 'VIP門票',
            quantity: 2,
            unitPrice: 750
          }
        ]
      };
      
      // 添加新訂單到列表
      setOrders(prevOrders => [mockOrder, ...prevOrders]);
      setFilteredOrders(prevOrders => [mockOrder, ...prevOrders]);
      
      alert(`已創建測試訂單 ${orderNumber}`);
    } catch (err) {
      console.error('Error creating test order', err);
      alert('建立測試訂單失敗');
    } finally {
      setLoading(false);
    }
  };

  // 渲染載入中或錯誤狀態
  const renderLoadingOrError = () => {
    if (loading && !refreshing) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader2 size={36} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">載入訂單資料中...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 bg-red-50 rounded-lg my-6 flex items-start">
          <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">發生錯誤</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-3 inline-flex items-center text-red-700 hover:text-red-900"
            >
              <RefreshCw size={14} className="mr-1" />
              重新載入
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* 頁面標題與刷新按鈕 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <ShoppingBag size={24} className="mr-2 text-indigo-600" />
          我的訂單
        </h1>
        
        <div className="flex items-center space-x-3">
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={createTestOrder}
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded"
            >
              <Plus size={16} className="mr-1" />
              測試訂單
            </button>
          )}
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center text-gray-600 hover:text-indigo-600 text-sm"
          >
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>
      
      {/* 載入中或錯誤狀態 */}
      {renderLoadingOrError()}
      
      {/* 主要內容 */}
      {!loading && !error && (
        <>
          {/* 過濾選項 */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex items-center overflow-x-auto">
            <Filter size={16} className="text-gray-500 mr-2 flex-shrink-0" />
            <div className="flex space-x-2">
              <button
                onClick={() => filterOrders('all')}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeFilter === 'all'
                    ? 'bg-indigo-100 text-indigo-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => filterOrders('paid')}
                className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                  activeFilter === 'paid'
                    ? 'bg-green-100 text-green-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CheckCircle size={14} className="mr-1" />
                已付款
              </button>
              <button
                onClick={() => filterOrders('pending')}
                className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                  activeFilter === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock size={14} className="mr-1" />
                待付款
              </button>
              <button
                onClick={() => filterOrders('cancelled')}
                className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                  activeFilter === 'cancelled'
                    ? 'bg-red-100 text-red-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <AlertCircle size={14} className="mr-1" />
                已取消
              </button>
            </div>
          </div>
          
          {/* 訂單列表 */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              {activeFilter !== 'all' ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Filter size={24} className="text-gray-400" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">沒有{activeFilter === 'paid' ? '已付款' : activeFilter === 'pending' ? '待付款' : '已取消'}的訂單</h2>
                  <p className="text-gray-500 mb-6">嘗試查看其他狀態的訂單或更改篩選條件</p>
                  <button
                    onClick={() => filterOrders('all')}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    查看全部訂單
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">您尚未有任何訂單</h2>
                  <p className="text-gray-500 mb-6">開始探索音樂廳的精彩演出，購買您喜愛的票券吧！</p>
                  <Link 
                    to="/concerts"
                    className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Music size={16} className="mr-2" />
                    瀏覽演出
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.orderNumber} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* 訂單標頭 */}
                  <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
                    <div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1.5">訂單編號:</span>
                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                        
                        {/* 訂單狀態標籤 - 修改以同時檢查訂單狀態和付款狀態 */}
                        <div className="ml-3">
                          {order.status === 'paid' || order.paymentStatus === 'paid' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" />
                              已付款
                            </span>
                          ) : order.status === 'pending' || order.paymentStatus === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock size={12} className="mr-1" />
                              待付款
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle size={12} className="mr-1" />
                              已取消
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* 訂單時間 */}
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(order.orderDate || order.createdAt)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center text-gray-700">
                        <CreditCard size={14} className="mr-1" />
                        <span className="text-sm">總金額:</span>
                      </div>
                      <div className="font-bold text-lg text-indigo-600">NT$ {order.totalAmount}</div>
                    </div>
                  </div>
                  
                  {/* 訂單內容 - 顯示票券信息，如果有的話 */}
                  {order.items && order.items.length > 0 && (
                    <div className="p-4 border-b">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">訂單內容:</h3>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <div>
                              <span className="font-medium">{item.concertTitle || '音樂會門票'}</span>
                              {item.description && (
                                <span className="text-gray-500 ml-1">({item.description})</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span>{item.quantity} x NT$ {item.unitPrice}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 訂單操作 - 修改以同時檢查訂單狀態和付款狀態 */}
                  <div className="px-6 py-3 flex justify-end space-x-3">
                    {(order.status === 'pending' || order.paymentStatus === 'pending') && 
                     (order.status !== 'paid' && order.paymentStatus !== 'paid') && (
                      <Link 
                        to={`/checkout/${order.orderNumber}`}
                        className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                      >
                        <CreditCard size={16} className="mr-1.5" />
                        前往付款
                      </Link>
                    )}
                    
                    <Link 
                      to={`/user/orders/${order.orderNumber}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      訂單詳情 <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserOrdersPage;
