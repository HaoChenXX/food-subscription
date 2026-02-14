#!/usr/bin/env python3
"""
修复文件换行符（CRLF -> LF）- v1.1 版本
在 Linux 服务器上运行此脚本

使用方法:
    python3 fix-line-endings-v1.1.py
"""
import os
import sys

files_to_fix = [
    'deploy-v1.1.sh',
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
    
    print("修复文件换行符 (v1.1)...")
    print("=" * 40)
    
    for file in files_to_fix:
        filepath = os.path.join(script_dir, file)
        fix_file(filepath)
    
    print("=" * 40)
    print("完成！")
