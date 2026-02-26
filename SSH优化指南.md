# SSH连接优化指南

## 🎯 目标
- 实现SSH免密码登录
- 防止连接频繁断开
- 简化连接流程

## 📋 步骤一：配置免密码登录

### 1. 检查本地SSH密钥
```bash
# 检查是否已有密钥
ls -la ~/.ssh/
# 应该看到 id_ed25519 和 id_ed25519.pub 文件
```

### 2. 复制公钥到服务器
```bash
# 方法1：使用ssh-copy-id（推荐）
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@39.104.25.212

# 方法2：手动复制
# 先查看公钥内容
cat ~/.ssh/id_ed25519.pub
# 然后登录服务器，将内容添加到 ~/.ssh/authorized_keys 文件末尾
```

### 3. 测试免密码登录
```bash
ssh root@39.104.25.212
# 如果不需要输入密码，说明配置成功
```

## 📋 步骤二：配置SSH防止断连

### 1. 修改本地SSH配置文件
编辑 `~/.ssh/config` 文件，添加以下内容：

```
# 服务器连接配置
Host food-server
    HostName 39.104.25.212
    User root
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

    # 保持连接设置
    ServerAliveInterval 60      # 每60秒发送keepalive包
    ServerAliveCountMax 3       # 最多尝试3次
    TCPKeepAlive yes           # 启用TCP keepalive

    # 连接优化
    Compression yes            # 启用压缩
    CompressionLevel 6         # 压缩级别

    # 其他设置
    StrictHostKeyChecking no   # 自动接受主机密钥（已知服务器时安全）
    LogLevel ERROR             # 只显示错误日志
```

### 2. 服务器端配置（可选但推荐）
登录服务器后，编辑 `/etc/ssh/sshd_config`：

```bash
# 编辑sshd_config
sudo nano /etc/ssh/sshd_config

# 添加或修改以下配置
ClientAliveInterval 60      # 每60秒向客户端发送keepalive
ClientAliveCountMax 3       # 最多尝试3次
TCPKeepAlive yes            # 启用TCP keepalive

# 重启SSH服务
sudo systemctl restart sshd
```

## 📋 步骤三：使用连接管理工具

### 1. 安装tmux或screen（推荐tmux）
```bash
# 在服务器上安装tmux
sudo apt-get install tmux  # Ubuntu/Debian
# 或
sudo yum install tmux      # CentOS/RHEL
```

### 2. 创建tmux会话
```bash
# 创建名为work的会话
tmux new -s work

# 常用快捷键（在tmux会话中）
# Ctrl+B, D - 断开会话（保持运行）
# Ctrl+B, C - 创建新窗口
# Ctrl+B, 0-9 - 切换窗口
# Ctrl+B, " - 水平分割窗口
# Ctrl+B, % - 垂直分割窗口
```

### 3. 重新连接会话
```bash
# 查看所有会话
tmux ls

# 重新连接work会话
tmux attach -t work
```

## 📋 步骤四：快捷连接脚本

### 1. 创建连接脚本
创建文件 `connect-server.bat`（Windows）或 `connect-server.sh`（Linux/Mac）：

**Windows版本（connect-server.bat）：**
```batch
@echo off
echo 正在连接到服务器...
ssh food-server
echo 连接已断开
pause
```

**Linux/Mac版本（connect-server.sh）：**
```bash
#!/bin/bash
echo "正在连接到服务器..."
ssh food-server
echo "连接已断开"
```

### 2. 赋予执行权限（Linux/Mac）
```bash
chmod +x connect-server.sh
```

## 📋 步骤五：VS Code远程开发（可选）

### 1. 安装Remote-SSH插件
在VS Code中安装 "Remote - SSH" 扩展

### 2. 配置连接
按 `F1` → 输入 "Remote-SSH: Connect to Host..." → 选择 "Add New SSH Host..." → 输入：`ssh food-server`

### 3. 开始远程开发
连接成功后，可以直接在VS Code中编辑服务器上的文件

## 🔧 故障排查

### 1. 连接仍然断开？
- 检查网络稳定性
- 增加keepalive间隔：将 `ServerAliveInterval` 改为 30
- 检查服务器防火墙设置

### 2. 免密码登录失败？
- 检查公钥是否正确复制到服务器
- 检查文件权限：
  ```bash
  # 服务器上执行
  chmod 700 ~/.ssh
  chmod 600 ~/.ssh/authorized_keys
  ```

### 3. 连接超时？
- 检查服务器SSH端口是否开放
- 检查本地防火墙设置
- 尝试使用 `-vvv` 参数查看详细调试信息：
  ```bash
  ssh -vvv food-server
  ```

## 🚀 一键配置脚本

运行之前创建的 `ssh-setup.bat` 文件，按提示输入服务器信息即可自动完成配置。

## 📱 连接命令速查

```bash
# 基本连接
ssh food-server

# 直接执行命令
ssh food-server "ls -la /var/www"

# 文件传输 - 上传
scp local-file.txt food-server:/path/to/destination

# 文件传输 - 下载
scp food-server:/path/to/file.txt ./local-destination/

# 带端口连接
ssh -p 2222 food-server
```

配置完成后，你只需要记住一个命令：`ssh food-server`，就能稳定连接到你的服务器了！