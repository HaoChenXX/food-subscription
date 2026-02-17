#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SSH 更新服务器脚本"""

import sys
import time

def main():
    hostname = "39.104.25.212"
    username = "root"
    password = "y6Z+Y8.=zpegxfCZPYX0"
    
    commands = [
        "cd /var/www/food-subscription-v01.1-backup",
        "git pull origin main",
        "pm2 restart food-subscription || (pkill -f 'node server.js' && cd backend && nohup node server.js > app.log 2>&1 &)",
        "echo '更新完成'"
    ]
    
    try:
        import paramiko
        
        print(f"正在连接 {hostname}...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname, username=username, password=password, timeout=30)
        
        for cmd in commands:
            print(f"\n执行: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
            # 如果需要输入密码（sudo等情况）
            if 'sudo' in cmd:
                stdin.write(password + '\n')
                stdin.flush()
            
            output = stdout.read().decode()
            error = stderr.read().decode()
            
            if output:
                print(f"输出:\n{output}")
            if error:
                print(f"错误:\n{error}")
        
        client.close()
        print("\n✅ 服务器更新完成！")
        
    except ImportError:
        print("❌ 需要安装 paramiko: pip install paramiko")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
