#!/usr/bin/env python3
"""
简单的 Mermaid 图表导出脚本
创建 HTML 文件用于可视化图表
"""

import re
import os

def extract_mermaid_blocks(content):
    """从 Markdown 中提取所有 Mermaid 代码块"""
    pattern = r'```mermaid\s*(.*?)```'
    blocks = re.findall(pattern, content, re.DOTALL)
    return blocks

def create_simple_html(mermaid_blocks):
    """创建简单的 HTML 文件显示所有图表"""

    html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>食品订阅平台 - 架构图表</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
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
        .mermaid {
            width: 100%;
            overflow: auto;
            min-height: 300px;
        }
        .instructions {
            background: #e6fffa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #38b2ac;
        }
        .index {
            background: #ebf8ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .index ul {
            columns: 2;
            list-style-type: none;
            padding: 0;
        }
        .index li {
            padding: 5px 0;
        }
        .index a {
            color: #2c5282;
            text-decoration: none;
        }
        .index a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🥬 食材包订阅平台 - 架构示意图</h1>

        <div class="instructions">
            <strong>使用说明:</strong>
            <p>1. 所有图表使用 Mermaid.js 渲染，可缩放查看</p>
            <p>2. 右键图表选择"另存为图片"可保存为SVG格式</p>
            <p>3. 使用 Ctrl+鼠标滚轮 可缩放图表</p>
            <p>4. 如需PNG格式，可使用截图工具</p>
        </div>

        <div class="index">
            <h3>📊 图表索引</h3>
            <ul>
                <li><a href="#chart1">1. 整体架构概览</a></li>
                <li><a href="#chart2">2. 前端架构 (React + TypeScript)</a></li>
                <li><a href="#chart3">3. 后端架构 (Node.js + Express)</a></li>
                <li><a href="#chart4">4. 数据流示意图</a></li>
                <li><a href="#chart5">5. 组件依赖关系</a></li>
                <li><a href="#chart6">6. 部署架构</a></li>
            </ul>
        </div>
"""

    chart_titles = [
        "整体架构概览 - 用户端、后端服务和部署环境关系",
        "前端架构 - React 19 + TypeScript 分层结构",
        "后端架构 - Node.js + Express + MySQL 分层结构",
        "数据流示意图 - 用户交互完整流程",
        "组件依赖关系 - 前后端技术栈依赖",
        "部署架构 - 生产环境和开发环境对比"
    ]

    for i, (code, title) in enumerate(zip(mermaid_blocks, chart_titles)):
        html += f"""
        <div class="chart" id="chart{i+1}">
            <div class="chart-title">{title}</div>
            <div class="mermaid">
{code}
            </div>
        </div>
"""

    html += """
    </div>

    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: { useMaxWidth: false },
            sequence: { useMaxWidth: false, height: 300 }
        });

        // 添加缩放功能
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.mermaid svg').forEach(svg => {
                svg.style.cursor = 'grab';
                svg.addEventListener('wheel', function(e) {
                    e.preventDefault();
                    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
                    const currentScale = parseFloat(svg.style.transform.match(/scale\\(([^)]+)\\)/)?.[1] || 1);
                    const newScale = Math.max(0.1, Math.min(5, currentScale * scaleFactor));
                    svg.style.transform = `scale(${newScale})`;
                    svg.style.transformOrigin = 'center';
                });
            });
        });
    </script>
</body>
</html>"""

    return html

def main():
    # 读取 ARCHITECTURE.md
    try:
        with open('ARCHITECTURE.md', 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print("错误: 未找到 ARCHITECTURE.md 文件")
        return

    # 提取 Mermaid 代码块
    mermaid_blocks = extract_mermaid_blocks(content)

    if not mermaid_blocks:
        print("未找到 Mermaid 代码块")
        return

    print(f"找到 {len(mermaid_blocks)} 个 Mermaid 图表")

    # 创建 HTML 文件
    html_content = create_simple_html(mermaid_blocks)

    with open('architecture-charts.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    print("已创建 architecture-charts.html")
    print("请用浏览器打开此文件查看图表")

    # 创建说明文件
    with open('README-CHARTS.txt', 'w', encoding='utf-8') as f:
        f.write("""架构图表查看说明
================

已生成文件: architecture-charts.html

使用方法:
1. 用浏览器打开 architecture-charts.html
2. 图表会自动渲染
3. 使用鼠标滚轮缩放图表
4. 右键图表选择"另存为图片"保存为SVG

图表列表:
1. 整体架构概览
2. 前端架构 (React + TypeScript)
3. 后端架构 (Node.js + Express)
4. 数据流示意图
5. 组件依赖关系
6. 部署架构

注意事项:
- 需要网络连接加载 Mermaid.js 库
- 建议使用 Chrome 或 Edge 浏览器
- 如需 PNG 格式，可使用截图工具

项目: 食材包订阅平台
版本: food-subscription-v01.1-backup
生成时间: 2026-03-08
""")

    print("已创建 README-CHARTS.txt")

if __name__ == "__main__":
    main()