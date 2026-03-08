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
GIT_REPO = "git@codehub.devcloud.cn-north-4.huaweicloud.com:a384bf0b99f140dbaa16281939ab38b1/huawei_food_subscription.git"
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
    print("\n[1/8] 备份当前版本...")
    if os.path.exists(PROJECT_DIR):
        os.makedirs(os.path.dirname(BACKUP_DIR), exist_ok=True)
        shutil.copytree(PROJECT_DIR, BACKUP_DIR)
        print(f"  ✓ 备份完成: {BACKUP_DIR}")

        # 清理旧备份，只保留最近5个版本
        print("  清理旧备份...")
        cleanup_old_backups(keep_count=5)
    else:
        raise RuntimeError(f"项目目录不存在: {PROJECT_DIR}")

def cleanup_old_backups(keep_count=5):
    """清理旧的备份，只保留指定数量的最新备份"""
    backup_parent = os.path.dirname(BACKUP_DIR)  # /var/www/backups
    if not os.path.exists(backup_parent):
        print(f"  ! 备份目录不存在: {backup_parent}")
        return

    # 查找所有 food-subscription- 开头的备份目录
    backup_dirs = []
    try:
        for item in os.listdir(backup_parent):
            if item.startswith("food-subscription-") and os.path.isdir(os.path.join(backup_parent, item)):
                backup_path = os.path.join(backup_parent, item)
                backup_dirs.append(backup_path)
    except Exception as e:
        print(f"  ! 读取备份目录失败: {e}")
        return

    if not backup_dirs:
        print(f"  ! 未找到备份目录")
        return

    # 按目录名中的时间戳排序（最新的在前）
    def get_backup_timestamp(backup_path):
        """从备份目录名中提取时间戳，返回 datetime 对象"""
        dir_name = os.path.basename(backup_path)
        try:
            # 目录名格式: food-subscription-YYYYMMDD-HHMMSS
            if dir_name.startswith("food-subscription-"):
                timestamp_str = dir_name[len("food-subscription-"):]
                # 格式: YYYYMMDD-HHMMSS
                return datetime.datetime.strptime(timestamp_str, "%Y%m%d-%H%M%S")
        except (ValueError, IndexError):
            pass
        # 如果解析失败，使用文件修改时间
        return datetime.datetime.fromtimestamp(os.path.getmtime(backup_path))

    backup_dirs.sort(key=get_backup_timestamp, reverse=True)

    total_backups = len(backup_dirs)
    if total_backups <= keep_count:
        print(f"  ✓ 备份数量 ({total_backups}) 未超过保留限制 ({keep_count})")
        return

    # 需要删除的旧备份（排除当前备份目录）
    backups_to_delete = [
        backup_dir for backup_dir in backup_dirs[keep_count:]
        if os.path.normpath(backup_dir) != os.path.normpath(BACKUP_DIR)
    ]
    print(f"  ! 发现 {total_backups} 个备份，保留最新的 {keep_count} 个")

    deleted_count = 0
    for backup_dir in backups_to_delete:
        try:
            shutil.rmtree(backup_dir)
            print(f"    删除旧备份: {os.path.basename(backup_dir)}")
            deleted_count += 1
        except Exception as e:
            print(f"    ! 删除失败 {os.path.basename(backup_dir)}: {e}")

    print(f"  ✓ 已清理 {deleted_count} 个旧备份")
    return deleted_count

def fix_git_ownership():
    """修复 Git 目录所有权问题"""
    try:
        subprocess.run(
            f"git config --global --add safe.directory {PROJECT_DIR}",
            shell=True, check=False, capture_output=True
        )
    except:
        pass

def fix_git_http2():
    """禁用 Git HTTP/2 协议，解决网络问题"""
    try:
        subprocess.run(
            "git config --global http.version HTTP/1.1",
            shell=True, check=False, capture_output=True
        )
        subprocess.run(
            "git config --global http.postBuffer 524288000",
            shell=True, check=False, capture_output=True
        )
    except:
        pass

def pull_or_clone():
    """拉取或克隆最新代码"""
    print("\n[2/8] 拉取最新代码...")
    
    # 先修复可能的 Git 所有权和网络问题
    fix_git_ownership()
    fix_git_http2()
    
    if is_git_repo(PROJECT_DIR):
        # 是 git 仓库，直接使用 git pull
        try:
            # 先检查是否有本地修改
            result = subprocess.run(
                "git status --porcelain",
                shell=True, cwd=PROJECT_DIR, capture_output=True, text=True
            )
            
            if result.stdout.strip():
                print("  ! 检测到本地修改，先暂存...")
                # 暂存本地修改
                subprocess.run("git add -A", shell=True, cwd=PROJECT_DIR, check=False)
                subprocess.run(
                    'git commit -m "WIP: auto-commit before update" || git stash',
                    shell=True, cwd=PROJECT_DIR, check=False
                )
            
            # 强制拉取最新代码（放弃本地修改）
            run_command("git fetch origin", cwd=PROJECT_DIR)
            run_command("git reset --hard origin/main", cwd=PROJECT_DIR)
            print("  ✓ 代码更新成功 (git reset --hard)")
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
    print("\n[3/8] 修复脚本换行符...")
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

