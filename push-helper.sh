#!/bin/bash
# 推送到 GitHub Pages 脚本

# 方式1：使用 GitHub CLI（推荐）
echo "方式1：使用 GitHub CLI 推送"
echo "请先登录: gh auth login"
echo "然后执行: gh repo sync"

# 方式2：使用 HTTPS + Personal Access Token
echo ""
echo "方式2：使用 Personal Access Token"
echo "1. 访问 https://github.com/settings/tokens 创建 Token"
echo "2. 执行以下命令:"
echo "   git remote set-url origin https://TOKEN@github.com/flizzywine/flizzywine.github.io.git"
echo "   git push origin main"

# 方式3：使用 SSH
echo ""
echo "方式3：使用 SSH（如果已配置）"
echo "   git remote set-url origin git@github.com:flizzywine/flizzywine.github.io.git"
echo "   git push origin main"
