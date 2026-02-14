#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
食材包订阅平台 - 服务端一键更新脚本 (Python版)
自动处理换行符问题，支持跨平台使用
用法: python3 update-server.py
"""

import os
import sys
import shutil
import subprocess
import datetime
from pathlib import Path

# 配置
PROJECT_DIR = "/var/www/food-subscription-v01.1-backup"
BACKUP_DIR = f"/var/www/backups/food-subscription-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}"

def run_command(cmd, cwd=None, check=True):
    """执行命令并返回结果"""
    print(f"  执行: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    if check and result.returncode != 0:
        raise RuntimeError(f"命令执行失败: {cmd}")
    return result

def fix_line_endings(file_path):
    """修复文件的换行符 (CRLF -> LF)"""
    with open(file_path, 'rb') as f:
        content = f.read()
    
    # 检测并替换 CRLF
    if b'\r\n' in content:
        content = content.replace(b'\r\n', b'\n')
        with open(file_path, 'wb') as f:
            f.write(content)
        print(f"  已修复换行符: {file_path}")
        return True
    return False

def backup_current():
    """备份当前版本"""
    print("\n[1/6] 备份当前版本...")
    if os.path.exists(PROJECT_DIR):
        os.makedirs(os.path.dirname(BACKUP_DIR), exist_ok=True)
        shutil.copytree(PROJECT_DIR, BACKUP_DIR)
        print(f"  ✓ 备份完成: {BACKUP_DIR}")
    else:
        raise RuntimeError(f"项目目录不存在: {PROJECT_DIR}")

def pull_latest():
    """拉取最新代码"""
    print("\n[2/6] 拉取最新代码...")
    try:
        run_command("git pull origin main", cwd=PROJECT_DIR)
        print("  ✓ 代码更新成功")
    except RuntimeError as e:
        print(f"  ✗ 代码拉取失败: {e}")
        print("  正在恢复备份...")
        if os.path.exists(PROJECT_DIR):
            shutil.rmtree(PROJECT_DIR)
        shutil.copytree(BACKUP_DIR, PROJECT_DIR)
        raise

def fix_all_scripts():
    """修复所有脚本的换行符"""
    print("\n[3/6] 修复脚本换行符...")
    scripts = ["deploy.sh", "auto-deploy.sh", "v1_2.sh", "fix-v1.2.sh"]
    fixed_count = 0
    for script in scripts:
        script_path = os.path.join(PROJECT_DIR, script)
        if os.path.exists(script_path):
            if fix_line_endings(script_path):
                os.chmod(script_path, 0o755)
                fixed_count += 1
    print(f"  ✓ 修复了 {fixed_count} 个脚本")

def install_dependencies():
    """安装后端依赖"""
    print("\n[4/6] 安装后端依赖...")
    backend_dir = os.path.join(PROJECT_DIR, "backend")
    run_command("npm install --production", cwd=backend_dir)
    print("  ✓ 依赖安装成功")

def restart_service():
    """重启服务"""
    print("\n[5/6] 重启后端服务...")
    
    # 尝试使用 PM2
    result = subprocess.run("which pm2", shell=True, capture_output=True)
    if result.returncode == 0:
        try:
            run_command("pm2 restart food-subscription-backend || pm2 start backend/server.js --name food-subscription-backend", cwd=PROJECT_DIR)
            print("  ✓ 后端服务已重启 (PM2)")
            return
        except:
            pass
    
    # 尝试使用 systemctl
    result = subprocess.run("which systemctl", shell=True, capture_output=True)
    if result.returncode == 0:
        try:
            run_command("systemctl restart food-subscription || systemctl restart nginx", check=False)
            print("  ✓ 后端服务已重启 (systemctl)")
            return
        except:
            pass
    
    # 尝试直接启动
    print("  ! 未检测到 PM2 或 systemctl，尝试直接启动...")
    try:
        # 查找并结束旧进程
        subprocess.run("pkill -f 'node.*server.js'", shell=True, check=False)
        # 后台启动新进程
        subprocess.Popen(
            ["nohup", "node", "server.js"],
            cwd=os.path.join(PROJECT_DIR, "backend"),
            stdout=open("/dev/null", "w"),
            stderr=open("/dev/null", "w"),
            start_new_session=True
        )
        print("  ✓ 后端服务已启动 (nohup)")
    except Exception as e:
        print(f"  ! 启动失败: {e}")

def check_health():
    """检查服务状态"""
    print("\n[6/6] 检查服务状态...")
    import time
    time.sleep(2)
    
    result = subprocess.run(
        "curl -s http://localhost:3001/api/health",
        shell=True, capture_output=True, text=True
    )
    if result.returncode == 0 and "ok" in result.stdout:
        print("  ✓ 服务运行正常")
    else:
        print("  ✗ 服务可能未正常启动，请检查日志")
        print("  查看日志: pm2 logs food-subscription-backend")

def main():
    """主函数"""
    print("=" * 50)
    print("  食材包订阅平台 - 服务端更新脚本")
    print("=" * 50)
    
    try:
        backup_current()
        pull_latest()
        fix_all_scripts()
        install_dependencies()
        restart_service()
        check_health()
        
        print("\n" + "=" * 50)
        print("  更新完成！")
        print("=" * 50)
        print(f"\n备份位置: {BACKUP_DIR}")
        print(f"访问地址: http://your-server-ip")
        
    except Exception as e:
        print(f"\n✗ 更新失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
