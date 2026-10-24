/**
 * Unit & Integration Tests for VIP Catalog Gate & Customer OTP Flow (FE-020)
 * Covers Phone validation, BE-GAP-02 Part A (Link OTP), BE-GAP-02 Part B (Direct Partner OTP),
 * Passcode validation, and visual unlock state transitions.
 */

import { useCatalogAccessStore } from '../stores/access';
import { catalogTokenManager } from '@/shared/api/storage';
import { setupMockServer } from '@/mocks/browser';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function isValidIranianPhone(phoneNumber: string): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  const cleaned = phoneNumber.trim().replace(/\D/g, '');
  return /^09\d{9}$/.test(cleaned);
}

export async function runGateOtpTests(): Promise<TestResult[]> {
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

  // 1. Phone number validation
  await test('isValidIranianPhone accepts valid 11-digit Iranian mobile numbers', () => {
    assert(isValidIranianPhone('09121112233'), '09121112233 must be valid');
    assert(isValidIranianPhone('09351234567'), '09351234567 must be valid');
    assert(isValidIranianPhone('  09142223344  '), 'Padded phone must be valid');
  });

  await test('isValidIranianPhone rejects invalid phone formats', () => {
    assert(!isValidIranianPhone(''), 'Empty string must fail');
    assert(!isValidIranianPhone('02188776655'), 'Landline 021 must fail');
    assert(!isValidIranianPhone('0912'), 'Too short must fail');
    assert(!isValidIranianPhone('0912111223344'), 'Too long must fail');
    assert(!isValidIranianPhone('abcdefghijk'), 'Non-digits must fail');
  });

  // 2. BE-GAP-02 Part A: Link Customer OTP Send
  await test('sendOtp sends customer OTP for a valid link token (BE-GAP-02 Part A)', async () => {
    const store = useCatalogAccessStore();
    store.clearSession();
    // Use fixture link 3 which requires OTP
    const otpToken = 'e110b5c40e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bca53c39e2';
    await store.verifyToken(otpToken);

    assert(store.status.value === 'REQUIRES_OTP', 'Must be in REQUIRES_OTP state');

    const res = await store.sendOtp('09173334455');
    assert(res.success === true, 'sendOtp must succeed');
    assert(typeof res.expiresInSeconds === 'number', 'Expires in seconds must be returned');
    assert(res.expiresInSeconds! > 0, 'Expires in seconds must be positive');
  });

  // 3. BE-GAP-02 Part A: Link Customer OTP Verify & Catalog Unlock
  await test('verifyOtp verifies code and unlocks catalog for link customer (BE-GAP-02 Part A)', async () => {
    const store = useCatalogAccessStore();
    const res = await store.verifyOtp('09173334455', '12345');

    assert(res.success === true, 'verifyOtp with valid code must succeed');
    assert(store.status.value === 'GRANTED', 'Status must transition to GRANTED');
    assert(store.isAuthenticated.value === true, 'User must be authenticated');
    assert(store.recipientName.value === 'سپهر نوری‌زاده', 'Recipient name must match fixture');
    assert(store.remainingSeconds.value > 0, 'Remaining seconds must be initialized');
    assert(catalogTokenManager.hasToken(), 'CatalogTokenManager must store session token');
  });

  // 4. BE-GAP-02 Part B: Direct Partner OTP Send & Verify (no token)
  await test('sendOtp & verifyOtp support direct partner login without token (BE-GAP-02 Part B)', async () => {
    const store = useCatalogAccessStore();
    store.clearSession();

    // Verify send direct OTP
    const sendRes = await store.sendOtp('09121112233');
    assert(sendRes.success === true, 'Direct sendOtp must succeed');
    assert(sendRes.expiresInSeconds === 120, 'Expires in seconds must be 120');

    // Verify verify direct OTP
    const verifyRes = await store.verifyOtp('09121112233', '12345');
    assert(verifyRes.success === true, 'Direct verifyOtp must succeed');
    assert(store.status.value === 'GRANTED', 'Status must transition to GRANTED');
    assert(store.isAuthenticated.value === true, 'User must be authenticated');
    assert(store.recipientName.value.length > 0, 'Customer name must be populated');
  });

  // 5. VIP Passcode validation
  await test('verifyPasscode validates VIP PIN and unlocks catalog', async () => {
    const store = useCatalogAccessStore();
    store.clearSession();
    store.token.value = 'c8f2a91e495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bc';

    // Test rejection of empty passcode
    const emptyRes = await store.verifyPasscode('');
    assert(emptyRes.success === false, 'Empty passcode must fail');

    // Test acceptance of valid VIP PIN
    const validRes = await store.verifyPasscode('1234');
    assert(validRes.success === true, 'Valid passcode 1234 must succeed');
    assert(store.status.value === 'GRANTED', 'Passcode unlock must grant access');
    assert(store.isAuthenticated.value === true, 'Passcode unlock must authenticate user');
  });

  return results;
}