def sync_frontend_dist():
    """同步前端 dist 文件到部署目录"""
    print("\n[4/8] 同步前端文件...")
    src_dist = os.path.join(PROJECT_DIR, "frontend-src", "dist")
    dst_dist = os.path.join(PROJECT_DIR, "frontend", "dist")
    
    if not os.path.exists(src_dist):
        print(f"  ! 警告: 源目录不存在 {src_dist}")
        return
    
    # 确保目标目录存在
    os.makedirs(dst_dist, exist_ok=True)
    
    # 清空旧文件
    for item in os.listdir(dst_dist):
        item_path = os.path.join(dst_dist, item)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        else:
            os.remove(item_path)
    
    # 复制新文件
    for item in os.listdir(src_dist):
        src = os.path.join(src_dist, item)
        dst = os.path.join(dst_dist, item)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    
    print(f"  ✓ 前端文件已同步到 {dst_dist}")

def add_version_marker():
    """在 index.html 中添加版本标识"""
    print("\n[5/8] 添加版本标识...")
    
    index_path = os.path.join(PROJECT_DIR, "frontend", "dist", "index.html")
    if not os.path.exists(index_path):
        print(f"  ! 警告: 找不到 {index_path}")
        return
    
    try:
        # 获取版本信息
        result = subprocess.run(
            "git rev-parse --short HEAD",
            shell=True, cwd=PROJECT_DIR, capture_output=True, text=True
        )
        commit_hash = result.stdout.strip() if result.returncode == 0 else "unknown"
        
        # 获取当前时间
        update_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # 读取 index.html
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 版本标识 HTML (右上角固定，可关闭，每次刷新都显示)
        version_marker = f'''<!-- 版本标识 -->
<div id="version-marker" style="
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-family: monospace;
    font-size: 12px;
    font-weight: bold;
    z-index: 99999;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    cursor: pointer;
    opacity: 0.95;
    transition: all 0.3s ease;
    max-width: 300px;
    text-align: center;
    line-height: 1.4;
" onclick="this.style.display='none';" title="点击关闭">
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center;">
        <span>📦</span>
        <span>v{commit_hash}</span>
        <span style="opacity: 0.7;">|</span>
        <span style="font-size: 11px; opacity: 0.9;">{update_time}</span>
        <span style="font-size: 10px; opacity: 0.6; margin-left: 4px;">✕</span>
    </div>
</div>
<script>
    // 5秒后自动淡化
    setTimeout(function() {{
        var marker = document.getElementById('version-marker');
        if (marker && marker.style.display !== 'none') {{
            marker.style.opacity = '0.4';
        }}
    }}, 5000);
    // 鼠标悬停时恢复透明度
    document.getElementById('version-marker').addEventListener('mouseenter', function() {{
        if (this.style.display !== 'none') {{
            this.style.opacity = '0.95';
        }}
    }});
    document.getElementById('version-marker').addEventListener('mouseleave', function() {{
        if (this.style.display !== 'none') {{
            this.style.opacity = '0.4';
        }}
    }});
</script>
<style>
    #version-marker:hover {{ opacity: 0.95 !important; transform: scale(1.02); }}
    #version-marker {{ animation: fadeInScale 0.5s ease-out; }}
    @keyframes fadeInScale {{
        from {{ opacity: 0; transform: scale(0.9) translateY(-10px); }}
        to {{ opacity: 0.95; transform: scale(1) translateY(0); }}
    }}
</style>
<!-- 版本标识结束 -->
'''
        
        # 在 <body> 标签后插入版本标识
        if '<body>' in content:
            content = content.replace('<body>', f'<body>\n{version_marker}')
        elif '<body ' in content:
            # 处理带属性的 body 标签
            import re
            content = re.sub(r'(<body[^>]*>)', r'\1\n' + version_marker, content)
        
        # 写回文件
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ 版本标识已添加: {commit_hash} @ {update_time}")
        
    except Exception as e:
        print(f"  ! 添加版本标识失败: {e}")

def install_dependencies():
    """安装后端依赖"""
    print("\n[6/8] 安装后端依赖...")
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
    print("\n[7/8] 重启后端服务...")
    
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
    print("\n[8/8] 检查服务状态...")
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
        sync_frontend_dist()
        add_version_marker()
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
