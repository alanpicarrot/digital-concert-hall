// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    // 啟用所有瀏覽器自動等待功能
    actionTimeout: 0,
    // 啟用追蹤，以便獲取測試的更多信息
    trace: 'on-first-retry',
    // 啟用視訊錄製，以便在測試失敗時查看過程
    video: 'on-first-retry',
    // 啟用屏幕截圖，在測試失敗時保存屏幕截圖
    screenshot: 'only-on-failure',
    // 設置視窗大小
    viewport: { width: 1280, height: 720 },
    // 啟用控制台錯誤捕獲
    launchOptions: {
      slowMo: 100, // 放慢操作以便觀察
    }
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ],
});
