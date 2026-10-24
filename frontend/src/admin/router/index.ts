/**
 * DYF Admin — Vue Router Configuration (FE-011)
 * Hash-based routing to seamlessly match multi-page setup (#dashboard, #shoes, etc.),
 * complete with navigation guards and breadcrumb metadata.
 */

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { tokenManager } from '@/shared/api/services';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/AuthView.vue'),
    meta: {
      requiresAuth: false,
      title: 'ورود به پنل مدیریت',
    },
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: {
          title: 'داشبورد',
          breadcrumb: 'داشبورد',
        },
      },
      {
        path: 'shoes',
        name: 'shoes',
        component: () => import('../views/ShoesView.vue'),
        meta: {
          title: 'مدل‌های کفش',
          breadcrumb: 'مدل‌های کفش',
        },
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('../views/CategoriesView.vue'),
        meta: {
          title: 'دسته‌بندی‌ها',
          breadcrumb: 'دسته‌بندی‌ها',
        },
      },
      {
        path: 'customers',
        name: 'customers',
        component: () => import('../views/CustomersView.vue'),
        meta: {
          title: 'مشتریان و بنکداران',
          breadcrumb: 'مشتریان و بنکداران',
        },
      },
      {
        path: 'access-links',
        name: 'access-links',
        component: () => import('../views/AccessLinksView.vue'),
        meta: {
          title: 'لینک‌های اختصاصی',
          breadcrumb: 'لینک‌های اختصاصی',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// Navigation Guard: Route protection & document title
router.beforeEach((to, _from, next) => {
  const token = tokenManager.getToken();
  const requiresAuth = to.meta.requiresAuth !== false;

  if (to.meta.title) {
    document.title = `${to.meta.title} | پنل مدیریت کاتالوگ DYF`;
  }

  if (requiresAuth && !token) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.name === 'login' && token) {
    return next({ name: 'dashboard' });
  }

  next();
});
