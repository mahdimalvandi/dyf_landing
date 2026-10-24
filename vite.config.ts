import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import fs from 'node:fs';

const rootDir = import.meta.dirname;

function copyStaticAssets(): Plugin {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const distDir = resolve(rootDir, 'dist');
      // Copy models to dist/assets/models for <model-viewer>
      const modelsSrc = resolve(rootDir, 'frontend/assets/models');
      const modelsDest = resolve(distDir, 'assets/models');
      if (fs.existsSync(modelsSrc)) {
        fs.mkdirSync(modelsDest, { recursive: true });
        fs.cpSync(modelsSrc, modelsDest, { recursive: true });
      }

      // Copy raw images to dist/assets/images for runtime JS string references
      const imagesSrc = resolve(rootDir, 'frontend/assets/images');
      const imagesDest = resolve(distDir, 'assets/images');
      if (fs.existsSync(imagesSrc)) {
        fs.mkdirSync(imagesDest, { recursive: true });
        fs.cpSync(imagesSrc, imagesDest, { recursive: true });
      }

      // Copy local fonts to dist/assets/fonts for standalone runtime font access
      const fontsSrc = resolve(rootDir, 'frontend/assets/fonts');
      const fontsDest = resolve(distDir, 'assets/fonts');
      if (fs.existsSync(fontsSrc)) {
        fs.mkdirSync(fontsDest, { recursive: true });
        fs.cpSync(fontsSrc, fontsDest, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  root: 'frontend',
  base: '/',
  resolve: {
    alias: {
      '@': resolve(rootDir, 'frontend/src'),
      '@shared': resolve(rootDir, 'frontend/src/shared'),
      '@admin': resolve(rootDir, 'frontend/src/admin'),
      '@catalog': resolve(rootDir, 'frontend/src/catalog'),
    },
  },
  plugins: [
    vue(),
    copyStaticAssets(),
  ],
  build: {
    outDir: resolve(rootDir, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'frontend/index.html'),
        admin: resolve(rootDir, 'frontend/admin.html'),
        catalog: resolve(rootDir, 'frontend/catalog.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
