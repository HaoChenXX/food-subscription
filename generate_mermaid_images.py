#!/usr/bin/env python3
"""
使用 mermaid.ink API 生成 PNG 图片
"""

import re
import base64
import os
import sys
from urllib.request import urlopen, Request
from urllib.error import URLError
import json

def extract_mermaid_blocks(content):
    """从 Markdown 中提取所有 Mermaid 代码块"""
    pattern = r'```mermaid\s*(.*?)```'
    blocks = re.findall(pattern, content, re.DOTALL)
    return blocks

def encode_mermaid_to_base64(mermaid_code):
    """将 Mermaid 代码编码为 base64 URL 安全格式"""
    # 移除多余空白
    code = mermaid_code.strip()
    # 转换为 bytes
    code_bytes = code.encode('utf-8')
    # base64 编码
    encoded = base64.urlsafe_b64encode(code_bytes).decode('utf-8')
    return encoded

def download_image(url, filename):
    """下载图片到文件"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        req = Request(url, headers=headers)

        with urlopen(req) as response:
            if response.status == 200:
                with open(filename, 'wb') as f:
                    f.write(response.read())
                return True
            else:
                print(f"  HTTP 错误: {response.status}")
                return False
    except URLError as e:
        print(f"  下载错误: {e}")
        return False
    except Exception as e:
        print(f"  未知错误: {e}")
        return False

def generate_mermaid_ink_url(mermaid_code, img_format='png'):
    """生成 mermaid.ink URL"""
    encoded = encode_mermaid_to_base64(mermaid_code)
    url = f"https://mermaid.ink/{img_format}/{encoded}"
    return url

def create_html_with_local_images(mermaid_blocks, image_files):
    """创建使用本地图片的 HTML 文件"""
    html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>食品订阅平台 - 架构图表 (本地图片版)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; text-align: center; }
        .chart {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .chart-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c5282;
            border-bottom: 2px solid #4299e1;
            padding-bottom: 8px;
        }
        .chart-image {
            width: 100%;
            max-width: 1000px;
            border: 1px solid #ddd;
            border-radius: 5px;
            display: block;
            margin: 0 auto;
        }
        .index {
            background: #ebf8ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .instructions {
            background: #e6fffa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #38b2ac;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🥬 食材包订阅平台 - 架构示意图 (PNG 图片版)</h1>

        <div class="instructions">
            <strong>📋 使用说明:</strong>
            <p>所有图表已生成本地 PNG 图片，无需网络连接即可查看。</p>
            <p>图片文件保存在当前目录的 <code>mermaid_images/</code> 文件夹中。</p>
        </div>

        <div class="index">
            <h3>📊 图表索引</h3>
            <ul>
"""

    chart_titles = [
        "1. 整体架构概览",
        "2. 前端架构 (React + TypeScript)",
        "3. 后端架构 (Node.js + Express)",
        "4. 数据流示意图",
        "5. 组件依赖关系",
        "6. 部署架构"
    ]

    for i, title in enumerate(chart_titles):
        html += f'                <li><a href="#chart{i+1}">{title}</a></li>\n'

    html += """            </ul>
        </div>
"""

    titles_detailed = [
        "整体架构概览 - 用户端、后端服务和部署环境关系",
        "前端架构 - React 19 + TypeScript 分层结构",
        "后端架构 - Node.js + Express + MySQL 分层结构",
        "数据流示意图 - 用户交互完整流程",
        "组件依赖关系 - 前后端技术栈依赖",
        "部署架构 - 生产环境和开发环境对比"
    ]

    for i, (title, img_file) in enumerate(zip(titles_detailed, image_files)):
        html += f"""
        <div class="chart" id="chart{i+1}">
            <div class="chart-title">{title}</div>
            <img src="{img_file}" alt="{title}" class="chart-image">
            <p style="text-align: center; color: #666; margin-top: 10px;">
                图 {i+1}: {title} | <a href="{img_file}" download>下载图片</a>
            </p>
        </div>
"""

    html += """
    </div>
</body>
</html>"""

    return html

