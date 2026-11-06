import { defineConfig } from 'vite';
import { offlineBook } from './build/offline-book-plugin.ts';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || './',
  plugins: [offlineBook()],
  server: { port: 4178, strictPort: true },
  preview: { port: 4178, strictPort: true },
  build: { target: 'es2022', assetsInlineLimit: 0 },
});
