import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || './',
  server: { port: 4176, strictPort: true },
  preview: { port: 4176, strictPort: true },
  build: { target: 'es2022', assetsInlineLimit: 0 },
});
