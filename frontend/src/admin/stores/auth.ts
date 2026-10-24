/**
 * DYF Admin — Auth Store
 * Lightweight, reactive authentication state manager using Vue 3 Composition API.
 * Synchronizes with ApiClient and LocalStorage TokenManager.
 */

import { reactive, computed } from 'vue';
import { authService, tokenManager } from '@/shared/api/services';
import type { AdminProfileResponse } from '@/shared/api/types';

interface AuthState {
  token: string | null;
  admin: AdminProfileResponse | null;
  isLoading: boolean;
  error: string | null;
}

const state = reactive<AuthState>({
  token: tokenManager.getToken(),
  admin: null,
  isLoading: false,
  error: null,
});

export function useAuthStore() {
  const isAuthenticated = computed(() => Boolean(state.token));
  const adminUser = computed(() => state.admin);
  const isLoading = computed(() => state.isLoading);
  const authError = computed(() => state.error);

  /**
   * Initializes auth state from stored token or retrieves current admin profile
   */
  async function checkAuth(): Promise<boolean> {
    const token = tokenManager.getToken();
    if (!token) {
      state.token = null;
      state.admin = null;
      return false;
    }

    state.token = token;
    try {
      state.isLoading = true;
      const res = await authService.getMe();
      if (res.success && res.data) {
        state.admin = res.data;
        return true;
      }
      logout();
      return false;
    } catch (err) {
      // 401 or invalid token
      logout();
      return false;
    } finally {
      state.isLoading = false;
    }
  }

  /**
   * Verifies OTP code and authenticates the administrator
   */
  async function verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
    state.isLoading = true;
    state.error = null;
    try {
      const res = await authService.verifyOtp(phoneNumber, code);
      if (res.success && res.data) {
        state.token = res.data.token;
        state.admin = res.data.admin;
        tokenManager.setToken(res.data.token);
        return true;
      }
      state.error = res.message || 'کد تایید نامعتبر است';
      return false;
    } catch (err: any) {
      state.error = err.message || 'خطا در تایید کد یکبارمصرف';
      return false;
    } finally {
      state.isLoading = false;
    }
  }

  /**
   * Clears session and redirects to login
   */
  async function logout(): Promise<void> {
    try {
      if (state.token) {
        await authService.logout().catch(() => {});
      }
    } finally {
      state.token = null;
      state.admin = null;
      state.error = null;
      tokenManager.clearToken();
    }
  }

  function setAdmin(admin: AdminProfileResponse) {
    state.admin = admin;
  }

  return {
    state,
    isAuthenticated,
    adminUser,
    isLoading,
    authError,
    checkAuth,
    verifyOtp,
    logout,
    setAdmin,
  };
}
