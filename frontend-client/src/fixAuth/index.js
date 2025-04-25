/**
 * 認證修復模組入口
 * 在應用初始化時自動載入並應用修復
 */

import { detectAndFixAuthIssues } from './authDetector';

// 在應用啟動時自動執行
const initAuthFixes = () => {
  // 等待 DOM 加載完成後執行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFixes);
  } else {
    runFixes();
  }
  
  // 在頁面加載完成後也進行一次檢測
  window.addEventListener('load', () => {
    console.log('頁面完全載入，再次檢測認證問題...');
    detectAndFixAuthIssues();
  });
};

// 執行所有修復
function runFixes() {
  console.log('初始化認證問題檢測與修復...');
  
  // 自動檢測與修復認證問題
  const authStatus = detectAndFixAuthIssues();
  
  // 記錄檢測結果
  console.log('認證檢測結果:', authStatus);
  
  // 在 console 中顯示幫助信息
  console.info(
    '%c認證修復工具已載入: 如果遇到 401 錯誤，請在控制台中執行 window.fixApiAuthProblem() 手動修復',
    'background: #4CAF50; color: white; padding: 4px; border-radius: 3px;'
  );
}

// 自動執行初始化
initAuthFixes();

export default {
  detectAndFixAuthIssues
};
