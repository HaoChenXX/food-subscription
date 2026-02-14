#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复文件换行符工具 (CRLF -> LF)
用法: python3 fix-crlf.py [文件或目录]
"""

import sys
import os
from pathlib import Path

def fix_file(file_path):
    """修复单个文件的换行符"""
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # 检测是否包含 CRLF
        if b'\r\n' not in content:
            return False
        
        # 替换 CRLF 为 LF
        new_content = content.replace(b'\r\n', b'\n')
        
        with open(file_path, 'wb') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"  错误: {file_path} - {e}")
        return False

def fix_directory(dir_path, extensions=None):
    """修复目录下所有文件的换行符"""
    fixed_count = 0
    checked_count = 0
    
    for root, dirs, files in os.walk(dir_path):
        # 跳过 node_modules 和 .git
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '__pycache__', '.venv']]
        
        for filename in files:
            if extensions and not any(filename.endswith(ext) for ext in extensions):
                continue
            
            file_path = os.path.join(root, filename)
            checked_count += 1
            
            if fix_file(file_path):
                print(f"  已修复: {file_path}")
                fixed_count += 1
    
    return checked_count, fixed_count

def main():
    if len(sys.argv) < 2:
        # 默认修复当前目录下的脚本文件
        targets = ['.']
        extensions = ['.sh', '.py', '.js', '.json', '.md', '.txt', '.ts', '.tsx', '.css', '.html']
    else:
        targets = sys.argv[1:]
        extensions = None  # 修复所有文件
    
    total_checked = 0
    total_fixed = 0
    
    for target in targets:
        if not os.path.exists(target):
            print(f"不存在: {target}")
            continue
        
        if os.path.isfile(target):
            if fix_file(target):
                print(f"已修复: {target}")
                total_fixed += 1
            total_checked += 1
        else:
            print(f"\n扫描目录: {target}")
            checked, fixed = fix_directory(target, extensions)
            total_checked += checked
            total_fixed += fixed
    
    print(f"\n{'='*50}")
    print(f"检查文件数: {total_checked}")
    print(f"修复文件数: {total_fixed}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
