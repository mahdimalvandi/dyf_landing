/**
 * Unit Tests for Shoes Management Module (FE-014)
 */

import type { CreateShoeRequest, ShoeItemResponse } from '@/shared/api/types';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function parseColors(input: string): string[] {
  return input
    .split(/[،,]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

export function validateShoeForm(data: Partial<CreateShoeRequest>): { valid: boolean; error?: string } {
  if (!data.title || !data.title.trim()) {
    return { valid: false, error: 'عنوان مدل کفش الزامی است.' };
  }
  if (!data.categoryIDs || !data.categoryIDs.length) {
    return { valid: false, error: 'حداقل یک دسته‌بندی باید انتخاب شود.' };
  }
  return { valid: true };
}

export async function runShoesTests(): Promise<TestResult[]> {
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

  // Test 1: Color parsing
  test('parseColors splits Persian and Latin commas correctly and removes whitespace', () => {
    const parsed = parseColors('مشکی کلاسیک، عسلی کاراملی , قهوه‌ای سوخته ');
    assert(parsed.length === 3, 'Must split into 3 colors');
    assert(parsed[0] === 'مشکی کلاسیک', 'First color must match');
    assert(parsed[1] === 'عسلی کاراملی', 'Second color must match');
    assert(parsed[2] === 'قهوه‌ای سوخته', 'Third color must match');
  });

  // Test 2: Validation detects empty title
  test('validateShoeForm fails on empty title', () => {
    const res = validateShoeForm({ title: '   ', categoryIDs: [1] });
    assert(!res.valid, 'Must be invalid');
    assert(res.error === 'عنوان مدل کفش الزامی است.', 'Error message must match');
  });

  // Test 3: Validation detects empty categories
  test('validateShoeForm fails on missing categories', () => {
    const res = validateShoeForm({ title: 'کفش آکسفورد', categoryIDs: [] });
    assert(!res.valid, 'Must be invalid');
    assert(res.error === 'حداقل یک دسته‌بندی باید انتخاب شود.', 'Error message must match');
  });

  // Test 4: Validation passes with valid inputs
  test('validateShoeForm succeeds with complete data', () => {
    const res = validateShoeForm({ title: 'کفش هشترک کلاسیک', categoryIDs: [2, 3] });
    assert(res.valid === true, 'Must be valid');
    assert(!res.error, 'Must have no error');
  });

  return results;
}
