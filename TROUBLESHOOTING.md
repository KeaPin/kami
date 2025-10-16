# 故障排查指南

## 🚨 常见错误：`{"success":false,"error":{"code":"SERVER_ERROR","message":"服务器错误，请稍后重试"}}`

### 症状
- ✅ 本地运行正常 (`npm run dev`)
- ✅ 本地预览正常 (`npm run preview`)
- ❌ 部署后报错：服务器错误

### 根本原因
部署到 Cloudflare Workers 后，环境变量和 Hyperdrive 绑定没有正确应用，导致数据库连接失败。

---

## 🔧 解决方案

### 方案 1：重新部署（推荐）

我已经修改了 `package.json` 中的部署命令，现在可以正确部署：

```bash
# 1. 确保 wrangler 已登录
npx wrangler login

# 2. 重新部署（会自动使用 wrangler.jsonc 配置）
npm run deploy
```

### 方案 2：手动在 Cloudflare Dashboard 配置

如果方案 1 不起作用，需要在 Cloudflare Dashboard 中手动配置：

#### 步骤 1：登录 Cloudflare Dashboard
访问：https://dash.cloudflare.com/

#### 步骤 2：找到你的 Worker
Workers & Pages → 找到 `kami` worker → 点击进入

#### 步骤 3：配置环境变量
点击 **Settings** → **Variables**

添加以下环境变量：

| 变量名 | 值 | 类型 |
|--------|-----|------|
| `JWT_SECRET` | `your-secret-key-please-change-in-production` | Text |
| `DEFAULT_ADMIN_USERNAME` | `admin` | Text |
| `DEFAULT_ADMIN_PASSWORD` | `admin123` | Text |

⚠️ **生产环境请修改这些默认值！**

#### 步骤 4：配置 Hyperdrive 绑定
点击 **Settings** → **Bindings** → **Add Binding**

- **Binding Type**: Hyperdrive
- **Variable Name**: `HYPERDRIVE`
- **Hyperdrive Configuration**: 选择你的 Hyperdrive 配置
  - Hyperdrive ID: `3a478ab76f25443f92771794dd440605`

如果 Hyperdrive 配置不存在，需要先创建：

1. 前往 **Data** → **Hyperdrive**
2. 点击 **Create Hyperdrive**
3. 配置：
   - **Name**: `kami-hyperdrive`
   - **Protocol**: MySQL
   - **Host**: `1.12.227.13`
   - **Port**: `3306`
   - **Database**: `kami`
   - **Username**: `kami`
   - **Password**: `zmnRHsNwzXpZkGH4`
4. 创建后，复制 Hyperdrive ID 到 `wrangler.jsonc`

#### 步骤 5：保存并重新部署
配置完成后，点击 **Save** → 等待 Worker 重新部署（自动）

---

## 🔍 验证部署是否成功

### 方法 1：测试 API 端点

```bash
# 测试管理员登录 API
curl -X POST https://你的域名.workers.dev/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 预期响应（成功）：
# {"success":true,"data":{"token":"...", ...}}

# 预期响应（失败）：
# {"success":false,"error":{"code":"SERVER_ERROR","message":"服务器错误，请稍后重试"}}
```

### 方法 2：查看 Cloudflare 日志

1. 进入你的 Worker 页面
2. 点击 **Logs** → **Real-time Logs**
3. 打开实时日志
4. 访问你的应用，触发错误
5. 查看日志中的错误详情

你应该能看到类似的日志：
```
=== 开始创建数据库连接 ===
环境信息: { hasHyperdrive: true, ... }
使用 Hyperdrive 连接配置
✓ Hyperdrive 数据库连接已建立
```

如果看到：
```
✗ 数据库连接失败
错误消息: Cannot connect to database
```

说明 Hyperdrive 配置有问题。

---

## 🛠️ 其他可能的问题

### 问题 1：数据库表未创建

**症状**：API 返回 500 错误，日志显示 `Table 'kami.admins' doesn't exist`

**解决方案**：
```bash
# 连接到数据库并执行 schema.sql
mysql -h 1.12.227.13 -u kami -p kami < schema.sql
# 密码：zmnRHsNwzXpZkGH4
```

### 问题 2：Hyperdrive ID 不正确

**症状**：日志显示 Hyperdrive 连接失败

**解决方案**：
1. 检查 Cloudflare Dashboard 中的 Hyperdrive 配置
2. 复制正确的 Hyperdrive ID
3. 更新 `wrangler.jsonc` 中的 `id` 字段
4. 重新部署

### 问题 3：数据库防火墙阻止连接

**症状**：连接超时或无法连接

**解决方案**：
确保数据库服务器允许来自 Cloudflare 的连接：
- 检查数据库防火墙规则
- 添加 Cloudflare IP 地址段到白名单
- 或使用 Hyperdrive（推荐，自动处理）

### 问题 4：JWT_SECRET 未设置

**症状**：Token 验证失败或生成失败

**解决方案**：
确保在 Cloudflare Dashboard 或 `wrangler.jsonc` 中设置了 `JWT_SECRET`

---

## 📝 部署前检查清单

在部署前，请确认：

- [ ] 数据库表已创建（运行 `schema.sql`）
- [ ] `wrangler.jsonc` 中的 Hyperdrive ID 正确
- [ ] 已登录 Cloudflare (`npx wrangler login`)
- [ ] 本地预览测试通过 (`npm run preview`)
- [ ] 环境变量已配置（生产环境请修改默认值）

---

## 🚀 完整部署流程

```bash
# 1. 确保数据库已初始化
mysql -h 1.12.227.13 -u kami -p kami < schema.sql

# 2. 本地测试
npm run preview
# 访问 http://localhost:8788 测试功能

# 3. 登录 Cloudflare
npx wrangler login

# 4. 部署
npm run deploy

# 5. 验证部署
curl -X POST https://你的域名.workers.dev/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📞 仍然有问题？

如果按照以上步骤仍然无法解决，请：

1. **查看详细日志**
   ```bash
   npx wrangler tail
   ```
   然后访问你的应用，实时查看日志输出

2. **检查 Wrangler 版本**
   ```bash
   npx wrangler --version
   ```
   确保使用 v4.21 或更高版本

3. **完整的错误信息**
   在 Cloudflare Dashboard 的 Real-time Logs 中查看完整错误堆栈

4. **测试数据库连接**
   ```bash
   mysql -h 1.12.227.13 -u kami -p kami -e "SHOW TABLES;"
   ```
   确保能够从本地连接到数据库

---

**最后更新**: 2025-10-16

