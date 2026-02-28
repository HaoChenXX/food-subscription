#!/bin/bash
#
# 食材订阅平台项目清理脚本
# 清理不必要的文件，减小项目体积
# 使用方法: bash cleanup-project.sh [--dry-run] [--force]
#
# 选项:
#   --dry-run  只显示将要删除的文件，不实际删除
#   --force    直接删除文件，不询问确认
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 初始化变量
DRY_RUN=false
FORCE=false
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            echo "使用方法: bash $0 [--dry-run] [--force]"
            exit 1
            ;;
    esac
done

# 显示标题
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  食材订阅平台项目清理脚本${NC}"
echo -e "${BLUE}  项目目录: $PROJECT_ROOT${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}  模式: 干运行（只显示不删除）${NC}"
fi
echo -e "${BLUE}========================================${NC}"
echo ""

# 定义要删除的文件列表
declare -a FILES_TO_DELETE=(
    # 备份文件
    "backend/db/init-mysql.js.backup"

    # 临时文件和测试文件
    "food-subscription-v1.1.zip"
    "my-app@0.0.0"
    "test_ssh.txt"

    # 依赖锁定文件（已在.gitignore中）
    "backend/package-lock.json"
    "frontend-src/package-lock.json"
    "backend/yarn.lock"
    "frontend-src/yarn.lock"

    # 旧文档文件（可选择性删除）
    "README-v1.2.md"
    "CHANGELOG-v1.2.md"

    # 重复logo文件（保留logo-512.png和logo-128.png）
    "logo.png"
    "logo-256.png"
    "logo-optimized.png"
)

# 定义要删除的脚本文件（需要用户确认）
declare -a SCRIPTS_TO_DELETE=(
    # 重复的部署脚本（保留deploy.sh）
    "deploy-v1.1.sh"

    # 重复的行尾修复脚本（保留fix-line-endings.py）
    "fix-line-endings-v1.1.py"

    # 重复的v1.2修复脚本（建议保留fix-v1.2.py，因为它跨平台）
    "fix-v1.2.ps1"    # Windows PowerShell脚本
    "fix-v1.2.sh"     # Linux shell脚本（保留.py版本）
)

# 定义要清理的目录（构建产物和依赖）
declare -a DIRS_TO_CLEAN=(
    "frontend/dist"
    "frontend-src/dist"
    "backend/node_modules"
    "frontend-src/node_modules"
)

# 函数：检查文件是否存在并统计大小
check_files() {
    local total_size=0
    local count=0

    echo -e "${BLUE}扫描要删除的文件...${NC}"
    echo ""

    # 检查普通文件
    echo -e "${YELLOW}1. 将要删除的普通文件:${NC}"
    for file in "${FILES_TO_DELETE[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            local size=$(stat -f%z "$PROJECT_ROOT/$file" 2>/dev/null || stat -c%s "$PROJECT_ROOT/$file" 2>/dev/null || echo "0")
            total_size=$((total_size + size))
            count=$((count + 1))
            echo "   - $file ($((size/1024)) KB)"
        fi
    done

    # 检查脚本文件
    echo ""
    echo -e "${YELLOW}2. 将要删除的脚本文件（需要确认）:${NC}"
    for file in "${SCRIPTS_TO_DELETE[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            local size=$(stat -f%z "$PROJECT_ROOT/$file" 2>/dev/null || stat -c%s "$PROJECT_ROOT/$file" 2>/dev/null || echo "0")
            total_size=$((total_size + size))
            count=$((count + 1))
            echo "   - $file ($((size/1024)) KB)"
        fi
    done

    # 检查目录
    echo ""
    echo -e "${YELLOW}3. 将要清理的目录:${NC}"
    for dir in "${DIRS_TO_CLEAN[@]}"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            local dir_size=$(du -sk "$PROJECT_ROOT/$dir" 2>/dev/null | cut -f1 || echo "0")
            total_size=$((total_size + dir_size * 1024))
            count=$((count + 1))
            echo "   - $dir ($((dir_size)) KB)"
        fi
    done

    echo ""
    if [ $count -eq 0 ]; then
        echo -e "${GREEN}没有找到要清理的文件。${NC}"
        exit 0
    else
        local total_mb=$((total_size / 1024 / 1024))
        local total_kb=$((total_size / 1024))
        if [ $total_mb -gt 0 ]; then
            echo -e "${GREEN}总计: $count 个文件/目录，约 ${total_mb} MB${NC}"
        else
            echo -e "${GREEN}总计: $count 个文件/目录，约 ${total_kb} KB${NC}"
        fi
    fi
}

