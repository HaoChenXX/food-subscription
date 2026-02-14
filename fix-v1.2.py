#!/usr/bin/env python3
"""
修复文件换行符（CRLF -> LF）- v1.2 跨平台版本
支持在 Windows 本地和 Ubuntu 服务器上运行

Windows 用法:
    python fix-v1.2.py
    
Ubuntu 用法:
    python3 fix-v1.2.py
"""
import os
import sys
import glob

def get_files_to_fix():
    """获取需要修复的文件列表"""
    files = []
    
    # 主要脚本文件
    main_files = [
        'v1_2.sh',
        'backend/server.js',
        'backend/package.json',
    ]
    
    # db 目录
    db_files = glob.glob('backend/db/*.js')
    
    # middleware 目录
    middleware_files = glob.glob('backend/middleware/*.js')
    
    # routes 目录
    routes_files = glob.glob('backend/routes/*.js')
    
    # utils 目录
    utils_files = glob.glob('backend/utils/*.js')
    
    files = main_files + db_files + middleware_files + routes_files + utils_files
    return files

def fix_file(filepath):
    """修复单个文件的换行符"""
    if not os.path.exists(filepath):
        print(f"  [跳过] 不存在: {filepath}")
        return False
    
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
        
        # 检查是否有 CRLF
        if b'\r\n' not in content:
            print(f"  [OK] 无需修复: {filepath}")
            return True
        
        # 替换 CRLF 为 LF
        content_fixed = content.replace(b'\r\n', b'\n')
        
        with open(filepath, 'wb') as f:
            f.write(content_fixed)
        
        # 统计替换数量
        crlf_count = content.count(b'\r\n')
        print(f"  [已修复] {filepath} ({crlf_count} 处 CRLF)")
        return True
        
    except Exception as e:
        print(f"  [错误] {filepath}: {str(e)}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("  修复文件换行符 - v1.2")
    print("  Windows CRLF -> Unix LF")
    print("=" * 60)
    
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print(f"\n工作目录: {script_dir}")
    print(f"操作系统: {sys.platform}")
    print()
    
    files = get_files_to_fix()
    print(f"发现 {len(files)} 个文件需要检查:\n")
    
    fixed_count = 0
    ok_count = 0
    error_count = 0
    
    for filepath in files:
        result = fix_file(filepath)
        if result:
            ok_count += 1
        else:
            error_count += 1
    
    print()
    print("=" * 60)
    print("  修复完成!")
    print(f"  总计: {len(files)} 个文件")
    print(f"  成功: {ok_count} 个")
    print(f"  失败: {error_count} 个")
    print("=" * 60)
    
    if sys.platform == 'win32':
        print("\n提示: 文件已准备好上传到 Ubuntu 服务器")
        print("      可以使用 scp 命令上传:")
        print("      scp -r . root@服务器IP:/var/www/food-subscription-v1.2/")
    else:
        print("\n提示: 现在可以运行部署脚本:")
        print("      sudo bash v1_2.sh")
    
    return 0 if error_count == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
