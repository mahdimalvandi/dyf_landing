/**
 * Unit Tests for Category Management Module (FE-015)
 */

import type { CategoryResponse } from '@/shared/api/types';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function validateCategory(
  title: string,
  existingCategories: CategoryResponse[],
  currentId?: number
): { valid: boolean; error?: string } {
  const clean = title.trim();
  if (!clean) {
    return { valid: false, error: 'نام دسته‌بندی الزامی است.' };
  }

  const duplicate = existingCategories.find(
    (c) => c.title.trim().toLowerCase() === clean.toLowerCase() && (!currentId || c.ID !== currentId)
  );

  if (duplicate) {
    return { valid: false, error: 'دسته‌بندی با این عنوان از قبل وجود دارد.' };
  }

  return { valid: true };
}

export async function runCategoriesTests(): Promise<TestResult[]> {
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

  const sampleCategories: CategoryResponse[] = [
    { ID: 1, title: 'کفش رسمی', slug: 'formal', shoeCount: 8, createdAt: '', updatedAt: '' },
    { ID: 2, title: 'کالج و لوفر', slug: 'loafer', shoeCount: 5, createdAt: '', updatedAt: '' },
  ];

  // Test 1: Empty title
  test('validateCategory fails on empty title', () => {
    const res = validateCategory('   ', sampleCategories);
    assert(!res.valid, 'Must be invalid');
    assert(res.error === 'نام دسته‌بندی الزامی است.', 'Error message must match');
  });

  // Test 2: Duplicate title
  test('validateCategory fails on duplicate category name', () => {
    const res = validateCategory('کفش رسمی', sampleCategories);
    assert(!res.valid, 'Must be invalid on duplicate name');
    assert(res.error === 'دسته‌بندی با این عنوان از قبل وجود دارد.', 'Error message must match');
  });

  // Test 3: Edit self doesn't trigger duplicate error
  test('validateCategory allows keeping the same name when editing existing category', () => {
    const res = validateCategory('کفش رسمی', sampleCategories, 1);
    assert(res.valid === true, 'Editing own title must be valid');
  });

  // Test 4: New unique title succeeds
  test('validateCategory succeeds with new unique title', () => {
    const res = validateCategory('بوت و نیم‌بوت زمستانه', sampleCategories);
    assert(res.valid === true, 'New unique category must be valid');
    assert(!res.error, 'Must have no error');
  });

  return results;
}
