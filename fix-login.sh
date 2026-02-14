#!/bin/bash
# 直接在服务器上修复登录页密码

cd /var/www/food-subscription-v01.1-backup

# 备份原文件
cp frontend-src/src/pages/Login.tsx frontend-src/src/pages/Login.tsx.bak.$(date +%Y%m%d-%H%M%S)

# 创建 Python 修复脚本
cat > /tmp/fix_login.py << 'PYEOF'
import re

file_path = '/var/www/food-subscription-v01.1-backup/frontend-src/src/pages/Login.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 修复用户表单
content = re.sub(
    r"const \[userForm, setUserForm\] = useState\(\{[^}]+\}\)",
    """const [userForm, setUserForm] = useState({
    email: 'user@example.com',
    password: 'user123'
  })""",
    content, flags=re.DOTALL
)

# 修复商家表单  
content = re.sub(
    r"const \[merchantForm, setMerchantForm\] = useState\(\{[^}]+\}\)",
    """const [merchantForm, setMerchantForm] = useState({
    email: 'merchant@example.com',
    password: 'merchant123'
  })""",
    content, flags=re.DOTALL
)

# 修复管理员表单
content = re.sub(
    r"const \[adminForm, setAdminForm\] = useState\(\{[^}]+\}\)",
    """const [adminForm, setAdminForm] = useState({
    email: 'admin@example.com',
    password: 'admin123'
  })""",
    content, flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ Login.tsx 已修复')
PYEOF

python3 /tmp/fix_login.py

# 重新构建前端
echo "[1/2] 构建前端..."
cd frontend-src
npm run build 2>&1 | tail -5

# 复制到前端目录
echo "[2/2] 复制构建产物..."
cp -r dist/* ../frontend/

# 重启服务
echo "重启服务..."
pm2 restart food-subscription-backend 2>/dev/null || (pkill -f "node.*server.js" 2>/dev/null; cd ../backend && nohup node server.js > /dev/null 2>&1 &)

echo ""
echo "✓ 修复完成！登录页已更新为正确的密码："
echo "  用户: user@example.com / user123"
echo "  商家: merchant@example.com / merchant123"  
echo "  管理员: admin@example.com / admin123"
