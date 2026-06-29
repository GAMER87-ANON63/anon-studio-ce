import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/anon-studio-ce/',
  server: {
    port: 1420,
    strictPort: true,
  }
});
