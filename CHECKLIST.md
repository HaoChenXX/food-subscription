# 部署前检查清单

## 文件完整性检查

上传到服务器前，请确认以下文件存在：

### 必需文件
- [ ] `backend/server.js` - 后端主程序
- [ ] `backend/package.json` - 后端依赖
- [ ] `backend/scripts/init-db.js` - 数据库初始化
- [ ] `frontend/dist/index.html` - 前端入口
- [ ] `frontend/dist/assets/` - 前端资源文件
- [ ] `deploy.sh` - 部署脚本

### 可选文件（推荐）
- [ ] `fix-line-endings.py` - 换行符修复脚本
- [ ] `nginx/food-subscription.conf` - Nginx 配置
- [ ] `README.md` - 详细说明
- [ ] `QUICKSTART.md` - 快速开始

## 部署命令清单

在服务器上按顺序执行：

```bash
# 1. 进入项目目录
cd /var/www/food-subscription-v1.1

# 2. 修复换行符（如果从 Windows 上传）
python3 fix-line-endings.py
# 或者
sed -i 's/\r$//' deploy.sh

# 3. 运行部署脚本
sudo bash deploy.sh

# 4. 检查服务状态
sudo systemctl status food-subscription

# 5. 测试 API
curl http://localhost:3001/api/health
```

## 成功标志

部署成功时，你应该看到：

1. ✅ 部署脚本输出 "部署成功！"
2. ✅ `sudo systemctl status food-subscription` 显示 "active (running)"
3. ✅ `curl http://localhost:3001/api/health` 返回 `{"status":"ok"}`
4. ✅ 浏览器访问 `http://服务器IP:8080` 能看到登录页面

## 故障排查

如果出现问题：

| 现象 | 检查命令 | 解决方案 |
|------|---------|---------|
| deploy.sh 报错 `/r: command not found` | - | 运行 `sed -i 's/\r$//' deploy.sh` |
| 后端服务未启动 | `sudo journalctl -u food-subscription -n 50` | 根据日志修复错误后重启 |
| 前端空白 | `ls /var/www/food-subscription/frontend/dist` | 确认 dist 目录有文件 |
| 无法访问 8080 端口 | `sudo netstat -tlnp \| grep 8080` | 检查防火墙/Nginx配置 |
| 登录失败 | `curl http://localhost:3001/api/health` | 确认后端正常运行 |

## 联系支持

如果以上步骤无法解决问题，请提供：
1. `sudo journalctl -u food-subscription -n 50` 的输出
2. `sudo nginx -t` 的结果
3. `curl -v http://localhost:3001/api/health` 的结果
