/**
 * Unit Tests for VIP Catalog Access Store & Token Validation (FE-019)
 */

import {
  useCatalogAccessStore,
  extractTokenFromUrl,
  isValidTokenFormat,
  formatSecondsToTime,
} from '../stores/access';
import { catalogTokenManager } from '@/shared/api/storage';
import { setupMockServer } from '@/mocks/browser';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runCatalogAccessTests(): Promise<TestResult[]> {
  setupMockServer();
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

  // 1. Token format validation
  await test('isValidTokenFormat accepts valid alphanumeric & hex tokens', () => {
    assert(isValidTokenFormat('c8f2a91e'), '8-char token should be valid');
    assert(
      isValidTokenFormat('c8f2a91e495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bc'),
      '64-char hex token should be valid'
    );
    assert(isValidTokenFormat('vip_custom_link_101'), 'Slug token should be valid');
  });

  await test('isValidTokenFormat rejects malformed, empty or short tokens', () => {
    assert(!isValidTokenFormat(''), 'Empty string must be invalid');
    assert(!isValidTokenFormat('   '), 'Whitespace must be invalid');
    assert(!isValidTokenFormat('abc'), 'Too short (< 6 chars) must be invalid');
    assert(!isValidTokenFormat('token@#$!'), 'Special characters must be invalid');
  });

  // 2. Format seconds to human-readable timer
  await test('formatSecondsToTime accurately formats mm:ss and hh:mm:ss', () => {
    assert(formatSecondsToTime(0) === '00:00', '0 seconds must format to 00:00');
    assert(formatSecondsToTime(65) === '01:05', '65 seconds must format to 01:05');
    assert(formatSecondsToTime(3600) === '01:00:00', '3600 seconds must format to 01:00:00');
    assert(formatSecondsToTime(3665) === '01:01:05', '3665 seconds must format to 01:01:05');
  });

  // 3. Initial store state
  await test('useCatalogAccessStore initializes in unauthenticated state', () => {
    const store = useCatalogAccessStore();
    store.clearSession();
    assert(!store.isAuthenticated.value, 'Should not be authenticated initially');
    assert(store.status.value === 'IDLE', 'Initial status should be IDLE');
    assert(store.token.value === '', 'Token should be empty initially');
  });

  // 4. Invalid token verification
  await test('verifyToken rejects malformed token and transitions to INVALID state', async () => {
    const store = useCatalogAccessStore();
    const result = await store.verifyToken('bad');
    assert(result === false, 'Verification of short token should fail');
    assert(store.status.value === 'INVALID', 'Status should be INVALID');
    assert(store.hasError.value === true, 'hasError should be true');
    assert(store.errorTitle.value.length > 0, 'Error title must be set');
  });

  // 5. Active DIRECT link verification
  await test('verifyToken validates active DIRECT link and grants immediate access', async () => {
    const store = useCatalogAccessStore();
    const validDirectToken = 'c8f2a91e495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bc';
    const result = await store.verifyToken(validDirectToken);

    assert(result === true, 'Valid direct token must verify successfully');
    assert(store.status.value === 'GRANTED', 'Status must transition to GRANTED');
    assert(store.isAuthenticated.value === true, 'isAuthenticated must be true');
    assert(store.isDirect.value === true, 'isDirect must be true');
    assert(store.recipientName.value === 'حاج مصطفی کمالی', 'Recipient name must match fixture');
    assert(store.remainingSeconds.value > 0, 'Countdown timer must be positive');
  });

  // 6. OTP link verification
  await test('verifyToken validates OTP link and transitions to REQUIRES_OTP state', async () => {
    const store = useCatalogAccessStore();
    store.clearSession();
    const otpToken = 'e110b5c40e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2';
    const result = await store.verifyToken(otpToken);

    assert(result === true, 'Valid OTP token must verify successfully');
    assert(store.status.value === 'REQUIRES_OTP', 'Status must transition to REQUIRES_OTP');
    assert(store.isAuthenticated.value === false, 'Access must NOT yet be granted');
    assert(store.recipientName.value === 'سپهر نوری‌زاده', 'Recipient name must match OTP link');
  });

  // 7. Expired link verification
  await test('verifyToken rejects expired link (HTTP 410) and transitions to EXPIRED state', async () => {
    const store = useCatalogAccessStore();
    store.clearSession();
    const expiredToken = '77fa33d20e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2';
    const result = await store.verifyToken(expiredToken);

    assert(result === false, 'Expired token must fail verification');
    assert(store.status.value === 'EXPIRED', 'Status must transition to EXPIRED');
    assert(store.hasError.value === true, 'hasError must be true for expired links');
    assert(store.errorTitle.value.includes('اعتبار لینک'), 'Error title should indicate expiration');
  });

  // 8. Session expiration trigger
  await test('expire() stops timer, clears stored token, and sets EXPIRED state', () => {
    const store = useCatalogAccessStore();
    catalogTokenManager.setToken('temp_token');
    store.expire('جلسه منقضی گردید.');

    assert(store.status.value === 'EXPIRED', 'Status must be EXPIRED');
    assert(!store.isAuthenticated.value, 'isAuthenticated must be false');
    assert(!catalogTokenManager.hasToken(), 'CatalogTokenManager must be cleared');
    assert(store.errorMessage.value === 'جلسه منقضی گردید.', 'Custom reason must be retained');
  });

  // 9. Logout workflow
  await test('logout() resets store state and clears storage', () => {
    const store = useCatalogAccessStore();
    store.logout();

    assert(store.status.value === 'IDLE', 'Status must reset to IDLE');
    assert(store.token.value === '', 'Token must be empty');
    assert(store.recipientName.value === '', 'Recipient name must be empty');
    assert(store.remainingSeconds.value === 0, 'Remaining seconds must be 0');
  });

  return results;
}
