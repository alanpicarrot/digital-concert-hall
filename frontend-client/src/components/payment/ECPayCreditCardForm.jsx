import React from 'react';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

/**
 * 綠界信用卡付款表單組件
 * 僅用於測試環境，不會實際處理信用卡資料
 */
const ECPayCreditCardForm = ({ orderDetails }) => {
  return (
    <div className="p-5">
      {/* 頂部標題 */}
      <div className="bg-green-600 p-4 text-white text-center mb-4 -mx-5 -mt-5">
        <div className="flex items-center justify-center">
          <CreditCard size={20} className="mr-2" />
          <h2 className="text-xl font-bold">信用卡付款</h2>
        </div>
      </div>
      
      {/* 信用卡類型 */}
      <div className="flex justify-center space-x-2 mb-4">
        <div className="w-12 h-7 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">VISA</div>
        <div className="w-12 h-7 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">MC</div>
        <div className="w-12 h-7 bg-gray-700 rounded text-white flex items-center justify-center text-xs font-bold">JCB</div>
      </div>
      
      {/* 訂單資訊區塊 - 引用圖片中的樣式 */}
      <div className="mb-4">
        <div className="border-b border-gray-200 pb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600 text-sm">訂單編號:</span>
            <span className="font-medium text-sm">{orderDetails.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600 text-sm">商品名稱:</span>
            <span className="font-medium text-sm">VIP票 x 1</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600 text-sm font-medium">應付金額:</span>
            <span className="font-bold text-blue-700">NT$ {orderDetails.amount}</span>
          </div>
        </div>
      </div>
      
      {/* 模擬ECPay信用卡輸入區 */}
      <div className="mt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">信用卡號碼</label>
          <input 
            type="text" 
            className="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500" 
            placeholder="4311-2222-3333-4444" 
            readOnly
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">到期日期</label>
            <input 
              type="text" 
              className="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500" 
              placeholder="MM/YY" 
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV 安全碼</label>
            <input 
              type="text" 
              className="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500" 
              placeholder="123" 
              readOnly
            />
          </div>
        </div>
        
        {/* 安全提示 */}
        <div className="mt-3 mb-2 text-center">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Lock size={12} className="mr-1" />
            測試環境：不會實際收集信用卡資料
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECPayCreditCardForm;