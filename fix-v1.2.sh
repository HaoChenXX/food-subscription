#!/bin/bash
#
# fix-v1.2.sh
# Ubuntu 服务器专用 - 修复文件换行符
# 使用方法: bash fix-v1.2.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  修复文件换行符 - v1.2${NC}"
echo -e "${BLUE}  CRLF -> LF${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 需要修复的文件列表
files=(
    "v1_2.sh"
    "backend/server.js"
    "backend/package.json"
)

# 添加目录下的所有 js 文件
files+=($(find backend/db -name "*.js" 2>/dev/null))
files+=($(find backend/middleware -name "*.js" 2>/dev/null))
files+=($(find backend/routes -name "*.js" 2>/dev/null))
files+=($(find backend/utils -name "*.js" 2>/dev/null))

fixed_count=0
skip_count=0
error_count=0

for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "  ${YELLOW}[跳过]${NC} 不存在: $file"
        continue
    fi
    
    # 检查是否包含 CRLF
    if ! grep -q $'\r' "$file" 2>/dev/null; then
        echo -e "  ${GREEN}[OK]${NC} 无需修复: $file"
        ((skip_count++))
        continue
    fi
    
    # 统计 CRLF 数量
    crlf_count=$(grep -o $'\r' "$file" | wc -l)
    
    # 修复换行符
    if sed -i 's/\r$//' "$file" 2>/dev/null; then
        echo -e "  ${YELLOW}[已修复]${NC} $file ($crlf_count 处 CRLF)"
        ((fixed_count++))
    else
        echo -e "  ${RED}[错误]${NC} $file"
        ((error_count++))
    fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  修复完成!${NC}"
echo -e "  修复: ${YELLOW}$fixed_count${NC} 个"
echo -e "  无需修复: ${GREEN}$skip_count${NC} 个"
echo -e "  失败: ${RED}$error_count${NC} 个"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "提示: 现在可以运行部署脚本:"
echo -e "      ${GREEN}sudo bash v1_2.sh${NC}"
echo ""
