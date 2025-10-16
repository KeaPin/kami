#!/bin/bash

# 卡密系统安装脚本

echo "🚀 开始安装卡密系统..."
echo ""

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 Node.js"
    exit 1
fi

echo "✓ 检测到 npm"
echo ""

# 修复npm权限（如果需要）
echo "🔧 检查npm权限..."
if [ -d "$HOME/.npm" ]; then
    sudo chown -R $(whoami) "$HOME/.npm" 2>/dev/null || echo "⚠️  警告: 无法修复npm权限，可能需要手动运行: sudo chown -R \$(whoami) $HOME/.npm"
fi
echo ""

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 安装完成！"
    echo ""
    echo "📝 接下来的步骤："
    echo ""
    echo "1. 启动开发服务器:"
    echo "   npm run dev"
    echo ""
    echo "2. 访问应用:"
    echo "   - 卡密验证: http://localhost:3000/verify"
    echo "   - 管理后台: http://localhost:3000/admin"
    echo ""
    echo "3. 默认管理员账号:"
    echo "   用户名: admin"
    echo "   密码: admin123"
    echo ""
    echo "4. 部署到Cloudflare:"
    echo "   npm run deploy"
    echo ""
    echo "📖 查看完整文档: README.md"
    echo ""
else
    echo ""
    echo "❌ 安装失败！"
    echo ""
    echo "请尝试手动安装:"
    echo "1. 修复npm权限: sudo chown -R \$(whoami) $HOME/.npm"
    echo "2. 安装依赖: npm install"
    echo ""
fi

