# 🎮 瀛州纪部署配置总结

## ✅ 已完成配置

### 1. 端口配置
- **原端口**: 3000
- **新端口**: 3106
- **修改文件**: `package.json`

### 2. 域名配置
- **域名**: immortal.matrixlab.work
- **协议**: HTTPS (Let's Encrypt SSL证书)
- **证书路径**: `/etc/letsencrypt/live/immortal.matrixlab.work/`
- **证书过期时间**: 2026-02-22 (自动续期)

### 3. Nginx 配置
- **配置文件**: `/etc/nginx/sites-available/immortal.matrixlab.work`
- **日志目录**: `/home/ubuntu/yz/Web3/游戏/瀛州纪v1.0/Web3-games/瀛州纪/logs/`
- **功能**:
  - HTTP 自动跳转 HTTPS
  - Gzip 压缩
  - WebSocket 支持 (Next.js HMR)
  - 安全头配置
  - 反向代理到本地 3106 端口

### 4. 启动脚本
- **开发模式**: `./start.sh` 或 `npm run dev`
- **生产模式**: `./start-prod.sh` 或 `npm run build && npm run start`

## 🌐 访问地址

- **线上访问**: https://immortal.matrixlab.work
- **本地访问**: http://localhost:3106

## 📝 使用说明

### 启动应用

**开发环境 (推荐用于开发调试):**
```bash
cd /home/ubuntu/yz/Web3/游戏/瀛州纪v1.0/Web3-games/瀛州纪
./start.sh
```

**生产环境 (推荐用于正式运行):**
```bash
cd /home/ubuntu/yz/Web3/游戏/瀛州纪v1.0/Web3-games/瀛州纪
./start-prod.sh
```

### 后台运行

使用 PM2 管理进程 (推荐):
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "yingzhou" -- run start

# 查看状态
pm2 status

# 查看日志
pm2 logs yingzhou

# 停止应用
pm2 stop yingzhou

# 重启应用
pm2 restart yingzhou

# 开机自启
pm2 startup
pm2 save
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 查看日志
tail -f /home/ubuntu/yz/Web3/游戏/瀛州纪v1.0/Web3-games/瀛州纪/logs/access.log
tail -f /home/ubuntu/yz/Web3/游戏/瀛州纪v1.0/Web3-games/瀛州纪/logs/error.log
```

### SSL 证书管理

```bash
# 查看证书信息
sudo certbot certificates

# 手动续期 (通常自动续期)
sudo certbot renew

# 测试续期
sudo certbot renew --dry-run
```

## 🔧 故障排查

### 1. 端口被占用
```bash
# 查看端口占用
lsof -i:3106

# 杀死进程
kill -9 <PID>
```

### 2. Nginx 配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 3. SSL 证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 强制续期
sudo certbot renew --force-renewal
```

### 4. 应用无法访问
```bash
# 检查应用是否运行
ps aux | grep node

# 检查端口监听
netstat -tlnp | grep 3106

# 检查 Nginx 状态
sudo systemctl status nginx

# 检查防火墙
sudo ufw status
```

## 📊 监控建议

1. **应用监控**: 使用 PM2 或其他进程管理工具
2. **日志监控**: 定期检查 Nginx 和应用日志
3. **性能监控**: 监控 CPU、内存、磁盘使用情况
4. **SSL 证书**: 设置证书过期提醒

## 🔒 安全建议

1. ✅ 已启用 HTTPS
2. ✅ 已配置安全头 (HSTS, X-Frame-Options 等)
3. ✅ 已启用 Gzip 压缩
4. ⚠️ 建议配置防火墙规则
5. ⚠️ 建议定期更新依赖包
6. ⚠️ 建议配置日志轮转

## 📞 联系信息

如有问题，请检查:
- 应用日志: `/home/ubuntu/yz/Web3/游戏/瀛州纪v1.0/Web3-games/瀛州纪/logs/`
- Nginx 日志: `/var/log/nginx/`
- Let's Encrypt 日志: `/var/log/letsencrypt/`
