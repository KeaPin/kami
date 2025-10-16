-- 卡密管理系统数据库初始化脚本
-- 执行此脚本以创建所有必需的表

-- 1. 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(32) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 资源表
CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  target_url VARCHAR(500) NOT NULL,
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  created_at BIGINT NOT NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 卡密表
CREATE TABLE IF NOT EXISTS cdkeys (
  id VARCHAR(32) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('active', 'used', 'disabled') NOT NULL DEFAULT 'active',
  max_uses INT NOT NULL DEFAULT 1,
  current_uses INT NOT NULL DEFAULT 0,
  expired_at BIGINT NULL,
  note VARCHAR(500) NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_code (code),
  INDEX idx_status (status),
  INDEX idx_expired_at (expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 卡密-资源关联表
CREATE TABLE IF NOT EXISTS cdkey_resources (
  id VARCHAR(32) PRIMARY KEY,
  cdkey_id VARCHAR(32) NOT NULL,
  resource_id VARCHAR(32) NOT NULL,
  created_at BIGINT NOT NULL,
  FOREIGN KEY (cdkey_id) REFERENCES cdkeys(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  INDEX idx_cdkey_id (cdkey_id),
  INDEX idx_resource_id (resource_id),
  UNIQUE KEY unique_cdkey_resource (cdkey_id, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 使用日志表
CREATE TABLE IF NOT EXISTS usage_logs (
  id VARCHAR(32) PRIMARY KEY,
  cdkey_id VARCHAR(32) NOT NULL,
  resource_id VARCHAR(32) NULL,
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(45) NULL,
  used_at BIGINT NOT NULL,
  FOREIGN KEY (cdkey_id) REFERENCES cdkeys(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL,
  INDEX idx_cdkey_id (cdkey_id),
  INDEX idx_used_at (used_at),
  INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入一些示例数据（可选）
-- 注意：管理员账户会在首次登录时自动创建，不需要在这里插入

