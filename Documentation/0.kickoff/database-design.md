# 數位音樂廳網站資料庫設計

## 資料表與欄位說明

### 1. 用戶表 (USERS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| user_id | INT | - | 否 | 主鍵，用戶ID，自動增長 |
| username | VARCHAR | 50 | 否 | 用戶名，唯一 |
| email | VARCHAR | 100 | 否 | 電子郵箱，唯一 |
| password_hash | VARCHAR | 255 | 否 | 密碼雜湊值 |
| full_name | VARCHAR | 100 | 是 | 用戶全名 |
| phone | VARCHAR | 20 | 是 | 電話號碼 |
| address | TEXT | - | 是 | 地址 |
| created_at | TIMESTAMP | - | 否 | 創建時間 |
| updated_at | TIMESTAMP | - | 否 | 更新時間 |
| points | INT | - | 否 | 會員積分，預設為0 |
| status | VARCHAR | 20 | 否 | 用戶狀態(active, inactive, suspended) |

### 2. 角色表 (ROLES)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| role_id | INT | - | 否 | 主鍵，角色ID，自動增長 |
| role_name | VARCHAR | 50 | 否 | 角色名稱(admin, manager, user等) |
| description | TEXT | - | 是 | 角色描述 |

### 3. 用戶角色表 (USER_ROLES)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| user_role_id | INT | - | 否 | 主鍵，自動增長 |
| user_id | INT | - | 否 | 外鍵，參照USERS表 |
| role_id | INT | - | 否 | 外鍵，參照ROLES表 |

### 4. 音樂會表 (CONCERTS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| concert_id | INT | - | 否 | 主鍵，音樂會ID，自動增長 |
| title | VARCHAR | 200 | 否 | 音樂會標題 |
| description | TEXT | - | 是 | 音樂會描述 |
| program_details | TEXT | - | 是 | 演出曲目詳情 |
| poster_url | VARCHAR | 255 | 是 | 海報圖片URL |
| brochure_url | VARCHAR | 255 | 是 | 小冊子PDF URL |
| status | VARCHAR | 20 | 否 | 狀態(active, inactive, upcoming, past) |
| created_at | TIMESTAMP | - | 否 | 創建時間 |
| updated_at | TIMESTAMP | - | 否 | 更新時間 |

### 5. 演出表 (PERFORMANCES)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| performance_id | INT | - | 否 | 主鍵，演出ID，自動增長 |
| concert_id | INT | - | 否 | 外鍵，參照CONCERTS表 |
| start_time | DATETIME | - | 否 | 演出開始時間 |
| end_time | DATETIME | - | 否 | 演出結束時間 |
| venue | VARCHAR | 100 | 否 | 演出場地 |
| status | VARCHAR | 20 | 否 | 狀態(scheduled, live, completed, cancelled) |
| livestream_url | VARCHAR | 255 | 是 | 直播URL(或影片檔案路徑) |
| recording_url | VARCHAR | 255 | 是 | 錄播URL(或影片檔案路徑) |

### 6. 藝術家表 (ARTISTS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| artist_id | INT | - | 否 | 主鍵，藝術家ID，自動增長 |
| name | VARCHAR | 100 | 否 | 藝術家名稱 |
| biography | TEXT | - | 是 | 藝術家簡介 |
| image_url | VARCHAR | 255 | 是 | 藝術家照片URL |
| status | VARCHAR | 20 | 否 | 狀態(active, inactive) |

### 7. 音樂會藝術家關聯表 (CONCERT_ARTISTS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| concert_artist_id | INT | - | 否 | 主鍵，自動增長 |
| concert_id | INT | - | 否 | 外鍵，參照CONCERTS表 |
| artist_id | INT | - | 否 | 外鍵，參照ARTISTS表 |
| role | VARCHAR | 50 | 是 | 在音樂會中的角色(指揮、鋼琴家等) |

### 8. 票種表 (TICKET_TYPES)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| ticket_type_id | INT | - | 否 | 主鍵，票種ID，自動增長 |
| name | VARCHAR | 50 | 否 | 票種名稱(VIP, Standard, Student等) |
| description | TEXT | - | 是 | 票種描述 |
| price | DECIMAL | (10,2) | 否 | 價格 |

