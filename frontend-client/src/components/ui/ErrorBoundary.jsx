import React, { Component } from 'react';
import { Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // 更新狀態，下次渲染會顯示備用 UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 可以將錯誤日誌發送到服務
    console.error('ErrorBoundary 捕獲到錯誤:', error);
    console.error('詳細錯誤信息:', errorInfo);
    this.setState({ errorInfo });
    
    // 可選：將錯誤資訊發送到後端或分析服務
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // 顯示自定義的備用 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-600 p-6">
              <h2 className="text-2xl font-bold text-white">出現意外錯誤</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                很抱歉，應用程式發生了錯誤。我們的技術團隊已經收到此問題的通知，並正在處理。
              </p>
              
              <div className="bg-gray-50 p-4 rounded mb-4 overflow-auto max-h-40">
                <p className="text-sm font-mono text-gray-800 break-all">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  重新整理
                </button>
                
                <a
                  href="/"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Home size={16} className="mr-2" />
                  返回首頁
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 正常情況下渲染子組件
    return this.props.children;
  }
}

export default ErrorBoundary;