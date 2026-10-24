/**
 * DYF VIP Catalog — Vue Router Configuration (FE-019)
 * Hash history routing with access verification guards.
 */

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { useCatalogAccessStore } from '../stores/access';
import CatalogGateView from '../views/CatalogGateView.vue';
import CatalogGridView from '../views/CatalogGridView.vue';
import CatalogExpiredView from '../views/CatalogExpiredView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const accessStore = useCatalogAccessStore();
      if (accessStore.isAuthenticated.value) {
        return '/grid';
      }
      return '/gate';
    },
  },
  {
    path: '/gate',
    name: 'catalog-gate',
    component: CatalogGateView,
    meta: { title: 'ورود به کاتالوگ خصوصی | برند DYF' },
  },
  {
    path: '/grid',
    name: 'catalog-grid',
    component: CatalogGridView,
    meta: { requiresAuth: true, title: 'کلکسیون اختصاصی کفش | برند DYF' },
  },
  {
    path: '/expired',
    name: 'catalog-expired',
    component: CatalogExpiredView,
    meta: { title: 'پایان زمان دسترسی | برند DYF' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/gate',
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  const accessStore = useCatalogAccessStore();

  // If session expired, always redirect to expired screen unless already there or at gate
  if (accessStore.status.value === 'EXPIRED' && to.name !== 'catalog-expired' && to.name !== 'catalog-gate') {
    next({ name: 'catalog-expired' });
    return;
  }

  // Guard for protected catalog view
  if (to.meta.requiresAuth && !accessStore.isAuthenticated.value) {
    next({ name: 'catalog-gate', query: to.query });
    return;
  }

  next();
});
