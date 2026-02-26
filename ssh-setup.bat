@echo off
echo SSH连接优化配置脚本
echo =====================
echo.

:: 检查是否存在服务器信息
set /p server_ip="请输入服务器IP地址 (例如: 39.104.25.212): "
set /p server_user="请输入服务器用户名 (例如: root): "
set /p server_port="请输入SSH端口 (默认22): "
if "%server_port%"=="" set server_port=22

:: 备份现有SSH配置
echo 备份现有SSH配置...
copy "%USERPROFILE%\.ssh\config" "%USERPROFILE%\.ssh\config.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%" >nul 2>&1

:: 创建优化的SSH配置
echo 创建优化的SSH配置...
echo. >> "%USERPROFILE%\.ssh\config"
echo # 服务器连接配置 - %date% >> "%USERPROFILE%\.ssh\config"
echo Host myserver >> "%USERPROFILE%\.ssh\config"
echo   HostName %server_ip% >> "%USERPROFILE%\.ssh\config"
echo   User %server_user% >> "%USERPROFILE%\.ssh\config"
echo   Port %server_port% >> "%USERPROFILE%\.ssh\config"
echo   IdentityFile ~/.ssh/id_ed25519 >> "%USERPROFILE%\.ssh\config"
echo   IdentitiesOnly yes >> "%USERPROFILE%\.ssh\config"
echo   # 保持连接设置 >> "%USERPROFILE%\.ssh\config"
echo   ServerAliveInterval 60 >> "%USERPROFILE%\.ssh\config"
echo   ServerAliveCountMax 3 >> "%USERPROFILE%\.ssh\config"
echo   # 连接优化 >> "%USERPROFILE%\.ssh\config"
echo   TCPKeepAlive yes >> "%USERPROFILE%\.ssh\config"
echo   Compression yes >> "%USERPROFILE%\.ssh\config"
echo   CompressionLevel 6 >> "%USERPROFILE%\.ssh\config"
echo   # 其他优化 >> "%USERPROFILE%\.ssh\config"
echo   StrictHostKeyChecking no >> "%USERPROFILE%\.ssh\config"
echo   LogLevel ERROR >> "%USERPROFILE%\.ssh\config"

echo.
echo SSH配置已更新！
echo.
echo 请执行以下命令将公钥复制到服务器：
echo ssh-copy-id -i ~/.ssh/id_ed25519.pub %server_user%@%server_ip% -p %server_port%
echo.
echo 或者手动复制以下内容到服务器的 ~/.ssh/authorized_keys 文件中：
type "%USERPROFILE%\.ssh\id_ed25519.pub"
echo.
echo 连接命令：ssh myserver
echo 断开连接：exit
echo.
pause