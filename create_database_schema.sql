-- 數字音樂廳 MySQL 資料庫結構腳本
-- Digital Concert Hall Database Schema

-- 創建資料庫
CREATE DATABASE IF NOT EXISTS digital_concert_hall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digital_concert_hall;

-- 1. 角色表 (roles)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE COMMENT '角色名稱：ROLE_USER, ROLE_MODERATOR, ROLE_ADMIN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統角色表';

-- 2. 用戶表 (users)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用戶名',
    email VARCHAR(50) NOT NULL UNIQUE COMMENT '電子郵件',
    password VARCHAR(120) NOT NULL COMMENT '密碼',
    first_name VARCHAR(100) COMMENT '名字',
    last_name VARCHAR(100) COMMENT '姓氏',
    reset_password_token VARCHAR(255) COMMENT '重設密碼令牌',
    reset_password_token_expiry DATETIME COMMENT '重設密碼令牌過期時間',
    enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '帳戶是否啟用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶表';

-- 3. 管理員用戶表 (admin_users)
CREATE TABLE admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '管理員用戶名',
    email VARCHAR(50) NOT NULL UNIQUE COMMENT '管理員電子郵件',
    password VARCHAR(120) NOT NULL COMMENT '密碼',
    first_name VARCHAR(100) COMMENT '名字',
    last_name VARCHAR(100) COMMENT '姓氏',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理員用戶表';

-- 4. 用戶角色關聯表 (user_roles)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶角色關聯表';

-- 5. 管理員用戶角色關聯表 (admin_user_roles)
CREATE TABLE admin_user_roles (
    admin_user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (admin_user_id, role_id),
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理員用戶角色關聯表';

-- 6. 音樂會表 (concerts)
CREATE TABLE concerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '音樂會標題',
    description TEXT COMMENT '音樂會描述',
    program_details TEXT COMMENT '節目詳情',
    poster_url VARCHAR(500) COMMENT '海報URL',
    brochure_url VARCHAR(500) COMMENT '宣傳冊URL',
    status VARCHAR(20) NOT NULL COMMENT '狀態：active, inactive, upcoming, past',
    start_date_time DATETIME NOT NULL COMMENT '開始時間',
    end_date_time DATETIME NOT NULL COMMENT '結束時間',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='音樂會表';

-- 7. 演出表 (performances)
CREATE TABLE performances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    concert_id BIGINT NOT NULL COMMENT '音樂會ID',
    start_time DATETIME NOT NULL COMMENT '演出開始時間',
    end_time DATETIME NOT NULL COMMENT '演出結束時間',
    venue VARCHAR(100) NOT NULL COMMENT '演出場地',
    status VARCHAR(20) NOT NULL COMMENT '狀態：scheduled, live, completed, cancelled',
    livestream_url VARCHAR(500) COMMENT '直播URL',
    recording_url VARCHAR(500) COMMENT '錄播URL',
    FOREIGN KEY (concert_id) REFERENCES concerts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='演出表';

-- 8. 票券類型表 (ticket_types)
CREATE TABLE ticket_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '票券類型名稱',
    price DECIMAL(10,2) NOT NULL COMMENT '票券價格',
    description VARCHAR(255) COMMENT '票券描述',
    color_code VARCHAR(20) COMMENT '顏色代碼',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='票券類型表';

-- 9. 票券表 (tickets)
CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    performance_id BIGINT NOT NULL COMMENT '演出ID',
    ticket_type_id BIGINT NOT NULL COMMENT '票券類型ID',
    total_quantity INT NOT NULL COMMENT '總數量',
    available_quantity INT NOT NULL COMMENT '可用數量',
    description VARCHAR(255) COMMENT '票券描述',
    status VARCHAR(50) COMMENT '票券狀態',
    username VARCHAR(255) COMMENT '用戶名',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    FOREIGN KEY (performance_id) REFERENCES performances(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='票券表';

-- 10. 訂單表 (orders)
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE COMMENT '訂單編號',
    user_id BIGINT NOT NULL COMMENT '用戶ID',
    order_date DATETIME NOT NULL COMMENT '訂單日期',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '總金額',
    status VARCHAR(20) NOT NULL COMMENT '訂單狀態：pending, paid, cancelled',
    payment_method VARCHAR(50) COMMENT '付款方式',
    payment_status VARCHAR(20) NOT NULL COMMENT '付款狀態：pending, completed, failed',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='訂單表';

-- 11. 訂單項目表 (order_items)
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '訂單ID',
    ticket_id BIGINT NOT NULL COMMENT '票券ID',
    quantity INT NOT NULL COMMENT '數量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '單價',
    subtotal DECIMAL(10,2) NOT NULL COMMENT '小計',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='訂單項目表';

-- 12. 用戶票券表 (user_tickets)
CREATE TABLE user_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(255) NOT NULL UNIQUE COMMENT '票券代碼，用於生成QR碼',
    user_id BIGINT NOT NULL COMMENT '用戶ID',
    order_item_id BIGINT NOT NULL COMMENT '訂單項目ID',
    is_used BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已使用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶票券表';

-- 插入初始角色數據
INSERT INTO roles (name) VALUES 
('ROLE_USER'),
('ROLE_MODERATOR'), 
('ROLE_ADMIN');

-- 創建索引以提高查詢效能
-- 用戶表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 管理員用戶表索引
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- 音樂會表索引
CREATE INDEX idx_concerts_status ON concerts(status);
CREATE INDEX idx_concerts_start_date ON concerts(start_date_time);
CREATE INDEX idx_concerts_title ON concerts(title);

-- 演出表索引
CREATE INDEX idx_performances_concert_id ON performances(concert_id);
CREATE INDEX idx_performances_start_time ON performances(start_time);
CREATE INDEX idx_performances_status ON performances(status);

-- 票券表索引
CREATE INDEX idx_tickets_performance_id ON tickets(performance_id);
CREATE INDEX idx_tickets_ticket_type_id ON tickets(ticket_type_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- 訂單表索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);

-- 訂單項目表索引
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_ticket_id ON order_items(ticket_id);

-- 用戶票券表索引
CREATE INDEX idx_user_tickets_user_id ON user_tickets(user_id);
CREATE INDEX idx_user_tickets_order_item_id ON user_tickets(order_item_id);
CREATE INDEX idx_user_tickets_ticket_code ON user_tickets(ticket_code);
CREATE INDEX idx_user_tickets_is_used ON user_tickets(is_used);

-- 票券類型表索引
CREATE INDEX idx_ticket_types_name ON ticket_types(name);

COMMIT; 