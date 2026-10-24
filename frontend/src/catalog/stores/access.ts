/**
 * DYF VIP Catalog — Access & Session Store (FE-019)
 * Manages link verification, token extraction, customer authentication,
 * session countdown timer, and security state transitions.
 */

import { ref, computed } from 'vue';
import { catalogService } from '@/shared/api/services';
import { catalogTokenManager } from '@/shared/api/storage';
import type { CatalogAccessResponse, LinkAuthMethod } from '@/shared/api/types';

export type CatalogAccessStatus =
  | 'IDLE'           // Initial state before token verification
  | 'VERIFYING'      // API check in-flight
  | 'REQUIRES_OTP'   // Valid token, requires phone + SMS verification (FE-020)
  | 'REQUIRES_PHONE' // No link token provided, allows partner phone OTP login
  | 'GRANTED'        // Access permitted, session active
  | 'INVALID'        // Token not found, malformed, or invalid
  | 'INACTIVE'       // Link deactivated by admin (403)
  | 'EXPIRED';       // Link viewing window or start deadline expired (410)

const SESSION_STORAGE_KEY = 'dyf_catalog_vip_session';

export interface StoredCatalogSession {
  token: string;
  recipientName: string;
  authMethod: LinkAuthMethod;
  linkID: number;
  viewingExpiresAt: number;
  remainingSeconds: number;
  savedAt: number;
}

// Reactive store singleton state
const token = ref<string>('');
const status = ref<CatalogAccessStatus>('IDLE');
const recipientName = ref<string>('');
const authMethod = ref<LinkAuthMethod>('DIRECT');
const linkID = ref<number | null>(null);
const shoesCount = ref<number>(0);
const firstViewedAt = ref<number>(0);
const viewingExpiresAt = ref<number>(0);
const remainingSeconds = ref<number>(0);
const errorTitle = ref<string>('');
const errorMessage = ref<string>('');
const isLoading = ref<boolean>(false);

let timerInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Extract token from window location search or hash query
 */
export function extractTokenFromUrl(): string {
  if (typeof window === 'undefined') return '';

  // 1. Check window.location.search (?token=...)
  const searchParams = new URLSearchParams(window.location.search);
  const searchToken = searchParams.get('token');
  if (searchToken) {
    return searchToken.trim();
  }

  // 2. Check window.location.hash (e.g., #/gate?token=... or #/?token=...)
  const hash = window.location.hash || '';
  const hashQueryIdx = hash.indexOf('?');
  if (hashQueryIdx !== -1) {
    const hashParams = new URLSearchParams(hash.slice(hashQueryIdx));
    const hashToken = hashParams.get('token');
    if (hashToken) {
      return hashToken.trim();
    }
  }

  // 3. Fallback: direct path segment if rewritten e.g. /catalog/:token
  const pathMatch = window.location.pathname.match(/\/catalog\/([a-zA-Z0-9_-]{6,64})/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1].trim();
  }

  return '';
}

/**
 * Validate token format (alphanumeric hex or slug, 6-128 chars)
 */
export function isValidTokenFormat(rawToken: string): boolean {
  if (!rawToken || typeof rawToken !== 'string') return false;
  const clean = rawToken.trim();
  return /^[a-zA-Z0-9_-]{6,128}$/.test(clean);
}

/**
 * Format remaining seconds into MM:SS or HH:MM:SS
 */
