import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/uploads': 'http://localhost:3000',
      '/admin/': 'http://localhost:3000', // /admin/... only (not GET /admin doc)
      '/games': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/wallet': 'http://localhost:3000',
      '/cinemoji': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/posts': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
});
