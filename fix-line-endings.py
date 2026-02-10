#!/usr/bin/env python3
"""
修复文件换行符（CRLF -> LF）
在 Linux 服务器上运行此脚本
"""
import os
import sys

files_to_fix = [
    'deploy.sh',
    'backend/server.js',
    'backend/scripts/init-db.js',
    'backend/package.json'
]

def fix_file(filepath):
    if not os.path.exists(filepath):
        print(f"跳过（不存在）: {filepath}")
        return
    
    with open(filepath, 'rb') as f:
        content = f.read()
    
    # 替换 CRLF 为 LF
    content_fixed = content.replace(b'\r\n', b'\n')
    
    if content != content_fixed:
        with open(filepath, 'wb') as f:
            f.write(content_fixed)
        print(f"已修复: {filepath}")
    else:
        print(f"无需修复: {filepath}")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("修复文件换行符...")
    print("=" * 40)
    
    for file in files_to_fix:
        filepath = os.path.join(script_dir, file)
        fix_file(filepath)
    
    print("=" * 40)
    print("完成！")