# 函数：删除文件
delete_file() {
    local file="$1"
    local type="$2"

    if [ -e "$PROJECT_ROOT/$file" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[干运行] 删除: $file${NC}"
        else
            echo -e "${RED}删除: $file${NC}"
            if [ "$type" = "dir" ]; then
                rm -rf "$PROJECT_ROOT/$file"
            else
                rm -f "$PROJECT_ROOT/$file"
            fi
        fi
    fi
}

# 函数：询问确认
ask_confirmation() {
    if [ "$FORCE" = true ]; then
        return 0
    fi

    echo ""
    read -p "是否继续删除文件？(y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}操作已取消。${NC}"
        exit 0
    fi
}

# 函数：询问脚本删除确认
ask_script_confirmation() {
    if [ "$FORCE" = true ]; then
        return 0
    fi

    echo ""
    echo -e "${YELLOW}注意：以下脚本文件将被删除：${NC}"
    for file in "${SCRIPTS_TO_DELETE[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            echo "  - $file"
        fi
    done
    echo ""
    echo -e "${YELLOW}请确认是否删除这些脚本文件：${NC}"
    echo "  1. deploy-v1.1.sh 是 deploy.sh 的旧版本"
    echo "  2. fix-line-endings-v1.1.py 是 fix-line-endings.py 的旧版本"
    echo "  3. fix-v1.2.ps1 和 fix-v1.2.sh 是 fix-v1.2.py 的重复版本"
    echo ""
    read -p "是否删除这些脚本文件？(y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}跳过脚本文件删除。${NC}"
        return 1
    fi
    return 0
}

# 函数：询问目录清理确认
ask_dir_confirmation() {
    if [ "$FORCE" = true ]; then
        return 0
    fi

    echo ""
    echo -e "${YELLOW}注意：以下目录将被清理：${NC}"
    for dir in "${DIRS_TO_CLEAN[@]}"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            echo "  - $dir"
        fi
    done
    echo ""
    echo -e "${YELLOW}警告：这些目录包含构建产物和依赖，删除后可能需要重新安装。${NC}"
    read -p "是否清理这些目录？(y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}跳过目录清理。${NC}"
        return 1
    fi
    return 0
}

# 主执行流程

# 1. 检查文件
check_files

# 2. 询问总体确认
ask_confirmation

# 3. 删除普通文件
echo ""
echo -e "${BLUE}删除普通文件...${NC}"
for file in "${FILES_TO_DELETE[@]}"; do
    delete_file "$file" "file"
done

# 4. 询问脚本文件删除确认并删除
if ask_script_confirmation; then
    echo ""
    echo -e "${BLUE}删除脚本文件...${NC}"
    for file in "${SCRIPTS_TO_DELETE[@]}"; do
        delete_file "$file" "file"
    done
fi

# 5. 询问目录清理确认并清理
if ask_dir_confirmation; then
    echo ""
    echo -e "${BLUE}清理目录...${NC}"
    for dir in "${DIRS_TO_CLEAN[@]}"; do
        delete_file "$dir" "dir"
    done
fi

# 6. 显示结果
echo ""
echo -e "${GREEN}========================================${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${GREEN}  干运行完成${NC}"
    echo -e "${GREEN}  查看上述文件列表，使用 'bash $0 --force' 实际删除${NC}"
else
    echo -e "${GREEN}  清理完成！${NC}"
fi
echo -e "${GREEN}========================================${NC}"

# 7. 建议更新.gitignore
echo ""
echo -e "${YELLOW}建议更新 .gitignore 文件，包含以下内容：${NC}"
cat << 'EOF'
# 构建产物
frontend/dist/
frontend-src/dist/

# 依赖目录
node_modules/
*/node_modules/

# 备份文件
*.backup
*.bak
*.old

# 临时文件
*.zip
*.tmp
*.log

# 系统文件
.DS_Store
Thumbs.db
EOF