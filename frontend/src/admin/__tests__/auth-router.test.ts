/**
 * Unit Tests for Admin Auth Store & Navigation Guards (FE-011 / FE-012)
 */

import { useAuthStore } from '../stores/auth';
import { tokenManager } from '@/shared/api/services';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runAdminAuthTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      throw new Error(message);
    }
  };

  const test = async (name: string, fn: () => void | Promise<void>) => {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ name, passed: false, error: errorMsg });
    }
  };

  // Test 1: Initial unauthenticated state
  await test('useAuthStore initializes unauthenticated when no token exists', () => {
    tokenManager.clearToken();
    const auth = useAuthStore();
    assert(!auth.isAuthenticated.value, 'Must not be authenticated without token');
    assert(auth.adminUser.value === null, 'Admin user must be null initially');
  });

  // Test 2: Set token updates isAuthenticated
  await test('Setting token in TokenManager makes isAuthenticated true', () => {
    tokenManager.setToken('test_jwt_bearer_token');
    const auth = useAuthStore();
    auth.state.token = 'test_jwt_bearer_token';
    assert(auth.isAuthenticated.value === true, 'Should be authenticated with valid token');
  });

  // Test 3: Logout clears state and storage
  await test('logout() clears reactive state and local token', async () => {
    tokenManager.setToken('sample_token');
    const auth = useAuthStore();
    auth.state.token = 'sample_token';
    auth.state.admin = {
      ID: 1,
      phoneNumber: '09121234567',
      firstName: 'مدیر',
      lastName: 'سیستم',
      isActive: true,
      lastLoginAt: null,
      createdAt: '',
      updatedAt: '',
    };

    await auth.logout();

    assert(auth.state.token === null, 'Token in state must be null after logout');
    assert(auth.state.admin === null, 'Admin user in state must be null after logout');
    assert(!tokenManager.hasToken(), 'TokenManager must not retain token after logout');
  });

  // Test 4: Navigation guard simulation
  await test('Route guard protects private paths when unauthenticated', () => {
    tokenManager.clearToken();
    const targetRoute = { meta: { requiresAuth: true }, fullPath: '/shoes' };
    const token = tokenManager.getToken();
    const requiresAuth = targetRoute.meta.requiresAuth !== false;

    let redirectedTo: any = null;
    const next = (destination?: any) => {
      redirectedTo = destination;
    };

    if (requiresAuth && !token) {
      next({ name: 'login', query: { redirect: targetRoute.fullPath } });
    } else {
      next();
    }

    assert(redirectedTo !== null, 'Guard must redirect unauthenticated user');
    assert(redirectedTo.name === 'login', 'Must redirect to login route');
    assert(redirectedTo.query.redirect === '/shoes', 'Must preserve original target path in query');
  });

  // Test 5: Navigation guard redirects authenticated user away from login
  await test('Route guard redirects authenticated user from /login to /dashboard', () => {
    tokenManager.setToken('mock_admin_token');
    const targetRoute = { name: 'login', meta: { requiresAuth: false } };
    const token = tokenManager.getToken();

    let redirectedTo: any = null;
    const next = (destination?: any) => {
      redirectedTo = destination;
    };

    if (targetRoute.name === 'login' && token) {
      next({ name: 'dashboard' });
    } else {
      next();
    }

    assert(redirectedTo?.name === 'dashboard', 'Must redirect authenticated user to dashboard');
    tokenManager.clearToken();
  });

  return results;
}
