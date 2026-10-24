/**
 * Unit Tests for Customer Management Module (FE-017)
 */

import type { CustomerResponse } from '@/shared/api/types';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function validateCustomerForm(data: {
  firstNameFa: string;
  lastNameFa: string;
  phoneNumber: string;
}): { valid: boolean; error?: string } {
  if (!data.firstNameFa.trim() || !data.lastNameFa.trim()) {
    return { valid: false, error: 'نام و نام خانوادگی مشتری الزامی است.' };
  }
  if (!/^09\d{9}$/.test(data.phoneNumber.trim())) {
    return { valid: false, error: 'شماره تلفن همراه باید ۱۱ رقم بوده و با ۰۹ شروع شود.' };
  }
  return { valid: true };
}

export function matchesCustomerQuery(c: CustomerResponse, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    c.firstNameFa.toLowerCase().includes(q) ||
    c.lastNameFa.toLowerCase().includes(q) ||
    c.phoneNumber.includes(q) ||
    Boolean(c.storeName && c.storeName.toLowerCase().includes(q))
  );
}

export async function runCustomersTests(): Promise<TestResult[]> {
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

  // Test 1: Empty names
  test('validateCustomerForm fails when name is empty', () => {
    const res = validateCustomerForm({ firstNameFa: '', lastNameFa: '', phoneNumber: '09121234567' });
    assert(!res.valid, 'Must be invalid');
    assert(res.error === 'نام و نام خانوادگی مشتری الزامی است.', 'Error message must match');
  });

  // Test 2: Invalid phone number
  test('validateCustomerForm fails on invalid Iranian phone', () => {
    const res = validateCustomerForm({ firstNameFa: 'مصطفی', lastNameFa: 'کمالی', phoneNumber: '02188888888' });
    assert(!res.valid, 'Must be invalid on landline');
    assert(res.error === 'شماره تلفن همراه باید ۱۱ رقم بوده و با ۰۹ شروع شود.', 'Error message must match');
  });

  // Test 3: Valid customer
  test('validateCustomerForm succeeds with valid data', () => {
    const res = validateCustomerForm({ firstNameFa: 'مصطفی', lastNameFa: 'کمالی', phoneNumber: '09121234567' });
    assert(res.valid === true, 'Must be valid');
    assert(!res.error, 'Must have no error');
  });

  // Test 4: Search query matching
  test('matchesCustomerQuery matches across names, phone, and store', () => {
    const customer: CustomerResponse = {
      ID: 10,
      firstNameFa: 'مصطفی',
      lastNameFa: 'کمالی',
      storeName: 'بنکداری سپهر',
      phoneNumber: '09121234567',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    assert(matchesCustomerQuery(customer, 'کمالی'), 'Matches by last name');
    assert(matchesCustomerQuery(customer, 'سپهر'), 'Matches by store name');
    assert(matchesCustomerQuery(customer, '0912'), 'Matches by phone prefix');
    assert(!matchesCustomerQuery(customer, 'تبریز'), 'Does not match absent query');
  });

  return results;
}
