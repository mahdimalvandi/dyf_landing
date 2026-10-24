/**
 * DYF Admin SPA Entry Point (FE-011)
 * Mounts Vue 3 application with Vue Router, Auth store, and mock server integration.
 */

import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { initMocks } from '../mocks/init';

// Import admin Design System v4 styles
import '../../assets/css/admin.css';

async function bootstrap() {
  // Initialize mock API interceptor in development if enabled
  try {
    await initMocks();
  } catch (err) {
    console.warn('Mock server initialization skipped:', err);
  }

  const app = createApp(App);
  app.use(router);
  app.mount('#app');

  // Expose admin test suite in development
  if (import.meta.env.DEV) {
    import('./__tests__/index')
      .then(({ runAllAdminTests }) => {
        (window as unknown as { __runAdminTests: typeof runAllAdminTests }).__runAdminTests = runAllAdminTests;
      })
      .catch((err) => {
        console.warn('Failed to load admin test suite:', err);
      });
  }
}

bootstrap();
