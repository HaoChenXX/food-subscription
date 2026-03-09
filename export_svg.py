#!/usr/bin/env python3
"""
导出 ARCHITECTURE.md 中的 Mermaid 图表为 SVG 文件
使用 mermaid.ink API 在线生成 SVG
"""

import re
import base64
import os
import sys
import time
from urllib.request import urlopen, Request
from urllib.error import URLError

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

def download_svg(url, filename):
    """下载 SVG 文件"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        req = Request(url, headers=headers)

        with urlopen(req, timeout=30) as response:
            if response.status == 200:
                content = response.read()
                # 检查是否为有效的 SVG
                if b'<svg' in content[:100].lower():
                    with open(filename, 'wb') as f:
                        f.write(content)
                    return True
                else:
                    # 可能返回的是错误页面
                    print(f"    警告: 下载的内容可能不是有效的 SVG")
                    # 仍然保存以便检查
                    with open(filename, 'wb') as f:
                        f.write(content)
                    return True
            else:
                print(f"    HTTP 错误: {response.status}")
                return False
    except URLError as e:
        print(f"    网络错误: {e}")
        return False
    except Exception as e:
        print(f"    未知错误: {e}")
        return False

def generate_svg_url(mermaid_code):
    """生成 mermaid.ink SVG URL"""
    encoded = encode_mermaid_to_base64(mermaid_code)
    url = f"https://mermaid.ink/svg/{encoded}"
    return url

def create_html_with_svg(svg_files):
    """创建包含所有 SVG 文件的 HTML 页面"""
    html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>食材包订阅平台 - 架构图表 (SVG版)</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 3px solid #4CAF50;
        }
        .chart {
            background: white;
            padding: 25px;
            margin: 25px 0;
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .chart-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #2c5282;
            border-bottom: 2px solid #4299e1;
            padding-bottom: 10px;
        }
        .chart-description {
            color: #666;
            margin-bottom: 15px;
            font-size: 14px;
        }
        .svg-container {
            width: 100%;
            overflow: auto;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 15px;
            background: #fafafa;
            min-height: 400px;
        }
        .svg-container svg {
            width: 100%;
            height: auto;
            max-width: 100%;
        }
        .download-links {
            margin-top: 15px;
            padding: 10px;
            background: #f0f8ff;
            border-radius: 5px;
            font-size: 14px;
        }
        .download-links a {
            color: #2c5282;
            text-decoration: none;
            margin-right: 15px;
        }
        .download-links a:hover {
            text-decoration: underline;
        }
        .index {
            background: #e8f5e9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .index h3 {
            margin-top: 0;
            color: #2e7d32;
        }
        .index ul {
            columns: 2;
            list-style-type: none;
            padding: 0;
        }
        .index li {
            padding: 8px 0;
            border-bottom: 1px solid #c8e6c9;
        }
        .index a {
            color: #2e7d32;
            text-decoration: none;
        }
        .index a:hover {
            text-decoration: underline;
        }
        .instructions {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🥬 食材包订阅平台 - 架构示意图 (SVG矢量图)</h1>

        <div class="instructions">
            <strong>📋 使用说明:</strong>
            <p>所有图表已导出为 SVG 矢量格式，可在任何图像查看器中打开，支持无损缩放。</p>
            <p>SVG 文件保存在 <code>svg_charts/</code> 目录中。</p>
        </div>

        <div class="index">
            <h3>📊 图表索引</h3>
            <ul>'''

    chart_titles = [
        "1. 整体架构概览",
        "2. 前端架构 (React + TypeScript)",
        "3. 后端架构 (Node.js + Express)",
        "4. 数据流示意图",
        "5. 组件依赖关系",
        "6. 部署架构"
    ]

    for i, title in enumerate(chart_titles):
        html += f'<li><a href="#chart{i+1}">{title}</a></li>\n'

    html += '''            </ul>
        </div>'''

    titles_detailed = [
        "整体架构概览 - 用户端、后端服务和部署环境关系",
        "前端架构 - React 19 + TypeScript 分层结构",
        "后端架构 - Node.js + Express + MySQL 分层结构",
        "数据流示意图 - 用户交互完整流程",
        "组件依赖关系 - 前后端技术栈依赖",
        "部署架构 - 生产环境和开发环境对比"
    ]

    descriptions = [
        "展示用户界面、后端服务和部署环境的整体关系，包括数据流向和组件交互。",
        "React前端的分层架构，包含页面层、组件层、状态管理层和服务层。",
        "Node.js后端的中间件、路由层、数据层和配置文件的完整架构。",
        "用户从登录到下单的完整交互流程，展示前后端数据传递过程。",
        "前后端技术栈的依赖关系，包括库和框架的版本信息。",
        "生产环境与开发环境的部署架构对比，展示服务器配置和服务管理。"
    ]

    for i, (title, description, svg_file) in enumerate(zip(titles_detailed, descriptions, svg_files)):
        html += f'''
        <div class="chart" id="chart{i+1}">
            <div class="chart-title">{title}</div>
            <div class="chart-description">{description}</div>

            <div class="svg-container">
                <object data="{svg_file}" type="image/svg+xml" width="100%" height="500">
                    <img src="{svg_file}" alt="{title}" style="max-width: 100%;">
                </object>
            </div>

            <div class="download-links">
                <strong>下载:</strong>
                <a href="{svg_file}" download="architecture-chart-{i+1}.svg">SVG 矢量图</a>
                <a href="{svg_file}" target="_blank">在新窗口打开</a>
                <span style="color: #666; float: right;">文件: {svg_file}</span>
            </div>
        </div>'''

    html += '''
    </div>
</body>
</html>'''

    return html

def main():
    print("食材包订阅平台 - SVG 图表导出工具")
    print("==================================")
    print()

    # 检查文件
    if not os.path.exists('ARCHITECTURE.md'):
        print("错误: 未找到 ARCHITECTURE.md 文件")
        return

    # 读取文件
    print("正在读取 ARCHITECTURE.md...")
    try:
        with open('ARCHITECTURE.md', 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"读取文件失败: {e}")
        return

    # 提取 Mermaid 代码块
    mermaid_blocks = extract_mermaid_blocks(content)
    if not mermaid_blocks:
        print("未找到 Mermaid 代码块")
        return

    print(f"找到 {len(mermaid_blocks)} 个 Mermaid 图表")
    print()

    # 创建 SVG 目录
    svg_dir = 'svg_charts'
    if not os.path.exists(svg_dir):
        os.makedirs(svg_dir)
        print(f"创建目录: {svg_dir}")

    print("正在从 mermaid.ink 生成 SVG 图表...")
    print("注意: 需要网络连接，可能需要一些时间")
    print()

    svg_files = []
    chart_names = [
        'overall-architecture',
        'frontend-architecture',
        'backend-architecture',
        'data-flow-diagram',
        'dependencies-diagram',
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
        print(f"图表 {i+1}/{len(mermaid_blocks)}: {title}")

        # 生成 SVG 文件名
        filename = os.path.join(svg_dir, f'{chart_name}.svg')
        svg_files.append(filename)

        # 检查是否已存在
        if os.path.exists(filename):
            print(f"    SVG 文件已存在: {filename}")
            success_count += 1
            continue

        try:
            # 生成 URL
            url = generate_svg_url(mermaid_code)
            print(f"    正在生成: {filename}")
            print(f"    来源 URL: {url}")

            # 下载 SVG
            if download_svg(url, filename):
                print(f"    [OK] 下载成功")
                success_count += 1
            else:
                print(f"    [FAIL] 下载失败")

        except Exception as e:
            print(f"    [FAIL] 生成失败: {e}")

        # 避免请求过快
        if i < len(mermaid_blocks) - 1:
            time.sleep(1)  # 1秒延迟

        print()

    print()
    print("=" * 40)

    if success_count > 0:
        print(f"[OK] 成功生成 {success_count}/{len(mermaid_blocks)} 个 SVG 图表")

        # 创建 HTML 文件
        print("正在创建 HTML 查看页面...")
        html_content = create_html_with_svg(svg_files)

        html_filename = 'architecture-svg-viewer.html'
        with open(html_filename, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"✅ 已创建 {html_filename}")
        print()
        print("[DONE] 导出完成！")
        print()
        print("[FILES] 生成的文件:")
        print(f"   1. {svg_dir}/ - 包含所有 SVG 矢量图")
        print(f"   2. {html_filename} - SVG 图表查看页面")
        print()
        print("[USAGE] 使用方法:")
        print(f"   1. 用浏览器打开 {html_filename} 查看所有图表")
        print("   2. 右键 SVG 图表选择'另存为'可保存矢量图")
        print("   3. 或直接打开 svg_charts/ 目录中的 SVG 文件")
        print()
        print("[ADV] SVG 优势:")
        print("   - 矢量格式，无损缩放")
        print("   - 可在任何图像软件中编辑")
        print("   - 文件大小较小")
    else:
        print("[FAIL] 未能生成任何 SVG 图表")
        print()
        print("[ALT] 备选方案:")
        print("   1. 使用 architecture-charts.html 交互式查看")
        print("   2. 在浏览器中右键图表选择'另存为图片' (SVG)")
        print("   3. 或手动复制 Mermaid 代码到在线编辑器")

    # 创建说明文件
    with open('README-SVG.txt', 'w', encoding='utf-8') as f:
        f.write("""SVG 图表导出说明
