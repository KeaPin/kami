# 部署检查清单

## 📋 部署前检查

### 1. 环境配置 ✓

- [x] Hyperdrive ID 已配置在 `wrangler.jsonc`
- [x] JWT_SECRET 已设置（⚠️ 生产环境需修改）
- [x] 默认管理员账号已配置

### 2. 数据库准备 ✓

- [x] MySQL数据库已创建
- [x] 所有表已创建：
  - admins
  - resources
  - cdkeys
  - cdkey_resources
  - usage_logs
- [x] 外键约束已设置
- [x] 索引已创建

### 3. 代码检查 ✓

- [x] TypeScript 类型定义完整
- [x] API 路由已实现
- [x] 前端页面已创建
- [x] 工具函数已完成
- [x] 无 Linter 错误

### 4. 功能测试

待测试项目：

- [ ] 卡密验证功能
  - [ ] 正确卡密可以验证
  - [ ] 错误卡密被拒绝
  - [ ] 过期卡密被拒绝
  - [ ] 使用次数限制生效
  
- [ ] 管理后台
  - [ ] 管理员登录
  - [ ] 创建资源
  - [ ] 生成卡密
  - [ ] 删除卡密
  - [ ] 删除资源
  - [ ] 搜索筛选

- [ ] 跳转功能
  - [ ] 单资源直接跳转
  - [ ] 多资源显示选择页面

### 5. 安全检查

生产环境必须完成：

- [ ] 修改 JWT_SECRET 为强随机字符串
- [ ] 修改默认管理员密码
- [ ] 启用 HTTPS
- [ ] 配置 CORS（如需要）
- [ ] 设置 API 限流（推荐）

## 🚀 本地开发步骤

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
# - 验证页面: http://localhost:3000/verify
# - 管理后台: http://localhost:3000/admin

# 4. 测试功能
# - 登录管理后台（admin/admin123）
# - 创建测试资源
# - 生成测试卡密
# - 在验证页面测试
```

## 📦 部署到 Cloudflare

```bash
# 1. 确保已登录 Cloudflare
npx wrangler login

# 2. 构建并部署（现在使用 wrangler.jsonc 配置）
npm run deploy

# 3. 访问生产环境
# Cloudflare 会提供一个 *.workers.dev 域名

# 4. 绑定自定义域名（可选）
# 在 Cloudflare Dashboard 中配置
```

⚠️ **注意**: 如果部署后遇到 "服务器错误" 问题，请查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 🔍 部署后验证

1. **基础功能**
   - [ ] 首页正常访问
   - [ ] 验证页面正常显示
   - [ ] 管理后台可以登录
   
2. **数据库连接**
   - [ ] 可以正常读取数据
   - [ ] 可以正常写入数据
   - [ ] 事务正常工作

3. **API测试**
   ```bash
   # 测试卡密验证API
   curl -X POST https://your-domain.workers.dev/api/verify \
     -H "Content-Type: application/json" \
     -d '{"cardKey":"KAMI-1234-5678-ABCD"}'
   
   # 测试管理员登录
   curl -X POST https://your-domain.workers.dev/api/admin/auth \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

4. **性能检查**
   - [ ] API 响应时间 < 500ms
   - [ ] 页面加载时间 < 2s
   - [ ] 数据库查询优化

## ⚠️ 生产环境注意事项

### 安全性

1. **JWT_SECRET** - 必须使用强随机字符串
   ```bash
   # 生成随机密钥
   openssl rand -base64 32
   ```

2. **管理员密码** - 首次登录后立即修改
   ```
   当前需要手动在数据库中修改，建议后续实现修改密码功能
   ```

3. **数据库密码** - 确保数据库密码足够强
   ```
   当前密码: zmnRHsNwzXpZkGH4 (已在Hyperdrive中配置)
   ```

### 性能优化

1. **数据库连接池** - Hyperdrive 已自动处理
2. **缓存策略** - 可考虑添加Redis缓存热点数据
3. **CDN加速** - 静态资源已通过Cloudflare加速

### 监控日志

1. **Cloudflare Analytics** - 自动启用
2. **数据库日志** - 定期检查 usage_logs 表
3. **错误追踪** - 查看 Cloudflare Dashboard 日志

## 📊 系统监控

建议监控指标：

- 卡密验证成功率
- API响应时间
- 数据库连接状态
- 错误日志数量
- 使用峰值时间

## 🔄 维护任务

### 每日
- [ ] 检查错误日志
- [ ] 监控异常访问

### 每周
- [ ] 清理过期卡密
- [ ] 备份数据库
- [ ] 检查使用统计

### 每月
- [ ] 更新依赖包
- [ ] 安全审计
- [ ] 性能优化评估

## 📞 问题排查

### 数据库连接失败
1. 检查 Hyperdrive 配置
2. 确认数据库服务正常运行
3. 验证网络连接

### API 返回 500 错误
1. 查看 Cloudflare 日志
2. 检查数据库查询
3. 验证环境变量

### 前端无法访问
1. 检查路由配置
2. 确认构建成功
3. 清除浏览器缓存

## ✅ 部署完成

当所有检查项都完成后，系统即可投入生产使用！

---

**最后更新**: 2025-10-16
**系统版本**: 1.0.0

