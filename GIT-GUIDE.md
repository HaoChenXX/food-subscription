# Git 使用指南

## 🚀 快速开始

### 1. 首次推送项目到 GitHub

```bash
# 进入项目目录
cd food-subscription-v1.1

# 初始化 Git（如果还没做）
git init

# 添加所有文件
git add .

# 提交
git commit -m "🎉 Initial commit"

# 关联远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/food-subscription.git

# 推送
git push -u origin main
```

### 2. 服务器端首次拉取

```bash
ssh root@你的服务器IP
cd /var/www
git clone https://github.com/你的用户名/food-subscription.git
cd food-subscription
sudo bash deploy.sh
```

---

## 🔄 日常开发流程

### 本地开发

```bash
# 1. 开始新功能前，先拉取最新代码
git pull

# 2. 创建新分支（可选，推荐）
git checkout -b feature/新功能名

# 3. 开发完成后，查看修改
git status
git diff

# 4. 添加修改
git add .

# 5. 提交
git commit -m "✨ feat: 添加xx功能"

# 6. 推送
git push origin feature/新功能名

# 7. 合并到 main（在 GitHub 上操作或）
git checkout main
git merge feature/新功能名
git push
```

### 服务器更新

```bash
ssh root@你的服务器IP
cd /var/www/food-subscription

# 拉取最新代码
git pull

# 重新部署
sudo bash deploy.sh

# 或者使用自动部署脚本
sudo bash auto-deploy.sh
```

---

## 📝 提交信息规范

| 类型 | 说明 | 示例 |
|------|------|------|
| 🎉 `init` | 初始提交 | `🎉 init: 项目初始化` |
| ✨ `feat` | 新功能 | `✨ feat: 添加用户注册` |
| 🐛 `fix` | 修复bug | `🐛 fix: 修复登录失败问题` |
| 📚 `docs` | 文档更新 | `📚 docs: 更新README` |
| 💄 `style` | 样式调整 | `💄 style: 优化首页布局` |
| ♻️ `refactor` | 重构 | `♻️ refactor: 优化数据库查询` |
| 🚀 `deploy` | 部署相关 | `🚀 deploy: 更新部署脚本` |
| 🔧 `chore` | 其他修改 | `🔧 chore: 更新依赖` |

---

## 🔧 常见问题

### 1. 推送被拒绝（rejected）

```bash
# 先拉取远程代码
git pull origin main

# 解决冲突后再次推送
git push
```

### 2. 忘记添加文件到 .gitignore

```bash
# 从 Git 中移除，但保留本地文件
git rm --cached 文件名

# 添加到 .gitignore
echo "文件名" >> .gitignore

# 提交
git add .gitignore
git commit -m "🔧 chore: 更新.gitignore"
```

### 3. 查看提交历史

```bash
# 简洁查看
git log --oneline

# 图形化查看
git log --oneline --graph

# 查看某文件的修改历史
git log -p 文件名
```

### 4. 撤销修改

```bash
# 撤销未暂存的修改
git checkout -- 文件名

# 撤销已暂存但未提交的修改
git reset HEAD 文件名
git checkout -- 文件名

# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃修改）⚠️ 危险
git reset --hard HEAD~1
```

### 5. 分支管理

```bash
# 查看分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 创建分支
git checkout -b 新分支名

# 切换分支
git checkout 分支名

# 删除分支
git branch -d 分支名

# 强制删除分支
git branch -D 分支名
```

---

## 🌟 进阶配置

### 配置 Git 别名（可选）

```bash
# 快捷命令
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# 使用：git st = git status
```

### 配置 SSH 免密登录（推荐）

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "你的邮箱@example.com"

# 复制公钥到 GitHub
cat ~/.ssh/id_ed25519.pub
# 然后添加到 GitHub Settings -> SSH Keys

# 修改远程仓库为 SSH 地址
git remote set-url origin git@github.com:你的用户名/food-subscription.git
```

---

## 🎯 最佳实践

1. **频繁提交**：小步快跑，每次提交只做一件事
2. **写好提交信息**：方便日后查看历史
3. **先 pull 再 push**：避免冲突
4. **使用分支**：新功能在分支开发，测试后再合并
5. **不要提交敏感信息**：密码、密钥等放 .gitignore

---

## 📚 学习资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub Hello World](https://docs.github.com/cn/get-started/quickstart/hello-world)
- [Git 可视化学习](https://learngitbranching.js.org/)
