#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
食材包订阅平台 - 服务端一键更新脚本 (Python版)
自动处理换行符问题，支持跨平台使用
支持非git仓库部署环境
用法: python3 update-server.py
"""

import os
import sys
import shutil
import subprocess
import datetime
from pathlib import Path
import tempfile

# 配置
PROJECT_DIR = "/var/www/food-subscription-v01.1-backup"
GIT_REPO = "https://github.com/HaoChenXX/food-subscription.git"
BACKUP_DIR = f"/var/www/backups/food-subscription-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}"

# 需要保留的目录和文件（不会被覆盖）
PRESERVE_ITEMS = ['uploads', '.env', 'data', 'node_modules']

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
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # 检测并替换 CRLF
        if b'\r\n' in content:
            content = content.replace(b'\r\n', b'\n')
            with open(file_path, 'wb') as f:
                f.write(content)
            print(f"  已修复换行符: {file_path}")
            return True
    except Exception as e:
        print(f"  警告: 无法修复 {file_path}: {e}")
    return False

def is_git_repo(path):
    """检查目录是否为 git 仓库"""
    git_dir = os.path.join(path, '.git')
    return os.path.isdir(git_dir)

def backup_current():
    """备份当前版本"""
    print("\n[1/6] 备份当前版本...")
    if os.path.exists(PROJECT_DIR):
        os.makedirs(os.path.dirname(BACKUP_DIR), exist_ok=True)
        shutil.copytree(PROJECT_DIR, BACKUP_DIR)
        print(f"  ✓ 备份完成: {BACKUP_DIR}")
    else:
        raise RuntimeError(f"项目目录不存在: {PROJECT_DIR}")

def pull_or_clone():
    """拉取或克隆最新代码"""
    print("\n[2/6] 拉取最新代码...")
    
    if is_git_repo(PROJECT_DIR):
        # 是 git 仓库，直接使用 git pull
        try:
            run_command("git pull origin main", cwd=PROJECT_DIR)
            print("  ✓ 代码更新成功 (git pull)")
            return
        except RuntimeError as e:
            print(f"  ✗ git pull 失败: {e}")
            raise
    else:
        # 不是 git 仓库，使用 git clone + 合并
        print("  ! 当前目录不是 git 仓库，使用克隆方式更新...")
        
        # 创建临时目录
        temp_dir = tempfile.mkdtemp(prefix="food-subscription-new-")
        
        try:
            # 克隆最新代码到临时目录
            print(f"  正在克隆仓库到临时目录...")
            run_command(f"git clone --depth 1 {GIT_REPO} {temp_dir}")
            
            # 保留原目录中的特定文件/目录
            preserve_paths = {}
            for item in PRESERVE_ITEMS:
                src_path = os.path.join(PROJECT_DIR, item)
                if os.path.exists(src_path):
                    preserve_paths[item] = src_path
                    print(f"  将保留: {item}")
            
            # 删除旧代码（保留保留项）
            print("  清理旧代码...")
            for item in os.listdir(PROJECT_DIR):
                if item in PRESERVE_ITEMS or item.startswith('.'):
                    continue
                item_path = os.path.join(PROJECT_DIR, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
            
            # 复制新代码
            print("  复制新代码...")
            for item in os.listdir(temp_dir):
                if item in PRESERVE_ITEMS or item.startswith('.'):
                    continue
                src = os.path.join(temp_dir, item)
                dst = os.path.join(PROJECT_DIR, item)
                if os.path.isdir(src):
                    shutil.copytree(src, dst)
                else:
                    shutil.copy2(src, dst)
            
            print("  ✓ 代码更新成功 (git clone + merge)")
            
        finally:
            # 清理临时目录
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

def fix_all_scripts():
    """修复所有脚本的换行符"""
    print("\n[3/6] 修复脚本换行符...")
    scripts = ["deploy.sh", "auto-deploy.sh", "v1_2.sh", "fix-v1.2.sh", "update-server.sh"]
    fixed_count = 0
    for script in scripts:
        script_path = os.path.join(PROJECT_DIR, script)
        if os.path.exists(script_path):
            if fix_line_endings(script_path):
                os.chmod(script_path, 0o755)
                fixed_count += 1
    
    # 同时修复 Python 脚本
    py_scripts = ["update-server.py", "fix-crlf.py"]
    for script in py_scripts:
        script_path = os.path.join(PROJECT_DIR, script)
        if os.path.exists(script_path):
            if fix_line_endings(script_path):
                fixed_count += 1
    
    print(f"  ✓ 修复了 {fixed_count} 个脚本")

def install_dependencies():
    """安装后端依赖"""
    print("\n[4/6] 安装后端依赖...")
    backend_dir = os.path.join(PROJECT_DIR, "backend")
    
    # 检查是否存在 node_modules，如果不存在或需要更新则安装
    if not os.path.exists(os.path.join(backend_dir, "node_modules")):
        run_command("npm install --production", cwd=backend_dir)
    else:
        # 尝试更新依赖
        run_command("npm install --production", cwd=backend_dir, check=False)
    
    print("  ✓ 依赖安装成功")

def restart_service():
    """重启服务"""
    print("\n[5/6] 重启后端服务...")
    
    # 尝试使用 PM2
    result = subprocess.run("which pm2", shell=True, capture_output=True)
    if result.returncode == 0:
        try:
            run_command("pm2 restart food-subscription-backend || pm2 start backend/server.js --name food-subscription-backend", cwd=PROJECT_DIR, check=False)
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
        print("  或: tail -f /var/log/food-subscription.log")

def main():
    """主函数"""
    print("=" * 50)
    print("  食材包订阅平台 - 服务端更新脚本")
    print("=" * 50)
    
    # 检查项目目录
    if not os.path.exists(PROJECT_DIR):
        print(f"\n✗ 项目目录不存在: {PROJECT_DIR}")
        print("  请先创建目录并克隆项目:")
        print(f"  sudo mkdir -p {os.path.dirname(PROJECT_DIR)}")
        print(f"  cd {os.path.dirname(PROJECT_DIR)}")
        print(f"  sudo git clone {GIT_REPO} {os.path.basename(PROJECT_DIR)}")
        sys.exit(1)
    
    try:
        backup_current()
        pull_or_clone()
        fix_all_scripts()
        install_dependencies()
        restart_service()
        check_health()
        
        print("\n" + "=" * 50)
        print("  更新完成！")
        print("=" * 50)
        print(f"\n备份位置: {BACKUP_DIR}")
        print(f"项目目录: {PROJECT_DIR}")
        
    except Exception as e:
        print(f"\n✗ 更新失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
