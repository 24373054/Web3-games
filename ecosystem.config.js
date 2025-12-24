// PM2 配置文件
module.exports = {
  apps: [{
    name: 'yingzhou-immortal',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/yz/Web3/游戏/瀛州纪v1.0/Web3-games/瀛州纪',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3106
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
}
