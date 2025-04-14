# 用戶狀態管理功能實作記錄

本文件記錄了針對數位音樂廳後台管理系統中用戶管理功能的改進實作過程。

## 需求描述

原始需求：
> 用戶管理的狀態編輯沒有實作，我希望這個狀態預設為開啟，可以選擇開啟，停用或是封存，其中封存是用來取代刪除帳號的功能，只讓帳號無法從介面顯示，操作與登入，避免誤刪造成資料庫的操作紀錄產生不明空值。

## 主要修改內容

1. **新增三種用戶狀態：**
   - `ENABLED`（開啟）：預設狀態，允許用戶正常登入和使用系統
   - `DISABLED`（停用）：暫時禁用帳號，用戶無法登入
   - `ARCHIVED`（封存）：替代刪除功能，用戶會從列表中隱藏但資料保留

2. **用戶列表中狀態顯示：**
   - 以不同顏色和圖示直觀顯示用戶狀態
   - 隱藏封存狀態的用戶，實現資料保留但不顯示

3. **狀態編輯界面：**
   - 在用戶編輯表單中添加狀態選擇區塊
   - 提供直觀的單選按鈕組供管理員選擇
   - 封存選項特別標明其取代刪除功能的用途

4. **API整合：**
   - 添加狀態更新相關函數
   - 實現封存用戶替代刪除的功能

## 實作方法

### 前端修改

1. 在 `UsersPage.jsx` 中添加狀態相關功能：
   - 增加 `handleUpdateUserStatus` 函數處理狀態變更
   - 添加 `handleArchiveUser` 函數用於封存操作
   - 修改表單提交處理，支持狀態變更

2. UI改進：
   - 用戶列表狀態欄顯示不同圖示和顏色標籤
   - 編輯表單添加狀態選擇單選按鈕組
   - 將刪除按鈕改為封存按鈕，使用封存圖示

### 前後端整合

- 通過 `PATCH /api/admin/users/{userId}/status?status={status}` 端點更新用戶狀態
- 使用過濾器方法隱藏封存狀態的用戶：
  ```javascript
  const filteredUsers = users.filter((user) => {
    // 如果用戶狀態為ARCHIVED，則不顯示在列表中
    if (user.status === "ARCHIVED") return false;
    ...
  });
  ```

## 關鍵代碼片段

狀態顯示：
```jsx
<td className="px-6 py-4 whitespace-nowrap">
  {user.status === "ENABLED" || (!user.status && user.active) ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle size={14} className="mr-1" />
      開啟
    </span>
  ) : user.status === "DISABLED" || (!user.status && !user.active) ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      <XCircle size={14} className="mr-1" />
      停用
    </span>
  ) : user.status === "ARCHIVED" ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <Archive size={14} className="mr-1" />
      封存
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle size={14} className="mr-1" />
      開啟
    </span>
  )}
</td>
```

狀態選擇UI：
```jsx
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-1">
    狀態
  </label>
  <div className="space-y-2">
    <div className="flex items-center">
      <input
        type="radio"
        id="status-enabled"
        name="status"
        value="ENABLED"
        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
        defaultChecked={(selectedUser?.status === "ENABLED" || (!selectedUser?.status && selectedUser?.active)) || modalMode === "create"}
      />
      <label
        htmlFor="status-enabled"
        className="ml-2 text-gray-700 flex items-center"
      >
        <CheckCircle size={14} className="mr-1 text-green-600" />
        開啟
      </label>
    </div>
    <div className="flex items-center">
      <input
        type="radio"
        id="status-disabled"
        name="status"
        value="DISABLED"
        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
        defaultChecked={selectedUser?.status === "DISABLED" || (!selectedUser?.status && !selectedUser?.active && selectedUser?.status !== "ARCHIVED")}
      />
      <label
        htmlFor="status-disabled"
        className="ml-2 text-gray-700 flex items-center"
      >
        <XCircle size={14} className="mr-1 text-gray-600" />
        停用
      </label>
    </div>
    <div className="flex items-center">
      <input
        type="radio"
        id="status-archived"
        name="status"
        value="ARCHIVED"
        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
        defaultChecked={selectedUser?.status === "ARCHIVED"}
      />
      <label
        htmlFor="status-archived"
        className="ml-2 text-gray-700 flex items-center"
      >
        <Archive size={14} className="mr-1 text-red-600" />
        封存 <span className="text-xs text-gray-500 ml-1">(取代刪除功能)</span>
      </label>
    </div>
  </div>
</div>
```

更新用戶狀態的函數：
```javascript
// 更新用戶狀態
const handleUpdateUserStatus = async (userId, status) => {
  try {
    setModalLoading(true);
    setModalError(null);

    if (!axiosInstance) {
      console.error("axiosInstance未定義，可能是因為身份驗證問題");
      setModalError("身份驗證失敗，請重新登入");
      setModalLoading(false);
      return;
    }

    await axiosInstance.patch(
      validateApiPath(`/api/admin/users/${userId}/status?status=${status}`)
    );

    setModalSuccess("用戶狀態更新成功！");
    
    // 重新獲取用戶列表
    await fetchUsers();
  } catch (err) {
    console.error("更新用戶狀態失敗:", err);
    setModalError(err.response?.data?.message || "更新用戶狀態失敗，請稍後再試");
  } finally {
    setModalLoading(false);
  }
};
```

## 測試情況

在實作過程中遇到了一些文件編輯的問題，包括不完整的檔案內容和語法錯誤。最終通過完整重寫 `UsersPage.jsx` 文件解決了問題。

## 結果

完成後的用戶管理系統具有以下功能：
- 顯示和編輯三種用戶狀態
- 使用封存替代刪除功能，保留數據完整性
- 直觀的界面和狀態標識
- 完整的API集成

用戶管理頁面現在可以更安全地管理用戶帳號，避免因誤刪用戶造成資料庫中出現不明空值，同時保留了所有操作記錄的完整性。