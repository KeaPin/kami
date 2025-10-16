# 安装说明

## 安装步骤

### 1. 修复npm权限（如果遇到权限错误）

```bash
sudo chown -R $(whoami) "/Users/tink/.npm"
```

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库 ⚠️ **重要**

在首次使用前，**必须**先初始化数据库表结构：

#### 方式一：使用 MySQL 客户端

```bash
mysql -h 1.12.227.13 -u kami -p kami < schema.sql
# 输入密码：zmnRHsNwzXpZkGH4
```

#### 方式二：登录 MySQL 后执行

```bash
mysql -h 1.12.227.13 -u kami -p
# 输入密码：zmnRHsNwzXpZkGH4
```

然后在 MySQL 命令行中：
```sql
USE kami;
SOURCE schema.sql;
```

验证表是否创建成功：
```sql
SHOW TABLES;
```

应该看到以下 5 个表：
- admins
- cdkeys
- cdkey_resources
- resources
- usage_logs

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可看到卡密验证页面。

### 5. 访问管理后台

访问 http://localhost:3000/admin

默认账号：
- 用户名：admin
- 密码：admin123

**首次登录**时会自动创建管理员账户。

### 6. 部署到 Cloudflare

```bash
npm run deploy
```

## 常见问题

### Q: npm install 报权限错误
A: 运行 `sudo chown -R $(whoami) "/Users/tink/.npm"` 修复权限

### Q: 登录时报 500 错误或 "internal error"
A: **这是最常见的问题！** 说明数据库表还没有创建。请按照步骤 3 执行 `schema.sql` 初始化数据库。

### Q: 数据库连接失败
A: 检查 wrangler.jsonc 中的 Hyperdrive ID 是否正确，确保数据库地址、用户名、密码都正确。

### Q: 管理员登录失败
A: 
1. 首先确认数据库表是否已创建（运行 `schema.sql`）
2. 使用默认账号：用户名 `admin`，密码 `admin123`
3. 首次登录会自动在数据库中创建管理员记录

### Q: 卡密验证失败
A: 
1. 检查卡密格式是否正确（KAMI-XXXX-XXXX-XXXX）
2. 检查卡密是否已过期或使用次数已达上限
3. 检查卡密是否关联了资源
4. 确认数据库表结构完整

### Q: 如何重置数据库？
A: 
```sql
-- 连接到数据库后执行
DROP TABLE IF EXISTS usage_logs;
DROP TABLE IF EXISTS cdkey_resources;
DROP TABLE IF EXISTS cdkeys;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS admins;

-- 然后重新执行 schema.sql
SOURCE schema.sql;
```

## 开发注意事项

1. 本地开发时，Hyperdrive连接需要通过 Cloudflare 的本地代理
2. 生产环境务必修改 JWT_SECRET
3. 建议使用 TypeScript 进行开发，已配置完整的类型定义

