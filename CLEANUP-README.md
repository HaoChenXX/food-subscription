# 项目清理说明

此目录包含用于清理食材订阅平台项目的脚本文件。

## 可用脚本

### 1. `cleanup-project.sh` - 本地开发环境清理脚本

**特点**：
- 交互式操作，需要用户确认
- 支持干运行模式（只显示不删除）
- 分步骤清理不同类型文件
- 适合本地开发环境使用

**使用方法**：
```bash
# 显示将要删除的文件（不实际删除）
bash cleanup-project.sh --dry-run

# 交互式删除文件（询问确认）
bash cleanup-project.sh

# 直接删除文件（不询问确认）
bash cleanup-project.sh --force
```

**清理内容**：
- 备份文件（*.backup）
- 临时文件和测试文件
- 重复的脚本文件
- 重复的logo文件
- 构建产物目录（dist/）
- 依赖目录（node_modules/）

### 2. `cleanup-server.sh` - 服务器环境清理脚本

**特点**：
- 专为Linux服务器设计
- 自动删除，需要明确确认
- 包含额外的安全检查
- 适合生产服务器使用

**使用方法**：
```bash
# 在项目根目录运行
sudo bash cleanup-server.sh

# 或指定项目目录
sudo bash cleanup-server.sh /path/to/project
```

**清理内容**：
- 所有备份文件（*.backup, *.bak, *.old）
- 临时文件和测试文件
- 重复的脚本文件（智能保留一个版本）
- 重复的logo文件（保留最高和最低分辨率）
- 构建产物目录
- 可选：依赖目录（node_modules/）

## 文件清理策略

### 备份文件
- `backend/db/init-mysql.js.backup` - MySQL初始化脚本备份

### 临时文件
- `food-subscription-v1.1.zip` - 旧版本压缩包
- `my-app@0.0.0` - 空文件
- `test_ssh.txt` - SSH测试文件

### 重复脚本（保留策略）
| 删除文件 | 保留文件 | 原因 |
|----------|----------|------|
| `deploy-v1.1.sh` | `deploy.sh` | `deploy.sh`是通用版本 |
| `fix-line-endings-v1.1.py` | `fix-line-endings.py` | `fix-line-endings.py`是主版本 |
| `fix-v1.2.ps1`, `fix-v1.2.sh` | `fix-v1.2.py` | `.py`版本跨平台 |

### Logo文件（保留策略）
- 保留：`logo-512.png`（最大分辨率，383KB）
- 保留：`logo-128.png`（最小分辨率，28KB）
- 删除：`logo.png`, `logo-256.png`, `logo-optimized.png`（都是97KB重复文件）

### 旧文档文件（可选）
- `README-v1.2.md` - 旧版README
- `CHANGELOG-v1.2.md` - 特定版本变更日志

### 构建产物和依赖
- `frontend/dist/` - 前端生产构建（可重新生成）
- `frontend-src/dist/` - 前端开发构建（可重新生成）
- `backend/node_modules/` - 后端依赖（可重新安装）
- `frontend-src/node_modules/` - 前端依赖（可重新安装）

## 安全注意事项

1. **备份重要数据**：在执行清理前，确保重要数据已备份
2. **版本控制**：清理前提交所有更改到git
3. **依赖恢复**：删除node_modules后需要重新安装依赖：
   ```bash
   cd backend && npm install --production
   cd frontend-src && npm install
   ```
4. **构建恢复**：删除dist目录后需要重新构建：
   ```bash
   cd frontend-src && npm run build
   cp -r frontend-src/dist/* frontend/dist/
   ```

## 服务器部署建议

对于生产服务器，建议：

1. **首次清理**：
   ```bash
   sudo bash cleanup-server.sh
   ```

2. **重新安装依赖**：
   ```bash
   cd /var/www/food-subscription-v01.1-backup/backend
   npm install --production

   cd /var/www/food-subscription-v01.1-backup/frontend-src
   npm install
   ```

3. **重新构建前端**：
   ```bash
   cd /var/www/food-subscription-v01.1-backup/frontend-src
   npm run build

   cp -r /var/www/food-subscription-v01.1-backup/frontend-src/dist/* \
         /var/www/food-subscription-v01.1-backup/frontend/dist/
   ```

4. **重启服务**：
   ```bash
   sudo systemctl restart food-subscription
   sudo systemctl restart nginx
   ```

## 磁盘空间节省

清理前大约可节省：
- 备份文件：15KB
- 临时文件：~1.7MB
- 重复logo文件：~285KB
- 构建产物：~3MB
- 依赖目录：~9.5MB
- **总计**：约14MB

## 更新.gitignore建议

清理后，建议更新`.gitignore`文件包含：

```gitignore
# 构建产物
frontend/dist/
frontend-src/dist/

# 依赖目录
node_modules/
*/node_modules/

# 备份文件
*.backup
*.bak
*.old

# 临时文件
*.zip
*.tmp
*.log

# 系统文件
.DS_Store
Thumbs.db
```

## 故障排除

### 脚本权限问题
```bash
chmod +x cleanup-project.sh cleanup-server.sh
```

### 文件不存在错误
如果某些文件不存在，脚本会自动跳过，不会报错。

### 依赖安装失败
如果网络问题导致npm安装失败，可以使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

### 构建失败
确保Node.js版本 >= 18：
```bash
node --version
```

---

**最后更新**：2026-02-28
**脚本版本**：1.0
**适用平台**：Windows (Git Bash) / Linux / macOS