================

已生成的文件:
1. svg_charts/ - 包含 6 个架构图表的 SVG 矢量图
2. architecture-svg-viewer.html - SVG 图表查看页面

图表列表:
1. overall-architecture.svg - 整体架构概览
2. frontend-architecture.svg - 前端架构
3. backend-architecture.svg - 后端架构
4. data-flow-diagram.svg - 数据流示意图
5. dependencies-diagram.svg - 组件依赖关系
6. deployment-architecture.svg - 部署架构

使用方法:
1. 用浏览器打开 architecture-svg-viewer.html 查看所有图表
2. 或直接打开 svg_charts/ 目录中的 SVG 文件
3. 右键图表选择"另存为"可保存矢量图

SVG 格式优势:
- 矢量图形，可无损缩放
- 文件较小，加载快速
- 可在 Adobe Illustrator、Inkscape 等软件中编辑
- 支持透明背景

注意事项:
- SVG 生成需要网络连接访问 mermaid.ink
- 如果生成失败，请检查网络连接
- 某些旧版浏览器可能对 SVG 支持有限

备选方案:
如果 SVG 生成失败，请使用:
1. architecture-charts.html - 交互式图表
2. 在浏览器中右键图表保存为 SVG

项目: 食材包订阅平台
版本: food-subscription-v01.1-backup
生成时间: 2026-03-08
""")

    print("[OK] 已创建 README-SVG.txt")

if __name__ == "__main__":
    main()