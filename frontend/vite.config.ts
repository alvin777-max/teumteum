import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // 개발 중 /api 요청을 스프링 서버(8080)로 넘겨 CORS 설정 없이 연동
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