def main():
    print("🥬 食材包订阅平台 - Mermaid 图表 PNG 生成器")
    print("=" * 50)
    print()

    # 检查文件
    if not os.path.exists('ARCHITECTURE.md'):
        print("❌ 错误: 未找到 ARCHITECTURE.md 文件")
        print("请确保在当前目录运行此脚本")
        return

    # 读取文件
    print("📖 正在读取 ARCHITECTURE.md...")
    try:
        with open('ARCHITECTURE.md', 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ 读取文件失败: {e}")
        return

    # 提取 Mermaid 代码块
    mermaid_blocks = extract_mermaid_blocks(content)
    if not mermaid_blocks:
        print("❌ 未找到 Mermaid 代码块")
        return

    print(f"✅ 找到 {len(mermaid_blocks)} 个 Mermaid 图表")
    print()

    # 创建图片目录
    image_dir = 'mermaid_images'
    if not os.path.exists(image_dir):
        os.makedirs(image_dir)
        print(f"📁 创建目录: {image_dir}")

    print("🌐 正在从 mermaid.ink 生成图片...")
    print("   注意: 需要网络连接")
    print()

    image_files = []
    chart_names = [
        'overall-architecture',
        'frontend-architecture',
        'backend-architecture',
        'data-flow',
        'dependencies',
        'deployment-architecture'
    ]

    titles = [
        "整体架构概览",
        "前端架构",
        "后端架构",
        "数据流示意图",
        "组件依赖关系",
        "部署架构"
    ]

    success_count = 0

    for i, (mermaid_code, chart_name, title) in enumerate(zip(mermaid_blocks, chart_names, titles)):
        print(f"  图表 {i+1}/{len(mermaid_blocks)}: {title}")

        # 生成图片文件名
        filename = os.path.join(image_dir, f'{chart_name}.png')
        image_files.append(filename)

        # 检查是否已存在
        if os.path.exists(filename):
            print(f"    ✅ 图片已存在: {filename}")
            success_count += 1
            continue

        try:
            # 生成 URL
            url = generate_mermaid_ink_url(mermaid_code, 'png')

            # 下载图片
            print(f"    正在下载: {filename}")
            if download_image(url, filename):
                print(f"    ✅ 下载成功")
                success_count += 1
            else:
                print(f"    ❌ 下载失败")

        except Exception as e:
            print(f"    ❌ 生成失败: {e}")

        print()

    print()
    print("=" * 50)

    if success_count > 0:
        print(f"✅ 成功生成 {success_count}/{len(mermaid_blocks)} 个图表")

        # 创建 HTML 文件
        print("📄 正在创建 HTML 文件...")
        html_content = create_html_with_local_images(mermaid_blocks, image_files)

        with open('architecture-local-images.html', 'w', encoding='utf-8') as f:
            f.write(html_content)

        print("✅ 已创建 architecture-local-images.html")
        print()
        print("🎉 完成！")
        print()
        print("📁 生成的文件:")
        print(f"   1. {image_dir}/ - 包含所有 PNG 图片")
        print("   2. architecture-local-images.html - 包含本地图片的网页")
        print()
        print("📋 使用方法:")
        print("   1. 用浏览器打开 architecture-local-images.html")
        print("   2. 图片已嵌入网页，无需网络连接")
        print("   3. 右键图片选择'另存为'可保存图片")
    else:
        print("❌ 未能生成任何图片")
        print()
        print("💡 备选方案:")
        print("   1. 使用已生成的 architecture-charts.html")
        print("   2. 在浏览器中打开并截图保存")
        print("   3. 或运行 export_mermaid_simple.py 生成交互式图表")

    # 创建说明文件
    with open('README-IMAGES.txt', 'w', encoding='utf-8') as f:
        f.write("""Mermaid 图表图片生成说明
==========================

已生成的文件:
1. mermaid_images/ - 包含 6 个架构图表的 PNG 图片
2. architecture-local-images.html - 包含所有图片的网页

图表列表:
1. overall-architecture.png - 整体架构概览
2. frontend-architecture.png - 前端架构
3. backend-architecture.png - 后端架构
4. data-flow.png - 数据流示意图
5. dependencies.png - 组件依赖关系
6. deployment-architecture.png - 部署架构

使用方法:
1. 直接打开 PNG 图片文件查看
2. 或打开 architecture-local-images.html 查看所有图表

备选方案:
如果未能生成图片，请使用:
1. architecture-charts.html - 交互式图表 (需要网络)
2. 在浏览器中打开并截图保存

注意事项:
- 图片生成需要网络连接访问 mermaid.ink
- 如果生成失败，请检查网络连接
- PNG 图片为静态图像，不可交互

项目: 食材包订阅平台
版本: food-subscription-v01.1-backup
生成时间: 2026-03-08
""")

    print("✅ 已创建 README-IMAGES.txt")

if __name__ == "__main__":
    main()