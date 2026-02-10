# 前端构建说明

如果 frontend/dist 目录为空，或者你需要修改前端代码，需要重新构建。

## 方法一：在本地构建后上传（推荐）

1. **在本地项目目录安装依赖**
```bash
cd food-subscription-v1.1/frontend-src
npm install
```

2. **构建前端**
```bash
npm run build
```

3. **复制构建结果**
构建完成后，将 `dist` 目录内容复制到 `frontend/dist`：
```bash
# Windows
copy dist\* ..\frontend\dist\

# Linux/Mac
cp -r dist/* ../frontend/dist/
```

4. **上传到服务器**
```bash
scp -r food-subscription-v1.1 root@服务器IP:/var/www/
```

## 方法二：在服务器上构建（需要较多内存）

```bash
ssh root@服务器IP
cd /var/www/food-subscription-v1.1

# 安装依赖
cd frontend-src
npm install

# 构建
npm run build

# 复制到部署目录
cp -r dist/* ../frontend/dist/

# 重启 Nginx
systemctl restart nginx
```

## 方法三：使用现有 dist（最简单）

如果你不需要修改前端代码，直接使用项目中提供的 `frontend/dist` 目录即可。

## 注意事项

- 确保 Node.js 版本 >= 18
- 首次构建可能需要 2-5 分钟
- 如果内存不足，可以增加 swap 分区
