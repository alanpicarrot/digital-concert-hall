# API 路徑規範

為避免前後端 API 路徑不匹配問題，請嚴格遵守以下規範：

## 核心原則

所有 API 路徑必須統一且一致。在我們的專案中，所有 API 路徑均以 `/api` 為前綴。

## 1. 後端 Spring Boot 配置

- `application.properties` 中**不使用** `server.servlet.context-path`
- 所有控制器必須在 `@RequestMapping` 中包含 `/api` 前綴

```java
// 正確範例：
@RestController
@RequestMapping("/api/concerts") 
public class ConcertController {
    // ...
}

// 錯誤範例：
@RestController
@RequestMapping("/concerts") // 缺少 /api 前綴
public class ConcertController {
    // ...
}
```

## 2. 前端環境變量

- `REACT_APP_API_URL` 設置為基本 URL，**不包含** `/api` 前綴
- 例如: `REACT_APP_API_URL=http://localhost:8081`

```
# .env.development 範例
REACT_APP_API_URL=http://localhost:8081
```

## 3. 前端 API 請求

- 所有 API 請求路徑**必須**以 `/api/` 開頭
- 不要在 `axiosInstance` 的 `baseURL` 中添加 `/api` 前綴

```javascript
// authService.js 正確範例
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
const axiosInstance = axios.create({
  baseURL: API_URL,
  // ...
});

// API 請求正確範例：
axiosInstance.get('/api/concerts');

// API 請求錯誤範例：
axiosInstance.get('/concerts'); // 缺少 /api 前綴
```

## 4. 前端服務實現

所有服務模組必須在請求路徑中包含 `/api` 前綴：

```javascript
// concertService.js 範例
const getAllConcerts = () => {
  return axiosInstance.get('/api/concerts');
};

const getConcertById = (id) => {
  return axiosInstance.get(`/api/concerts/${id}`);
};
```

## 5. 路徑檢查工具

為確保API路徑的一致性，建議使用以下路徑驗證函數：

```javascript
// apiUtils.js
export const validateApiPath = (path) => {
  if (!path.startsWith('/api/')) {
    console.warn(`警告: API 路徑 "${path}" 應該以 "/api/" 開頭`);
    return `/api${path}`; // 自動修正
  }
  return path;
};

// 在服務中使用
const getAllConcerts = () => {
  return axiosInstance.get(validateApiPath('/api/concerts'));
};
```

## 歷史問題說明

此規範的制定是基於多次遭遇的API路徑不匹配問題。主要困擾是由於多處設置了 `/api` 前綴導致的重複路徑（例如 `/api/api/...`）或缺少前綴導致的 404 錯誤。

遵循以上規範可以確保前後端 API 路徑一致，避免出現 404 或重複前綴問題。