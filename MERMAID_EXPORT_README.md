# Mermaid 架构图表导出说明

## 概述

本文档说明如何查看和导出 `ARCHITECTURE.md` 中的 Mermaid 架构图表。已生成多个文件，支持不同的使用场景。

## 已生成的文件

### 1. 交互式 HTML 查看器
**文件**: `architecture-charts.html`

**特点**:
- 包含所有 6 个架构图表
- 使用 Mermaid.js 动态渲染
- 支持鼠标滚轮缩放
- 右键可保存为 SVG 格式

**使用方法**:
1. 用浏览器打开 `architecture-charts.html`
2. 图表会自动渲染
3. 使用鼠标滚轮缩放图表
4. 右键图表选择"另存为图片"保存为 SVG

**优点**:
- 交互式，可缩放查看细节
- 图表清晰，矢量格式
- 无需安装任何软件

**缺点**:
- 需要网络连接加载 Mermaid.js 库
- 保存为 PNG 需要截图工具

### 2. 架构文档
**文件**: `ARCHITECTURE.md`

**内容**:
- 完整的架构说明文档
- 包含 Mermaid 源代码
- 可直接在支持 Mermaid 的编辑器中查看（如 VS Code、GitHub、GitLab）

### 3. 使用说明文件
**文件**: `README-CHARTS.txt`

**内容**: 简单的使用说明

## 图表列表

1. **整体架构概览** - 用户端、后端服务和部署环境关系
2. **前端架构** - React 19 + TypeScript 分层结构
3. **后端架构** - Node.js + Express + MySQL 分层结构
4. **数据流示意图** - 用户交互完整流程
5. **组件依赖关系** - 前后端技术栈依赖
6. **部署架构** - 生产环境和开发环境对比

## 导出为图片的方法

### 方法 1: 从 HTML 文件保存 (推荐)
1. 打开 `architecture-charts.html`
2. 找到要保存的图表
3. 右键图表选择"另存为图片"
4. 选择保存位置和文件名（保存为 SVG 格式）

### 方法 2: 使用截图工具
1. 打开 `architecture-charts.html`
2. 调整图表到合适大小
3. 使用系统截图工具（如 Windows 的 Snipping Tool）
4. 截取图表区域并保存为 PNG/JPG

### 方法 3: 使用在线转换服务
1. 打开 `ARCHITECTURE.md`
2. 复制要转换的 Mermaid 代码块（````mermaid` 到 ```` 之间的内容）
3. 访问 [Mermaid Live Editor](https://mermaid.live/)
4. 粘贴代码并调整
5. 导出为 PNG/SVG

### 方法 4: 使用 mermaid-cli (高级)
如果需要批量生成 PNG 图片，可使用 mermaid-cli:

```bash
# 安装 mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# 转换单个图表 (需先将 Mermaid 代码保存到文件)
mmdc -i chart.mmd -o chart.png

# 更多选项
mmdc -i chart.mmd -o chart.png -w 2000 -H 1500 -t dark
```

## 开发人员选项

### 修改图表
要修改图表，请编辑 `ARCHITECTURE.md` 中的 Mermaid 代码，然后重新生成 HTML 文件：

```bash
python export_mermaid_simple.py
```

### 自定义样式
图表样式可通过修改 `export_mermaid_simple.py` 中的 CSS 进行调整，或直接编辑生成的 HTML 文件。

## 故障排除

### 问题 1: 图表不显示
**可能原因**: 网络问题导致 Mermaid.js 加载失败
**解决方案**:
- 检查网络连接
- 刷新页面
- 使用离线版本的 Mermaid.js

### 问题 2: 保存的图片模糊
**可能原因**: 保存为位图格式（如 PNG）时分辨率不足
**解决方案**:
- 保存为 SVG 格式（矢量图）
- 或使用高分辨率截图

### 问题 3: 图表内容被截断
**可能原因**: 图表太大，显示区域不足
**解决方案**:
- 使用鼠标滚轮缩小图表
- 调整浏览器缩放级别
- 保存为 SVG 后在其他软件中查看

## 技术细节

### 使用的工具
- **Mermaid.js**: 10.0+ (通过 CDN 加载)
- **Python**: 用于提取代码块和生成 HTML
- **HTML/CSS**: 页面布局和样式

### 文件编码
所有文件使用 UTF-8 编码，支持中文字符。

### 浏览器兼容性
- Chrome 90+ (推荐)
- Edge 90+
- Firefox 88+
- Safari 14+

## 相关资源

- [Mermaid 官方文档](https://mermaid-js.github.io/mermaid/)
- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli)

## 项目信息

- **项目名称**: 食材包订阅平台
- **版本**: food-subscription-v01.1-backup
- **生成时间**: 2026-03-08
- **架构文档**: `ARCHITECTURE.md`
- **图表查看器**: `architecture-charts.html`

---

*如需进一步帮助，请参考项目文档或联系开发人员。*