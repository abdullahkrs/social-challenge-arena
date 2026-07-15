import { defineConfig } from 'vite';

export default defineConfig({
  base: '/social-challenge-arena/',
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 1800
  }
});
