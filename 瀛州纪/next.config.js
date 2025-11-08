/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 关闭严格模式以支持 Babylon.js
  
  // 开发环境配置
  ...(process.env.NODE_ENV === 'development' && {
    // 开发模式下允许所有必要的权限
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
            },
          ],
        },
      ]
    },
  }),

  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false, 
      net: false, 
      tls: false 
    };
    
    // 确保 Babylon.js 正确加载
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // 禁用压缩中的某些功能以支持 Babylon.js
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false, // 开发环境不压缩
      };
    }
    
    return config;
  },
  
  // 关闭某些优化以支持动态导入
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig

