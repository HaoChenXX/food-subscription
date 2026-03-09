#!/usr/bin/env python3
"""
将 ARCHITECTURE.md 中的 Mermaid 图表导出为图片
使用 mermaid.ink API 在线生成图片
"""

import re
import os
import base64
import json
import urllib.parse

def extract_mermaid_blocks(content):
    """从 Markdown 中提取所有 Mermaid 代码块"""
    pattern = r'```mermaid\s*(.*?)```'
    blocks = re.findall(pattern, content, re.DOTALL)
    return blocks

def create_html_visualizer(mermaid_blocks):
    """创建包含所有 Mermaid 图表的 HTML 文件，用于可视化"""
    html_content = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>食材包订阅平台 - 架构图表</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin: 0;
        }
        .subtitle {
            color: #7f8c8d;
            margin-top: 10px;
        }
        .charts-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 20px;
        }
        .chart-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .chart-title {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
        }
        .mermaid-container {
            width: 100%;
            min-height: 300px;
            overflow: auto;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 15px;
            background: #fafafa;
        }
        .instructions {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .button-group {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #2980b9;
        }
        .chart-index {
            background: #e8f4fc;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .chart-index ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
        }
        .chart-index li {
            padding: 8px 12px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .chart-index a {
            color: #2c3e50;
            text-decoration: none;
            font-weight: 500;
        }
        .chart-index a:hover {
            color: #3498db;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🥬 食材包订阅平台 - 架构图表</h1>
            <p class="subtitle">项目架构示意图 | 生成时间: 2026-03-08 | 版本: food-subscription-v01.1-backup</p>

            <div class="instructions">
                <strong>📋 使用说明:</strong>
                <ol>
                    <li>所有图表已使用 Mermaid.js 渲染，可缩放查看</li>
                    <li>点击下方按钮可下载单个图表为 PNG 图片</li>
                    <li>右键图表 → "另存为图片" 可保存当前视图</li>
                    <li>使用 Ctrl+鼠标滚轮 可缩放图表</li>
                </ol>
            </div>

            <div class="chart-index">
                <h3>📊 图表索引</h3>
                <ul>
"""

    # 添加图表索引
    chart_titles = [
        "1. 整体架构概览",
        "2. 前端架构 (frontend-src/)",
        "3. 后端架构 (backend/)",
        "4. 数据流示意图",
        "5. 组件依赖关系",
        "6. 部署架构"
    ]

    for i, title in enumerate(chart_titles):
        html_content += f'                    <li><a href="#chart-{i+1}">{title}</a></li>\n'

    html_content += """                </ul>
            </div>

            <div class="button-group">
                <button onclick="downloadAllCharts()">📥 下载所有图表</button>
                <button onclick="toggleDarkMode()">🌙 切换深色模式</button>
                <button onclick="zoomInAll()">🔍 放大所有图表</button>
                <button onclick="zoomOutAll()">🔎 缩小所有图表</button>
            </div>
        </div>

        <div class="charts-container">
"""

    # 添加每个图表
    for i, mermaid_code in enumerate(mermaid_blocks):
        chart_titles_detailed = [
            "整体架构概览 - 用户端、后端服务和部署环境关系",
            "前端架构 - React 19 + TypeScript 分层结构",
            "后端架构 - Node.js + Express + MySQL 分层结构",
            "数据流示意图 - 用户交互完整流程",
            "组件依赖关系 - 前后端技术栈依赖",
            "部署架构 - 生产环境和开发环境对比"
        ]

        title = chart_titles_detailed[i] if i < len(chart_titles_detailed) else f"图表 {i+1}"

        html_content += f"""
            <div class="chart-card" id="chart-{i+1}">
                <div class="chart-title">{title}</div>
                <div class="mermaid-container" id="mermaid-container-{i+1}">
                    {mermaid_code}
                </div>
                <div class="button-group">
                    <button onclick="downloadChart({i+1})">📥 下载此图表</button>
                    <button onclick="zoomIn({i+1})">➕ 放大</button>
                    <button onclick="zoomOut({i+1})">➖ 缩小</button>
                    <button onclick="resetZoom({i+1})">🔄 重置</button>
                </div>
            </div>
"""

    html_content += """
        </div>
    </div>

    <script>
        // 初始化 Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true
            },
            sequence: {
                useMaxWidth: false,
                height: 300
            }
        });

        // 渲染所有图表
        document.addEventListener('DOMContentLoaded', function() {
            // 查找所有 mermaid 容器并渲染
            const containers = document.querySelectorAll('.mermaid-container');
            containers.forEach(container => {
                const code = container.textContent;
                container.innerHTML = '';
                mermaid.render('svg-' + container.id, code, function(svgCode) {
                    container.innerHTML = svgCode;

                    // 使 SVG 可缩放
                    const svg = container.querySelector('svg');
                    if (svg) {
                        svg.style.width = '100%';
                        svg.style.height = 'auto';
                        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                        // 添加交互功能
                        svg.addEventListener('wheel', function(e) {
                            e.preventDefault();
                            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
                            const currentScale = parseFloat(svg.style.transform.match(/scale\(([^)]+)\)/)?.[1] || 1);
                            const newScale = currentScale * scaleFactor;
                            svg.style.transform = `scale(${newScale})`;
                            svg.style.transformOrigin = 'center';
                        });
                    }
                });
            });
        });

        // 下载单个图表
        function downloadChart(chartNum) {
            const container = document.getElementById(`mermaid-container-${chartNum}`);
            const svg = container.querySelector('svg');
            if (!svg) return;

            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = function() {
                canvas.width = svg.width.baseVal.value;
                canvas.height = svg.height.baseVal.value;
                ctx.drawImage(img, 0, 0);

                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `architecture-chart-${chartNum}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };

            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }

        // 下载所有图表
        function downloadAllCharts() {
            const chartCount = document.querySelectorAll('.chart-card').length;
            for (let i = 1; i <= chartCount; i++) {
                setTimeout(() => downloadChart(i), i * 500);
            }
            alert(`开始下载 ${chartCount} 个图表，请勿关闭页面...`);
        }

        // 缩放功能
        function zoomIn(chartNum) {
            const container = document.getElementById(`mermaid-container-${chartNum}`);
            const svg = container.querySelector('svg');
            if (!svg) return;

            const currentScale = parseFloat(svg.style.transform.match(/scale\(([^)]+)\)/)?.[1] || 1);
            const newScale = currentScale * 1.2;
            svg.style.transform = `scale(${newScale})`;
            svg.style.transformOrigin = 'center';
        }

        function zoomOut(chartNum) {
            const container = document.getElementById(`mermaid-container-${chartNum}`);
            const svg = container.querySelector('svg');
            if (!svg) return;

            const currentScale = parseFloat(svg.style.transform.match(/scale\(([^)]+)\)/)?.[1] || 1);
            const newScale = currentScale * 0.8;
            svg.style.transform = `scale(${newScale})`;
            svg.style.transformOrigin = 'center';
        }

        function resetZoom(chartNum) {
            const container = document.getElementById(`mermaid-container-${chartNum}`);
            const svg = container.querySelector('svg');
            if (!svg) return;

            svg.style.transform = 'scale(1)';
        }

        function zoomInAll() {
            const charts = document.querySelectorAll('.chart-card');
            charts.forEach((_, i) => zoomIn(i + 1));
        }

        function zoomOutAll() {
            const charts = document.querySelectorAll('.chart-card');
            charts.forEach((_, i) => zoomOut(i + 1));
        }

        // 深色模式
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');

            // 重新初始化 Mermaid 使用不同的主题
            mermaid.initialize({
                startOnLoad: false,
                theme: isDark ? 'dark' : 'default'
            });

            // 重新渲染所有图表
            document.querySelectorAll('.mermaid-container').forEach(container => {
                const code = container.textContent || container.innerText;
                container.innerHTML = '';
                mermaid.render('svg-' + container.id, code, function(svgCode) {
                    container.innerHTML = svgCode;
                });
            });

            // 切换样式
            if (isDark) {
                document.body.style.background = '#1a1a1a';
                document.body.style.color = '#ffffff';
                document.querySelectorAll('.chart-card, .header').forEach(el => {
                    el.style.background = '#2d2d2d';
                    el.style.color = '#ffffff';
                });
            } else {
                document.body.style.background = '#f5f5f5';
                document.body.style.color = '#000000';
                document.querySelectorAll('.chart-card, .header').forEach(el => {
                    el.style.background = '#ffffff';
                    el.style.color = '#000000';
                });
            }
        }
    </script>
</body>
</html>"""

    return html_content

def create_standalone_images(mermaid_blocks):
    """为每个 Mermaid 图表创建单独的 HTML 文件"""
    html_files = []

    chart_titles = [
        "整体架构概览",
        "前端架构",
        "后端架构",
        "数据流示意图",
        "组件依赖关系",
        "部署架构"
    ]

    for i, (mermaid_code, title) in enumerate(zip(mermaid_blocks, chart_titles)):
        html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - 食材包订阅平台</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {{
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }}
        .container {{
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-width: 1000px;
            width: 100%;
        }}
        h1 {{
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }}
        #mermaid-chart {{
            width: 100%;
            overflow: auto;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 20px;
            background: #fafafa;
            min-height: 400px;
        }}
        .instructions {{
            background: #e8f4fc;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 14px;
            color: #2c3e50;
        }}
        .download-btn {{
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 12px 24px;
            background: #3498db;
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            border: none;
            cursor: pointer;
        }}
        .download-btn:hover {{
            background: #2980b9;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🥬 {title}</h1>
        <div id="mermaid-chart">
{mermaid_code}
        </div>

        <button class="download-btn" onclick="downloadChart()">📥 下载 PNG 图片</button>

        <div class="instructions">
            <strong>使用提示:</strong>
            <ul>
                <li>右键图表 → "另存为图片" 可保存 SVG</li>
                <li>使用鼠标滚轮可缩放图表</li>
                <li>点击上方按钮可下载 PNG 格式</li>
            </ul>
        </div>
    </div>

    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'default',
            flowchart: {{ useMaxWidth: false }},
            sequence: {{ useMaxWidth: false }}
        }});

        function downloadChart() {{
            const container = document.getElementById('mermaid-chart');
            const svg = container.querySelector('svg');
            if (!svg) return;

            // 获取 SVG 数据
            const svgData = new XMLSerializer().serializeToString(svg);

            // 创建 Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 创建 Image 对象
            const img = new Image();
            img.onload = function() {{
                // 设置 Canvas 尺寸为 SVG 尺寸
                canvas.width = svg.width.baseVal.value || 800;
                canvas.height = svg.height.baseVal.value || 600;

                // 绘制到 Canvas
                ctx.drawImage(img, 0, 0);

                // 转换为 PNG
                const pngUrl = canvas.toDataURL('image/png');

                // 创建下载链接
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = 'food-subscription-architecture-' + ({i+1}) + '.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }};

            // 设置 Image 源为 SVG
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }}

        // 添加缩放功能
        document.addEventListener('DOMContentLoaded', function() {{
            const container = document.getElementById('mermaid-chart');
            const svg = container.querySelector('svg');
            if (svg) {{
                svg.addEventListener('wheel', function(e) {{
                    e.preventDefault();
                    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
                    const currentScale = parseFloat(svg.style.transform.match(/scale\(([^)]+)\)/)?.[1] || 1);
                    const newScale = Math.max(0.1, Math.min(5, currentScale * scaleFactor));
                    svg.style.transform = `scale(${{newScale}})`;
                    svg.style.transformOrigin = 'center';
                }});
            }}
        }});
    </script>
</body>
</html>"""

        filename = f"architecture-chart-{i+1}.html"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        html_files.append(filename)

    return html_files

def main():
    # 读取 ARCHITECTURE.md
    with open('ARCHITECTURE.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取 Mermaid 代码块
    mermaid_blocks = extract_mermaid_blocks(content)

    if not mermaid_blocks:
        print("❌ 未找到 Mermaid 代码块")
        return

    print(f"✅ 找到 {len(mermaid_blocks)} 个 Mermaid 图表")

    # 创建可视化 HTML 文件
    html_content = create_html_visualizer(mermaid_blocks)
    with open('architecture-visualizer.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    print("✅ 已创建 architecture-visualizer.html")

    # 创建单独的 HTML 文件
    html_files = create_standalone_images(mermaid_blocks)
    print(f"✅ 已创建 {len(html_files)} 个单独的图表文件")

    # 创建说明文件
    with open('EXPORT-README.txt', 'w', encoding='utf-8') as f:
        f.write("""Mermaid 图表导出说明
=====================

已生成的文件:
1. architecture-visualizer.html - 所有图表的可视化界面
   - 包含所有6个架构图表
   - 支持缩放、下载、深色模式
   - 直接在浏览器中打开使用

2. 单独的图表文件 (architecture-chart-1.html 到 architecture-chart-6.html)
   - 每个图表单独的HTML文件
   - 支持下载为PNG格式

使用方法:
1. 在浏览器中打开 architecture-visualizer.html
2. 使用页面上的按钮下载图表
3. 或右键图表选择"另存为图片"

图表列表:
1. 整体架构概览
2. 前端架构 (frontend-src/)
3. 后端架构 (backend/)
4. 数据流示意图
5. 组件依赖关系
6. 部署架构

注意事项:
- 需要网络连接以加载 Mermaid.js 库
- 下载PNG功能需要浏览器支持Canvas
- 建议使用 Chrome 或 Edge 浏览器以获得最佳效果

生成时间: 2026-03-08
项目版本: food-subscription-v01.1-backup
""")

    print("✅ 已创建 EXPORT-README.txt")
    print("\n🎉 导出完成！请打开 architecture-visualizer.html 查看图表。")

if __name__ == "__main__":
    main()