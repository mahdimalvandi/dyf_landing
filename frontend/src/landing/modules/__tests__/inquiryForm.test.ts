/**
 * Unit Tests for B2B Inquiry Form Validation (FE-009)
 * Tests Persian digit conversion, Iranian phone validation, and required fields.
 */

import { toEnglishDigits, validateInquiryForm, type InquiryData } from '../inquiryForm';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runInquiryFormTests(): Promise<TestResult[]> {
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

  // Test 1: Digit normalization
  test('toEnglishDigits converts Persian and Arabic digits correctly', () => {
    assert(toEnglishDigits('۰۹۱۲۳۴۵۶۷۸۹') === '09123456789', 'Persian digits must convert');
    assert(toEnglishDigits('٠٩١٢٣٤٥٦٧٨٩') === '09123456789', 'Arabic digits must convert');
    assert(toEnglishDigits('09123456789') === '09123456789', 'ASCII digits must remain untouched');
  });

  // Test 2: Iranian phone number validation
  test('validateInquiryForm handles various valid Iranian phone formats', () => {
    const validPhones = [
      '09121112233',
      '۰۹۱۲۱۱۱۲۲۳۳',
      '+989121112233',
      '00989121112233',
      '9121112233',
      '0912-111-2233',
      '0912 111 2233',
    ];

    for (const phone of validPhones) {
      const data: InquiryData = {
        storeName: 'فروشگاه آروین',
        cityMarket: 'تهران - بازار بزرگ',
        phoneNumber: phone,
        linePreference: 'both',
      };
      const res = validateInquiryForm(data);
      assert(res.isValid, `Phone ${phone} should be valid`);
      assert(res.normalizedPhone === '09121112233', `Phone ${phone} should normalize to 09121112233`);
    }
  });

  // Test 3: Rejection of invalid phone numbers
  test('validateInquiryForm rejects invalid phone numbers', () => {
    const invalidPhones = [
      '12345',
      '02188888888',
      '08121112233',
      '0912111223', // 10 digits
      '091211122334', // 12 digits
      'abcd',
      '',
    ];

    for (const phone of invalidPhones) {
      const data: InquiryData = {
        storeName: 'فروشگاه آروین',
        cityMarket: 'تهران - بازار بزرگ',
        phoneNumber: phone,
        linePreference: 'both',
      };
      const res = validateInquiryForm(data);
      assert(!res.isValid, `Phone ${phone} should be rejected`);
      assert(Boolean(res.errors.phoneNumber), `Phone ${phone} must have phoneNumber error`);
    }
  });

  // Test 4: Rejection of missing or short store name and city
  test('validateInquiryForm rejects empty or 1-character names and cities', () => {
    const invalidData: InquiryData = {
      storeName: ' ',
      cityMarket: '',
      phoneNumber: '09121234567',
      linePreference: 'both',
    };
    const res = validateInquiryForm(invalidData);
    assert(!res.isValid, 'Empty store and city must be invalid');
    assert(Boolean(res.errors.storeName), 'Must have storeName error');
    assert(Boolean(res.errors.cityMarket), 'Must have cityMarket error');
  });

  return results;
}