### 9. 票券表 (TICKETS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| ticket_id | INT | - | 否 | 主鍵，票券ID，自動增長 |
| performance_id | INT | - | 否 | 外鍵，參照PERFORMANCES表 |
| ticket_type_id | INT | - | 否 | 外鍵，參照TICKET_TYPES表 |
| total_quantity | INT | - | 否 | 總票數 |
| available_quantity | INT | - | 否 | 剩餘票數 |
| created_at | TIMESTAMP | - | 否 | 創建時間 |
| updated_at | TIMESTAMP | - | 否 | 更新時間 |

### 10. 訂單表 (ORDERS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| order_id | INT | - | 否 | 主鍵，訂單ID，自動增長 |
| user_id | INT | - | 否 | 外鍵，參照USERS表 |
| order_date | DATETIME | - | 否 | 下單時間 |
| total_amount | DECIMAL | (10,2) | 否 | 總金額 |
| status | VARCHAR | 20 | 否 | 訂單狀態(pending, paid, cancelled) |
| payment_method | VARCHAR | 50 | 是 | 付款方式 |
| payment_status | VARCHAR | 20 | 否 | 付款狀態(pending, completed, failed) |

### 11. 訂單項目表 (ORDER_ITEMS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| order_item_id | INT | - | 否 | 主鍵，訂單項目ID，自動增長 |
| order_id | INT | - | 否 | 外鍵，參照ORDERS表 |
| ticket_id | INT | - | 否 | 外鍵，參照TICKETS表 |
| quantity | INT | - | 否 | 數量 |
| unit_price | DECIMAL | (10,2) | 否 | 單價 |
| subtotal | DECIMAL | (10,2) | 否 | 小計 |

### 12. 折扣表 (DISCOUNTS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| discount_id | INT | - | 否 | 主鍵，折扣ID，自動增長 |
| code | VARCHAR | 50 | 否 | 折扣碼，唯一 |
| type | VARCHAR | 20 | 否 | 折扣類型(percentage, fixed) |
| value | DECIMAL | (10,2) | 否 | 折扣值 |
| start_date | DATETIME | - | 否 | 開始日期 |
| end_date | DATETIME | - | 否 | 結束日期 |
| status | VARCHAR | 20 | 否 | 狀態(active, inactive) |

### 13. 訂單折扣關聯表 (ORDER_DISCOUNTS)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| order_discount_id | INT | - | 否 | 主鍵，自動增長 |
| order_id | INT | - | 否 | 外鍵，參照ORDERS表 |
| discount_id | INT | - | 否 | 外鍵，參照DISCOUNTS表 |
| amount | DECIMAL | (10,2) | 否 | 折扣金額 |

### 14. 用戶觀看記錄表 (USER_VIEWING_HISTORY)
| 欄位名稱 | 資料型別 | 長度 | 可為NULL | 說明 |
|---------|---------|------|---------|------|
| history_id | INT | - | 否 | 主鍵，記錄ID，自動增長 |
| user_id | INT | - | 否 | 外鍵，參照USERS表 |
| performance_id | INT | - | 否 | 外鍵，參照PERFORMANCES表 |
| view_date | DATETIME | - | 否 | 觀看日期時間 |
| viewing_duration | INT | - | 是 | 觀看時長(秒) |

## 資料庫關聯說明

1. 一個用戶(USERS)可以有多個訂單(ORDERS)
2. 一個用戶(USERS)可以有多個角色(ROLES)，通過USER_ROLES關聯表
3. 一個音樂會(CONCERTS)可以有多個演出場次(PERFORMANCES)
4. 一個音樂會(CONCERTS)可以由多個藝術家(ARTISTS)參與，通過CONCERT_ARTISTS關聯表
5. 一個演出場次(PERFORMANCES)可以提供多種票券(TICKETS)
6. 一個訂單(ORDERS)可以包含多個訂單項目(ORDER_ITEMS)
7. 一個訂單(ORDERS)可以應用多個折扣(DISCOUNTS)，通過ORDER_DISCOUNTS關聯表
8. 一個用戶(USERS)可以有多個觀看記錄(USER_VIEWING_HISTORY)
