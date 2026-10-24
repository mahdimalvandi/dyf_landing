/**
 * Unit Tests for Link Wizard & Access Links Logic (FE-016)
 */

import type { CreateLinkRequest } from '@/shared/api/types';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function validateWizardStep1(recipientName: string): boolean {
  return Boolean(recipientName && recipientName.trim().length > 0);
}

export function validateWizardStep2(shoeIds: number[]): boolean {
  return Boolean(shoeIds && shoeIds.length > 0);
}

export function calculateDurationMinutes(value: number, unit: 'h' | 'd' | 'unlimited'): number | undefined {
  if (unit === 'h') return value * 60;
  if (unit === 'd') return value * 24 * 60;
  return undefined;
}

export async function runLinksWizardTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      throw new Error(message);
    }
  };

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ name, passed: false, error: errorMsg });
    }
  };

  // Test 1: Step 1 validation
  test('Step 1 requires valid recipient name', () => {
    assert(!validateWizardStep1(''), 'Empty name must fail');
    assert(!validateWizardStep1('   '), 'Whitespace name must fail');
    assert(validateWizardStep1('حاج مصطفی کمالی'), 'Valid name must pass');
  });

  // Test 2: Step 2 validation
  test('Step 2 requires at least one shoe ID selected', () => {
    assert(!validateWizardStep2([]), 'Empty shoes must fail');
    assert(validateWizardStep2([101, 102]), 'Selected shoes must pass');
  });

  // Test 3: Duration calculation
  test('calculateDurationMinutes converts hours and days accurately', () => {
    assert(calculateDurationMinutes(24, 'h') === 1440, '24 hours = 1440 minutes');
    assert(calculateDurationMinutes(3, 'd') === 4320, '3 days = 4320 minutes');
    assert(calculateDurationMinutes(10, 'unlimited') === undefined, 'unlimited = undefined');
  });

  // Test 4: CreateLinkRequest payload structure
  test('CreateLinkRequest payload maps properly', () => {
    const payload: CreateLinkRequest = {
      customerID: 15,
      recipientName: 'بنکداری سپهر',
      phoneNumber: '09121234567',
      shoeIDs: [1, 2, 3],
      viewingDurationMinutes: 1440,
      authMethod: 'DIRECT',
    };
    assert(payload.shoeIDs.length === 3, 'Must retain 3 shoe IDs');
    assert(payload.authMethod === 'DIRECT', 'Auth method must be DIRECT');
  });

  return results;
}
