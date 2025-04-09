import React from 'react';

/**
 * 綠界支付按鈕組件
 * 固定位於頁面底部的取消和確認按鈕
 */
const ECPayActionButtons = ({ loading, onCancel, onConfirm }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center space-x-3">
      <button
        onClick={onCancel}
        className="w-1/2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        取消支付
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`w-1/2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="