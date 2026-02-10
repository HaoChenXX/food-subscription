# 图片上传目录

此目录用于存储用户上传的图片：
- 用户头像
- 商品图片
- 食材包封面图

## 本地图片使用说明

### 1. 将图片放入此目录

```bash
# 上传到服务器
scp -r ./local-images/* root@服务器IP:/var/www/food-subscription/backend/uploads/
```

### 2. 修改数据库中的图片路径

将 `backend/data/food-packages.json` 中的外部链接改为本地路径：
```json
// 原来的外部链接
"image": "https://images.unsplash.com/photo-xxx"

// 改为本地路径
"image": "/uploads/package-1.jpg"
```

### 3. 前端访问方式

Nginx 已配置 `/uploads/` 路径映射，前端可直接通过以下 URL 访问：
```
http://服务器IP:8080/uploads/xxx.jpg
```

## 当前使用的外部图库

| 用途 | 来源 | 网址 |
|------|------|------|
| 用户头像 | DiceBear | api.dicebear.com |
| 食材包图片 | Unsplash | images.unsplash.com |

## 常见问题

**Q: 图片加载慢怎么办？**
A: 将图片下载到 `uploads/` 目录，然后修改数据库使用本地路径

**Q: 离线环境能用吗？**
A: 需要替换为本地图片，或搭建内网图库
