import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { API_BASE_URL } from './src/config/apiConfig'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 8080,
    historyApiFallback: true,
    proxy: {
      '/api': {
        // 开发环境中，将API请求代理到真实后端服务器
        target: 'https://',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          // 添加错误处理
          proxy.on('error', (err, req, res) => {
            console.error('代理错误:', err);
          });
        }
      }
    },
    hmr: { overlay: true },
  },
  preview: {
    port: 8181
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': '/src'
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
})
