import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 啟動時清除任何過期或測試用戶資訊
// 這可以防止應用程序加載時顯示測試用戶
const cleanupStorage = () => {
  console.log('應用啟動: 清除過期用戶資訊');
  const isValidSession = () => {
    const adminUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');
    return adminUser && token && JSON.parse(adminUser).username !== 'testuser';
  };
  
  if (!isValidSession()) {
    console.log('清除無效的登入資訊');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

cleanupStorage();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
