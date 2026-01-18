-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS video_showcase;
USE video_showcase;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar LONGTEXT,
    bio LONGTEXT,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description LONGTEXT,
    icon VARCHAR(255),
    color VARCHAR(20),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description LONGTEXT,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 视频表
CREATE TABLE IF NOT EXISTS videos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    video_url LONGTEXT NOT NULL,
    thumbnail_url LONGTEXT,
    duration BIGINT DEFAULT 0,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_published (published),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_title_description (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 视频标签关联表
CREATE TABLE IF NOT EXISTS video_tags (
    video_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (video_id, tag_id),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认分类
INSERT INTO categories (name, description, color, display_order) VALUES
('教育', '教育相关视频', '#3B82F6', 1),
('娱乐', '娱乐相关视频', '#EC4899', 2),
('音乐', '音乐相关视频', '#8B5CF6', 3),
('体育', '体育相关视频', '#EF4444', 4),
('技术', '技术相关视频', '#10B981', 5),
('生活', '生活相关视频', '#F59E0B', 6)
ON DUPLICATE KEY UPDATE id=id;

-- 插入默认标签
INSERT INTO tags (name, description, color) VALUES
('热门', '热门视频', '#FF6B6B'),
('推荐', '推荐视频', '#4ECDC4'),
('新发布', '新发布视频', '#95E1D3'),
('精选', '精选视频', '#FFD93D'),
('独家', '独家视频', '#FF6B9D')
ON DUPLICATE KEY UPDATE id=id;

-- 创建默认管理员用户（密码：admin123）
INSERT INTO users (username, email, password, display_name, role, active) VALUES
('admin', 'admin@videoshowcase.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy2QJOG', '管理员', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE id=id;
