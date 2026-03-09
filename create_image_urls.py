#!/usr/bin/env python3
"""
创建 Mermaid 图表的在线图片 URL
用户可访问这些 URL 手动下载图片
"""

import re
import base64
import os

def extract_mermaid_blocks(content):
    """从 Markdown 中提取所有 Mermaid 代码块"""
    pattern = r'```mermaid\s*(.*?)```'
    blocks = re.findall(pattern, content, re.DOTALL)
    return blocks

def encode_mermaid_to_base64(mermaid_code):
    """将 Mermaid 代码编码为 base64 URL 安全格式"""
    code = mermaid_code.strip()
    code_bytes = code.encode('utf-8')
    encoded = base64.urlsafe_b64encode(code_bytes).decode('utf-8')
    return encoded

def main():
    print("食品订阅平台 - Mermaid 图表 URL 生成器")
    print("=" * 50)
    print()

    if not os.path.exists('ARCHITECTURE.md'):
        print("错误: 未找到 ARCHITECTURE.md 文件")
        return

    # 读取文件
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

    chart_names = [
        '整体架构概览',
        '前端架构 (React + TypeScript)',
        '后端架构 (Node.js + Express)',
        '数据流示意图',
        '组件依赖关系',
        '部署架构'
    ]

    print("图表 URL 列表:")
    print()

    urls_file_content = "# Mermaid 图表在线 URL\n\n"
    urls_file_content += "以下是架构图表的在线图片 URL，可直接在浏览器中打开下载。\n\n"

    for i, (mermaid_code, chart_name) in enumerate(zip(mermaid_blocks, chart_names)):
        print(f"图表 {i+1}: {chart_name}")
        print("-" * 40)

        # 生成 URL
        encoded = encode_mermaid_to_base64(mermaid_code)
        url = f"https://mermaid.ink/png/{encoded}"
        img_url = f"https://mermaid.ink/img/{encoded}"

        print(f"PNG 图片 URL: {url}")
        print(f"SVG 图片 URL: {img_url}")
        print()

        urls_file_content += f"## {i+1}. {chart_name}\n\n"
        urls_file_content += f"**PNG 格式**: [{url}]({url})\n\n"
        urls_file_content += f"**SVG 格式**: [{img_url}]({img_url})\n\n"

        # 保存 Mermaid 代码到单独文件
        code_filename = f"mermaid_chart_{i+1}.txt"
        with open(code_filename, 'w', encoding='utf-8') as f:
            f.write(mermaid_code)
        print(f"Mermaid 代码已保存到: {code_filename}")
        print()

    # 保存所有 URL 到文件
    with open('mermaid_urls.md', 'w', encoding='utf-8') as f:
        f.write(urls_file_content)

    print("=" * 50)
    print("✅ URL 已生成并保存到 mermaid_urls.md")
    print()
    print("📋 使用方法:")
    print("1. 打开 mermaid_urls.md 查看所有 URL")
    print("2. 在浏览器中打开 URL 查看图片")
    print("3. 右键图片选择'另存为'保存到本地")
    print()
    print("💡 备选方案:")
    print("- 使用 architecture-charts.html 交互式查看图表")
    print("- 右键图表选择'另存为图片'保存为 SVG")

    # 创建 HTML 文件显示所有 URL
    html_content = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>架构图表 URL 列表</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .chart { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .url { background: white; padding: 10px; border: 1px solid #ddd; border-radius: 3px; margin: 5px 0; }
        a { color: #0066cc; }
    </style>
</head>
<body>
    <div class="container">
        <h1>架构图表 URL 列表</h1>
        <p>点击链接查看图表图片，右键图片可保存。</p>
"""

    for i, chart_name in enumerate(chart_names):
        encoded = encode_mermaid_to_base64(mermaid_blocks[i])
        png_url = f"https://mermaid.ink/png/{encoded}"
        svg_url = f"https://mermaid.ink/img/{encoded}"

        html_content += f"""
        <div class="chart">
            <h3>图表 {i+1}: {chart_name}</h3>
            <div class="url">
                <strong>PNG 图片:</strong> <a href="{png_url}" target="_blank">{png_url}</a>
            </div>
            <div class="url">
                <strong>SVG 图片:</strong> <a href="{svg_url}" target="_blank">{svg_url}</a>
            </div>
            <p><small>预览: <img src="{png_url}" alt="{chart_name}" style="max-width: 100%; height: auto; margin-top: 10px;"></small></p>
        </div>
"""

    html_content += """
    </div>
</body>
</html>"""

    with open('mermaid_urls.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    print("- 已创建 mermaid_urls.html，可直接查看所有图表预览")

if __name__ == "__main__":
    main()