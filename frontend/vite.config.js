import { resolve } from 'path';
import { cpSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'catalog-runtime-images',
      writeBundle() {
        cpSync(resolve(__dirname, 'assets/images'), resolve(__dirname, 'dist/assets/images'), { recursive: true });
      },
    },
    {
      name: 'clean-catalog-urls',
      configureServer(server) {
        if (server.httpServer) {
          server.httpServer.keepAliveTimeout = 65000;
          server.httpServer.headersTimeout = 66000;
        }
        server.middlewares.use((req, res, next) => {
          if (req.headers['proxy-connection'] && !req.headers['connection']) {
            req.headers['connection'] = req.headers['proxy-connection'];
          }
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('Keep-Alive', 'timeout=65');

          const [pathname, search] = req.url.split('?');
          if (/^\/catalog\/[^/]+\/?$/.test(pathname)) {
            req.url = '/catalog/?token=' + encodeURIComponent(pathname.split('/')[2]);
          }
          if (pathname === '/catalog' || pathname === '/catalog.html') {
            req.url = '/catalog/' + (search ? '?' + search : '');
          }
          if (pathname === '/admin' || pathname === '/admin.html') {
            req.url = '/admin/' + (search ? '?' + search : '');
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const [pathname, search] = req.url.split('?');
          if (/^\/catalog\/[^/]+\/?$/.test(pathname)) {
            req.url = '/catalog/?token=' + encodeURIComponent(pathname.split('/')[2]);
          }
          if (pathname === '/catalog' || pathname === '/catalog.html') {
            req.url = '/catalog/' + (search ? '?' + search : '');
          }
          if (pathname === '/admin' || pathname === '/admin.html') {
            req.url = '/admin/' + (search ? '?' + search : '');
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        catalog: resolve(__dirname, 'catalog/index.html'),
      },
    },
  },
});
