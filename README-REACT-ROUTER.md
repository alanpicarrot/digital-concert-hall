# 數位音樂廳 React Router 配置指南

本文檔將幫助您完成在數位音樂廳項目中配置和使用 React Router。

## 1. 安裝 React Router

首先，您需要安裝 React Router 套件。在項目根目錄中運行以下命令：

```bash
npm install react-router-dom
```

或者，您可以直接運行我們提供的腳本：

```bash
bash install-react-router.sh
```

## 2. 項目結構說明

我們已經重構了項目，以支持基於路由的導航：

- `src/components/Layout.jsx`：通用佈局組件，包含頁眉和頁腳
- `src/components/DataProvider.jsx`：數據提供者，用於在整個應用中共享數據
- `src/pages/`：各個路由對應的頁面組件
  - `HomePage.jsx`：首頁
  - `ConcertsPage.jsx`：音樂會列表頁
  - `ConcertDetailPage.jsx`：音樂會詳情頁
  - `LivestreamPage.jsx`：直播頁面
  - `NotFoundPage.jsx`：404 頁面

## 3. 路由配置

在 `App.js` 中，我們已經配置了以下路由：

- `/` - 首頁
- `/concerts` - 音樂會列表頁
- `/concert/:id` - 音樂會詳情頁，包含動態參數 id
- `/livestream/:id` - 直播頁面，包含動態參數 id
- `*` - 捕獲所有未匹配的路由，顯示 404 頁面

## 4. 頁面間導航

我們使用了 React Router 提供的組件進行頁面間導航：

- `Link` - 用於普通鏈接
- `NavLink` - 用於導航菜單，支持 `isActive` 屬性來顯示當前活動項
- `useParams` - 用於獲取 URL 參數，例如在詳情頁中獲取 id

## 5. 下一步開發建議

1. **完善藝術家頁面**：實現藝術家列表和詳情頁
2. **實現購物車功能**：完成購物車頁面和結賬流程
3. **用戶認證**：添加登錄和註冊頁面
4. **後端集成**：通過 API 獲取實際數據，而不是使用硬編碼的模擬數據
5. **表單驗證**：為搜索、註冊和支付表單添加驗證

## 6. 後端 API 集成

當您準備好將前端與後端 API 集成時，您可以在 `DataProvider.jsx` 中添加 API 調用：

```javascript
import React, { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

const DataProvider = ({ children }) => {
  const [upcomingConcerts, setUpcomingConcerts] = useState([]);
  const [pastConcerts, setPastConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        // 獲取即將到來的音樂會
        const upcomingResponse = await fetch('/api/concerts/upcoming');
        const upcomingData = await upcomingResponse.json();
        setUpcomingConcerts(upcomingData);

        // 獲取過去的音樂會
        const pastResponse = await fetch('/api/concerts/past');
        const pastData = await pastResponse.json();
        setPastConcerts(pastData);

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  return (
    <DataContext.Provider value={{ 
      upcomingConcerts, 
      pastConcerts, 
      loading, 
      error 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
```

## 7. 部署注意事項

如果您使用後端服務器（如 Spring Boot），請確保配置它以支持前端路由。對於 Spring Boot，您可以添加以下配置類：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{spring:\\w+}")
                .setViewName("forward:/");
        registry.addViewController("/**/{spring:\\w+}")
                .setViewName("forward:/");
        registry.addViewController("/{spring:\\w+}/**{spring:?!(\\.js|\\.css)$}")
                .setViewName("forward:/");
    }
}
```

這將確保所有不匹配靜態資源的請求都被轉發到前端應用，從而允許 React Router 處理路由。

## 8. 測試

您可以通過以下命令運行應用：

```bash
npm start
```

然後，在瀏覽器中訪問 http://localhost:3000 查看您的應用。嘗試點擊不同的鏈接，觀察 URL 變化和頁面內容更新。
