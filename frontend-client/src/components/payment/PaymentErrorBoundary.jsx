import React from "react";
import { AlertTriangle, RefreshCw, Home, CreditCard } from "lucide-react";

class PaymentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能夠顯示降級後的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 記錄錯誤信息
    console.error("Payment Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // 這裡可以將錯誤信息發送到錯誤報告服務
    if (process.env.NODE_ENV === "production") {
      // 生產環境中發送錯誤報告
      // this.logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            {/* 錯誤圖示 */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <AlertTriangle size={40} className="text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                付款處理發生錯誤
              </h1>
              <p className="text-gray-600">
                我們在處理您的付款時遇到了技術問題
              </p>
            </div>

            {/* 錯誤詳情 */}
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                錯誤詳情：
              </h3>
              <div className="text-sm text-red-700 space-y-1">
                <p>
                  <strong>錯誤訊息：</strong>{" "}
                  {this.state.error?.message || "未知錯誤"}
                </p>
                <p>
                  <strong>發生時間：</strong>{" "}
                  {new Date().toLocaleString("zh-TW")}
                </p>
                {process.env.NODE_ENV === "development" &&
                  this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-600 font-medium">
                        技術詳情 (開發模式)
                      </summary>
                      <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
              </div>
            </div>

            {/* 建議操作 */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                <CreditCard size={16} className="inline mr-1" />
                付款安全提醒：
              </h3>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• 如果您的付款已經完成，請不要重複付款</li>
                <li>• 可以到「我的訂單」查看付款狀態</li>
                <li>• 如有疑問，請聯繫客服：02-2655-0115</li>
              </ul>
            </div>

            {/* 操作按鈕 */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw size={20} className="mr-2" />
                重新嘗試
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleGoBack}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  返回上一頁
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-sm"
                >
                  <Home size={16} className="mr-1" />
                  返回首頁
                </button>
              </div>
            </div>
          </div>

          {/* 頁腳 */}
          <div className="mt-12 text-center text-xs text-gray-500">
            <p>錯誤ID: {Date.now()} | © 2025 數位音樂廳</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PaymentErrorBoundary;
