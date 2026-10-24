/**
 * Unit Tests for DYF Mock System (FE-005)
 * Validates in-memory database CRUD, category counts, endpoint handlers,
 * and Go envelope compliance.
 */

import { MockDatabase } from '../db';
import { handleMockRequest } from '../handlers';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runMockTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      throw new Error(message);
    }
  };

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ name, passed: false, error: errorMsg });
    }
  };

  // -------------------------------------------------------------
  // Test 1: MockDatabase CRUD and category count recalculation
  // -------------------------------------------------------------
  await test('MockDatabase maintains shoes and accurately recalculates shoeCount', () => {
    const db = new MockDatabase();
    db.reset();

    const catFormal = db.categories.find((c) => c.ID === 1);
    assert(Boolean(catFormal), 'Category 1 should exist');
    const initialCount = catFormal!.shoeCount;

    // Create shoe in category 1
    const newShoe = db.createShoe({
      title: 'کفش تستی جدید',
      categoryIDs: [1],
    });

    assert(db.shoes.some((s) => s.ID === newShoe.ID), 'New shoe must be in DB');
    const updatedCat = db.categories.find((c) => c.ID === 1);
    assert(updatedCat!.shoeCount === initialCount + 1, 'Category shoeCount must increment');

    // Delete shoe
    db.deleteShoe(newShoe.ID);
    const afterDeleteCat = db.categories.find((c) => c.ID === 1);
    assert(afterDeleteCat!.shoeCount === initialCount, 'Category shoeCount must decrement on delete');
  });

  // -------------------------------------------------------------
  // Test 2: Auth handlers simulation
  // -------------------------------------------------------------
  await test('Handles admin OTP flow and validates phone numbers', () => {
    // Invalid phone
    const resBadPhone = handleMockRequest({
      url: '/api/v1/auth/admin/otp/send',
      method: 'POST',
      headers: new Headers(),
      body: { phoneNumber: '123' },
    });
    assert(resBadPhone !== null, 'Handler must match');
    assert(resBadPhone!.status === 400, 'Invalid phone must return 400');
    assert(resBadPhone!.data.success === false, 'success must be false');
    assert(resBadPhone!.data.error?.code === 'validationFailed', 'code must be validationFailed');

    // Valid phone
    const resGoodPhone = handleMockRequest({
      url: '/api/v1/auth/admin/otp/send',
      method: 'POST',
      headers: new Headers(),
      body: { phoneNumber: '09121234567' },
    });
    assert(resGoodPhone!.status === 200, 'Valid phone must return 200');
    assert(resGoodPhone!.data.success === true, 'success must be true');
    assert(resGoodPhone!.data.data.expiresInSeconds === 120, 'expiresInSeconds must be 120');

    // Verify OTP
    const resVerify = handleMockRequest({
      url: '/api/v1/auth/admin/otp/verify',
      method: 'POST',
      headers: new Headers(),
      body: { phoneNumber: '09121234567', code: '12345' },
    });
    assert(resVerify!.status === 200, 'Verification must succeed');
    assert(Boolean(resVerify!.data.data.token), 'Must return access token');
    assert(resVerify!.data.data.admin.phoneNumber === '09121234567', 'Must return admin info');
  });

  // -------------------------------------------------------------
  // Test 3: Dashboard overview stats
  // -------------------------------------------------------------
  await test('Returns unified dashboard overview matching Task-08 specs', () => {
    const res = handleMockRequest({
      url: '/api/v1/dashboard',
      method: 'GET',
      headers: new Headers(),
    });
    assert(res !== null, 'Handler must match');
    assert(res!.status === 200, 'Status must be 200');
    const data = res!.data.data;
    assert(typeof data.stats.activeShoesCount === 'number', 'activeShoesCount must be number');
    assert(typeof data.stats.totalCustomersCount === 'number', 'totalCustomersCount must be number');
    assert(Array.isArray(data.recentLinks), 'recentLinks must be array');
    assert(Array.isArray(data.recentCustomers), 'recentCustomers must be array');
  });

  // -------------------------------------------------------------
  // Test 4: Shoes pagination and category filtering
  // -------------------------------------------------------------
  await test('Shoes endpoint filters by categoryID and paginates items', () => {
    const res = handleMockRequest({
      url: '/api/v1/shoes?page=1&limit=3&categoryID=1',
      method: 'GET',
      headers: new Headers(),
    });
    assert(res !== null, 'Handler must match');
    assert(res!.status === 200, 'Status must be 200');
    const { items, pagination } = res!.data.data;
    assert(items.length <= 3, 'Items length must respect limit');
    assert(pagination.page === 1, 'Page must be 1');
    assert(pagination.limit === 3, 'Limit must be 3');
    for (const item of items) {
      assert(item.categoryIDs.includes(1), 'Each item must belong to categoryID 1');
    }
  });

  // -------------------------------------------------------------
  // Test 5: Catalog VIP access and BE-GAP-01 shoes retrieval
  // -------------------------------------------------------------
  await test('Simulates catalog token access and authorized shoe list (BE-GAP-01)', () => {
    // Valid token access
    const resAccess = handleMockRequest({
      url: '/api/v1/catalog/c8f2a91e495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bc/access',
      method: 'POST',
      headers: new Headers(),
    });
    assert(resAccess !== null, 'Access route must match');
    assert(resAccess!.status === 200, 'Access must return 200');
    assert(resAccess!.data.data.recipientName === 'حاج مصطفی کمالی', 'Recipient name must match');

    // BE-GAP-01: Get shoes for token
    const resShoes = handleMockRequest({
      url: '/api/v1/catalog/c8f2a91e495fa8b30e8c75dd9cb1a5e15642bc3861214a1e94d84f8bb6ce45bc/shoes',
      method: 'GET',
      headers: new Headers(),
    });
    assert(resShoes !== null, 'Shoes route must match');
    assert(resShoes!.status === 200, 'Shoes route must return 200');
    assert(Array.isArray(resShoes!.data.data.items), 'Must return items array');
    assert(resShoes!.data.data.items.length > 0, 'Must have shoes assigned');
  });

  return results;
}
