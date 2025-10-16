# 快速参考

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 部署
npm run deploy
```

## 🔐 默认账号

- **用户名**: admin
- **密码**: admin123

## 📍 访问地址

- **首页**: `/` → 自动跳转到验证页
- **卡密验证**: `/verify`
- **资源选择**: `/resources`
- **管理后台**: `/admin`

## 🎯 核心功能

### 卡密格式
```
KAMI-XXXX-XXXX-XXXX
示例: KAMI-1A2B-3C4D-5E6F
```

### 生成卡密
1. 登录管理后台
2. 点击「+ 生成卡密」
3. 设置参数：
   - 数量：1-100
   - 资源：至少选一个
   - 使用次数：-1=无限
   - 有效期：天数

### 创建资源
1. 切换到「资源管理」
2. 点击「+ 创建资源」
3. 填写名称和URL
4. 保存

## 📊 数据库

### 连接信息
```
Host: 1.12.227.13
User: kami
Pass: zmnRHsNwzXpZkGH4
DB: kami
```

### 通过Hyperdrive连接
```javascript
const db = env.HYPERDRIVE;
await db.prepare("SELECT * FROM cdkeys").all();
```

## 🔑 API接口

### 验证卡密
```bash
POST /api/verify
{
  "cardKey": "KAMI-1234-5678-ABCD"
}
```

### 登录
```bash
POST /api/admin/auth
{
  "username": "admin",
  "password": "admin123"
}
```

### 生成卡密
```bash
POST /api/admin/cdkeys
Authorization: Bearer {token}
{
  "count": 10,
  "resource_ids": ["res-id"],
  "max_uses": 1,
  "expired_days": 30
}
```

### 创建资源
```bash
POST /api/admin/resources
Authorization: Bearer {token}
{
  "name": "VIP专区",
  "target_url": "https://example.com"
}
```

## 🛠 常用命令

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 构建
npm run build

# 类型检查
npm run check

# 代码检查
npm run lint

# 部署预览
npm run preview

# 部署生产
npm run deploy

# 生成Cloudflare类型
npm run cf-typegen
```

## 📁 重要文件

```
wrangler.jsonc      # Cloudflare配置
src/lib/db.ts       # 数据库工具
src/lib/auth.ts     # 认证工具
src/lib/cdkey.ts    # 卡密生成
src/types/          # 类型定义
```

## 🔧 环境变量

在 `wrangler.jsonc` 中配置：

```json
{
  "vars": {
    "JWT_SECRET": "修改这个！",
    "DEFAULT_ADMIN_USERNAME": "admin",
    "DEFAULT_ADMIN_PASSWORD": "admin123"
  }
}
```

## 💡 快速技巧

### 生成强随机密钥
```bash
openssl rand -base64 32
```

### 查看卡密统计
```sql
SELECT 
  status, 
  COUNT(*) as count 
FROM cdkeys 
GROUP BY status;
```

### 清理过期卡密
```sql
UPDATE cdkeys 
SET status = 'disabled' 
WHERE expired_at < UNIX_TIMESTAMP() 
  AND status = 'active';
```

### 查看最近使用
```sql
SELECT * 
FROM usage_logs 
ORDER BY used_at DESC 
LIMIT 10;
```

## ⚡ 性能优化

- ✅ 数据库索引已优化
- ✅ Edge Runtime部署
- ✅ 自动CDN加速
- ✅ SQL参数化查询

## 🐛 常见问题

**Q: 卡密验证失败？**
- 检查格式是否正确
- 确认是否过期
- 查看使用次数

**Q: 无法登录管理后台？**
- 使用默认账号 admin/admin123
- 首次登录自动创建账号

**Q: 数据库连接失败？**
- 检查Hyperdrive配置
- 验证数据库服务状态

**Q: npm安装失败？**
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

## 📞 获取帮助

- 📖 完整文档: `README.md`
- 🔧 安装指南: `INSTALL.md`
- ✅ 部署检查: `DEPLOYMENT_CHECKLIST.md`
- 📊 项目总结: `PROJECT_SUMMARY.md`

---

**快速链接**
- [数据库设计](#数据库)
- [API文档](#api接口)
- [部署指南](DEPLOYMENT_CHECKLIST.md)

