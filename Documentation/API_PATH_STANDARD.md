# API 路徑規範

為避免前後端 API 路徑不匹配問題，請嚴格遵守以下規範：

## 1. 後端 Spring Boot 配置

- `application.properties` 中**不使用** `server.servlet.context-path`
- 所有控制器必須在 `@RequestMapping` 中包含 `/api` 前綴

```java
@RestController
@RequestMapping("/api/concerts") // 正確: 包含 /api 前綴
public class ConcertController {
    // ...
}
```

## 2. 前端環境變量

- `REACT_APP_API_URL` 設置為基本 URL，**不包含** `/api` 前綴
- 例如: `REACT_APP_API_URL=http://localhost:8081`

```properties
# .env.development
REACT_APP_API_URL=http://localhost:8081
```

## 3. 前端 API 請求

- 所有 API 請求路徑**必須**以 `/api/` 開頭
- 使用 `validateApiPath` 函數確保路徑正確

```javascript
import { validateApiPath } from '../utils/apiUtils';

// 正確
const path = validateApiPath('/api/concerts');
axiosInstance.get(path);

// 錯誤
axiosInstance.get('/concerts');
```

## 4. API 路徑驗證工具

在前端工程中，使用 `validateApiPath` 函數來保證所有 API 路徑的一致性：

```javascript
// apiUtils.js
export const validateApiPath = (path) => {
  if (!path.startsWith('/api/')) {
    console.warn(`警告: API 路徑 "${path}" 應該以 "/api/" 開頭`);
    return path.startsWith('/') ? `/api${path}` : `/api/${path}`;
  }
  return path;
};
```

## 5. API 路徑最佳實踐

- 在前端 Service 檔案中，使用常量定義 API 基礎路徑：

```javascript
// 正確
const API_BASE_PATH = '/api/users/me/tickets';
const path = validateApiPath(`${API_BASE_PATH}/${ticketId}`);
axiosInstance.get(path);

// 避免
axiosInstance.get(`/users/me/tickets/${ticketId}`);
```

遵循以上規範可以確保前後端 API 路徑一致，避免出現 404 或重複前綴問題。
