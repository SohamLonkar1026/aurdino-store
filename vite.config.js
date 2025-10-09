import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true, // 0.0.0.0
    port: 5173,
    https: true, // self-signed cert for secure context (camera)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: false
      }
    }
  }
});
