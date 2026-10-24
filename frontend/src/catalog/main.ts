/**
 * DYF VIP Catalog SPA Entry Point (FE-019)
 * Mounts Vue 3 application with Hash Router, Access Store, and Mock Server.
 */

import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { initMocks } from '../mocks/init';

// Import design system tokens & catalog luxury styling
import '../../assets/css/admin.css';
import '../../assets/css/catalog.css';

async function bootstrap() {
  try {
    await initMocks();
  } catch (err) {
    console.warn('Mock server initialization skipped:', err);
  }

  const app = createApp(App);
  app.use(router);
  app.mount('#app');

  // Expose catalog test suite in development
  if (import.meta.env.DEV) {
    import('./__tests__/index')
      .then(({ runAllCatalogTests }) => {
        (window as unknown as { __runCatalogTests: typeof runAllCatalogTests }).__runCatalogTests = runAllCatalogTests;
      })
      .catch((err) => {
        console.warn('Failed to load catalog test suite:', err);
      });
  }
}

bootstrap();
