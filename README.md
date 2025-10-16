# 卡密验证系统

基于 Next.js + Cloudflare Workers + MySQL 的卡密验证系统。

## 功能特性

### 前端功能
- 🔐 **卡密验证页面** - 用户输入卡密后自动验证并跳转
- 🎯 **多资源支持** - 一个卡密可以关联多个资源
- 📱 **响应式设计** - 完美适配手机、平板、桌面

### 后台管理
- 👤 **管理员登录** - JWT 认证，安全可靠
- 🎫 **卡密管理** - 批量生成、查询、删除卡密
- 📦 **资源管理** - 创建和管理跳转资源
- 📊 **使用统计** - 记录每次卡密使用日志
- 🔍 **搜索筛选** - 按状态、关键词筛选卡密

## 技术栈

- **前端框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS 4
- **数据库**: MySQL (通过 Cloudflare Hyperdrive)
- **部署**: Cloudflare Workers
- **认证**: JWT (jose)
- **密码加密**: bcryptjs

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境

数据库连接已在 `wrangler.jsonc` 中配置：

```json
{
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "3a478ab76f25443f92771794dd440605"
    }
  ],
  "vars": {
    "JWT_SECRET": "your-secret-key-please-change-in-production",
    "DEFAULT_ADMIN_USERNAME": "admin",
    "DEFAULT_ADMIN_PASSWORD": "admin123"
  }
}
```

### 3. 初始化数据库 ⚠️ **重要！必须执行！**

**在首次使用前，必须先创建数据库表结构，否则登录会报 500 错误！**

使用 MySQL 客户端执行初始化脚本：

```bash
mysql -h 1.12.227.13 -u kami -p kami < schema.sql
# 输入密码：zmnRHsNwzXpZkGH4
```

这将创建以下 5 个表：
- `admins` - 管理员表
- `resources` - 资源表
- `cdkeys` - 卡密表
- `cdkey_resources` - 卡密资源关联表
- `usage_logs` - 使用日志表

验证表是否创建成功：
```bash
mysql -h 1.12.227.13 -u kami -p -e "USE kami; SHOW TABLES;"
```

**详细的数据库初始化步骤请查看 [INSTALL.md](./INSTALL.md)**

### 4. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 部署到 Cloudflare

```bash
npm run deploy
```

## 使用指南

### 首次登录管理后台

1. 访问 `/admin` 或点击验证页面的"管理后台登录"
2. 使用默认账号登录：
   - 用户名: `admin`
   - 密码: `admin123`
3. 首次登录会自动创建管理员账户

### 创建资源

1. 进入管理后台
2. 切换到"资源管理"标签
3. 点击"+ 创建资源"
4. 填写资源名称和目标跳转地址
5. 点击"创建"

### 生成卡密

1. 进入管理后台
2. 在"卡密管理"标签点击"+ 生成卡密"
3. 设置：
   - 生成数量 (1-100)
   - 选择关联的资源（可多选）
   - 最大使用次数 (-1表示无限次)
   - 有效期（天）
   - 备注信息
4. 点击"生成"

### 用户使用卡密

1. 用户访问 `/verify` 页面
2. 输入卡密（格式：KAMI-XXXX-XXXX-XXXX）
3. 系统自动验证并跳转：
   - 单资源：直接跳转到目标地址
   - 多资源：显示资源列表供用户选择

## API 接口

### 公开接口

#### 验证卡密
```
POST /api/verify
Content-Type: application/json

{
  "cardKey": "KAMI-1234-5678-ABCD"
}
```

### 管理员接口（需要 JWT Token）

#### 登录
```
POST /api/admin/auth
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 获取卡密列表
```
GET /api/admin/cdkeys?keyword=&status=
Authorization: Bearer {token}
```

#### 生成卡密
```
POST /api/admin/cdkeys
Authorization: Bearer {token}
Content-Type: application/json

{
  "count": 10,
  "resource_ids": ["res-id-1", "res-id-2"],
  "max_uses": 1,
  "expired_days": 30,
  "note": "测试批次"
}
```

#### 删除卡密
```
DELETE /api/admin/cdkeys?id={cdkey_id}
Authorization: Bearer {token}
```

#### 获取资源列表
```
GET /api/admin/resources
Authorization: Bearer {token}
```

#### 创建资源
```
POST /api/admin/resources
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "VIP专区",
  "target_url": "https://example.com/vip"
}
```

#### 删除资源
```
DELETE /api/admin/resources?id={resource_id}
Authorization: Bearer {token}
```

## 数据库结构

### resources (资源表)
- `id` - 资源ID (varchar 32)
- `name` - 资源名称
- `target_url` - 目标地址
- `status` - 状态 (active/disabled)
- `created_at` - 创建时间

### cdkeys (卡密表)
- `id` - 卡密ID (varchar 32)
- `code` - 卡密码 (唯一)
- `status` - 状态 (active/used/disabled)
- `max_uses` - 最大使用次数
- `current_uses` - 当前使用次数
- `expired_at` - 过期时间
- `note` - 备注
- `created_at` - 创建时间

### cdkey_resources (卡密资源关联表)
- `id` - 关联ID (varchar 32)
- `cdkey_id` - 卡密ID
- `resource_id` - 资源ID
- `created_at` - 创建时间

### usage_logs (使用日志表)
- `id` - 日志ID (varchar 32)
- `cdkey_id` - 卡密ID
- `resource_id` - 资源ID
- `success` - 是否成功
- `ip_address` - IP地址
- `used_at` - 使用时间

### admins (管理员表)
- `id` - 管理员ID (varchar 32)
- `username` - 用户名 (唯一)
- `password_hash` - 密码哈希
- `created_at` - 创建时间

## 安全建议

1. **生产环境** 务必修改 `JWT_SECRET`
2. **管理员密码** 首次登录后应修改默认密码（需要自己实现修改密码功能）
3. **HTTPS** 生产环境必须使用 HTTPS
4. **限流** 考虑在验证接口添加限流保护
5. **日志审计** 定期检查 `usage_logs` 表

## 许可证

MIT

## 作者

Kami System