export function formatSecondsToTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function useCatalogAccessStore() {
  const isAuthenticated = computed(() => status.value === 'GRANTED');
  const hasError = computed(() => ['INVALID', 'INACTIVE', 'EXPIRED'].includes(status.value));
  const isDirect = computed(() => authMethod.value === 'DIRECT');
  const formattedTimer = computed(() => formatSecondsToTime(remainingSeconds.value));

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startTimer(initialSeconds: number) {
    stopTimer();
    remainingSeconds.value = Math.max(0, initialSeconds);

    if (remainingSeconds.value <= 0) {
      expire('مدت زمان مجاز برای مشاهده این کاتالوگ به پایان رسیده است.');
      return;
    }

    timerInterval = setInterval(() => {
      remainingSeconds.value -= 1;
      // Persist countdown progress to storage every 5 seconds
      if (remainingSeconds.value % 5 === 0) {
        saveSessionToStorage();
      }

      if (remainingSeconds.value <= 0) {
        stopTimer();
        expire('مدت زمان مجاز برای مشاهده این کاتالوگ به پایان رسیده است.');
      }
    }, 1000);
  }

  function saveSessionToStorage() {
    try {
      if (typeof window === 'undefined' || !token.value) return;
      const data: StoredCatalogSession = {
        token: token.value,
        recipientName: recipientName.value,
        authMethod: authMethod.value,
        linkID: linkID.value ?? 0,
        viewingExpiresAt: viewingExpiresAt.value,
        remainingSeconds: remainingSeconds.value,
        savedAt: Math.floor(Date.now() / 1000),
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
      catalogTokenManager.setToken(token.value);
    } catch {
      // Storage access disabled or quota exceeded
    }
  }

  function restoreSessionFromStorage(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return false;
      const session: StoredCatalogSession = JSON.parse(raw);
      if (!session || !session.token) return false;

      // Calculate elapsed time since savedAt
      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(0, now - (session.savedAt || now));
      const adjustedRemaining = session.remainingSeconds - elapsed;

      if (adjustedRemaining <= 0 && session.remainingSeconds > 0) {
        // Session expired in the background
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        catalogTokenManager.clear();
        return false;
      }

      token.value = session.token;
      recipientName.value = session.recipientName;
      authMethod.value = session.authMethod;
      linkID.value = session.linkID;
      viewingExpiresAt.value = session.viewingExpiresAt;
      status.value = 'GRANTED';
      startTimer(adjustedRemaining > 0 ? adjustedRemaining : session.remainingSeconds);
      return true;
    } catch {
      return false;
    }
  }

  function clearSession() {
    stopTimer();
    token.value = '';
    status.value = 'IDLE';
    recipientName.value = '';
    linkID.value = null;
    shoesCount.value = 0;
    remainingSeconds.value = 0;
    firstViewedAt.value = 0;
    viewingExpiresAt.value = 0;
    errorTitle.value = '';
    errorMessage.value = '';
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {}
    catalogTokenManager.clear();
  }

  function expire(reason?: string) {
    stopTimer();
    status.value = 'EXPIRED';
    errorTitle.value = 'زمان مشاهده به پایان رسید';
    errorMessage.value =
      reason || 'مدت زمان مجاز برای نشست شما منقضی گردید. جهت تمدید مهلت دسترسی با مدیریت آتلیه DYF تماس حاصل فرمایید.';
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {}
    catalogTokenManager.clear();
  }

  function setAccessGranted(data: CatalogAccessResponse, resolvedToken: string) {
    token.value = resolvedToken;
    recipientName.value = data.recipientName || 'خریدار گرامی';
    authMethod.value = data.authMethod;
    linkID.value = data.linkID;
    shoesCount.value = data.shoesCount || 0;
    firstViewedAt.value = data.firstViewedAt;
    viewingExpiresAt.value = data.viewingExpiresAt;
    status.value = 'GRANTED';
    errorTitle.value = '';
    errorMessage.value = '';

    const remaining = typeof data.remainingSeconds === 'number' ? data.remainingSeconds : 7200;
    startTimer(remaining);
    saveSessionToStorage();
  }

  /**
   * Verify link token against backend API
   */
  async function verifyToken(rawToken: string): Promise<boolean> {
    const cleanToken = (rawToken || '').trim();
    if (!isValidTokenFormat(cleanToken)) {
      status.value = 'INVALID';
      errorTitle.value = 'لینک دسترسی نامعتبر است';
      errorMessage.value = 'ساختار توکن درج‌شده در نشانی نامعتبر است. لطفاً پیوند صحیح را بررسی نمایید.';
      return false;
    }

    token.value = cleanToken;
    status.value = 'VERIFYING';
    isLoading.value = true;
    errorTitle.value = '';
    errorMessage.value = '';

    try {
      const response = await catalogService.access(cleanToken);

      if (response.success && response.data) {
        const data = response.data;
        recipientName.value = data.recipientName || 'خریدار گرامی';
        authMethod.value = data.authMethod;
        linkID.value = data.linkID;
        shoesCount.value = data.shoesCount || 0;
        firstViewedAt.value = data.firstViewedAt;
        viewingExpiresAt.value = data.viewingExpiresAt;

        if (data.authMethod === 'DIRECT') {
          // Direct links grant access immediately
          setAccessGranted(data, cleanToken);
          return true;
        } else {
          // OTP links require phone number & SMS verification
          status.value = 'REQUIRES_OTP';
          return true;
        }
      }

      status.value = 'INVALID';
      errorTitle.value = 'لینک نامعتبر است';
      errorMessage.value = response.error?.message || 'لینک کاتالوگ مورد نظر در سامانه یافت نشد.';
      return false;
    } catch (err: unknown) {
      const apiErr = err as { status?: number; error?: { message?: string } };
      const statusCode = apiErr?.status;
      const message = apiErr?.error?.message;

      if (statusCode === 410) {
        status.value = 'EXPIRED';
        errorTitle.value = 'اعتبار لینک به پایان رسیده است';
        errorMessage.value = message || 'مهلت زمانی این لینک اختصاصی به پایان رسیده است.';
      } else if (statusCode === 403) {
        status.value = 'INACTIVE';
        errorTitle.value = 'لینک غیرفعال گردیده است';
        errorMessage.value = message || 'این لینک اختصاصی توسط مدیریت کارگاه غیرفعال شده است.';
      } else if (statusCode === 404) {
        status.value = 'INVALID';
        errorTitle.value = 'لینک دسترسی نامعتبر است';
        errorMessage.value = message || 'لینک دسترسی معتبر نیست یا در سامانه یافت نشد.';
      } else {
        status.value = 'INVALID';
        errorTitle.value = 'خطا در بررسی لینک';
        errorMessage.value = message || 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Initialize catalog access based on current URL query or stored session
   */
  async function initAccess(explicitToken?: string): Promise<CatalogAccessStatus> {
    const targetToken = explicitToken || extractTokenFromUrl();

    if (targetToken) {
      await verifyToken(targetToken);
      return status.value;
    }

    // No token provided in URL: check if an active session is saved in storage
    const restored = restoreSessionFromStorage();
    if (restored) {
      return status.value;
    }

    // No token and no active session: switch to partner phone login
    status.value = 'REQUIRES_PHONE';
    errorTitle.value = '';
    errorMessage.value = '';
    return status.value;
  }

  function logout() {
    clearSession();
    if (typeof window !== 'undefined') {
      // Clear URL query token to prevent auto-relog
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  return {
    // State
    token,
    status,
    recipientName,
    authMethod,
    linkID,
    shoesCount,
    firstViewedAt,
    viewingExpiresAt,
    remainingSeconds,
    errorTitle,
    errorMessage,
    isLoading,

    // Computed
    isAuthenticated,
    hasError,
    isDirect,
    formattedTimer,

    // Actions
    extractTokenFromUrl,
    verifyToken,
    initAccess,
    setAccessGranted,
    startTimer,
    stopTimer,
    expire,
    logout,
    clearSession,
    restoreSessionFromStorage,
  };
}
