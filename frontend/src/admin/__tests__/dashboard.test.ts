/**
 * Unit Tests for Dashboard View & KPI Calculations (FE-013)
 */

import type { LinkItemResponse } from '@/shared/api/types';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

function getLinkBadgeClass(link: Partial<LinkItemResponse>) {
  if (link.isExpired || !link.isActive) return 'dyf-badge-expired';
  const targetDate = link.validUntil || link.expiresAt;
  if (targetDate) {
    const expiryTime = new Date(targetDate).getTime();
    const now = Date.now();
    if (expiryTime > now && expiryTime - now < 24 * 60 * 60 * 1000) {
      return 'dyf-badge-pending';
    }
  }
  return 'dyf-badge-active';
}

export async function runDashboardTests(): Promise<TestResult[]> {
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

  // Test 1: Active link badge class
  test('Active non-expiring link returns dyf-badge-active', () => {
    const link: Partial<LinkItemResponse> = {
      isActive: true,
      isExpired: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    };
    assert(getLinkBadgeClass(link) === 'dyf-badge-active', 'Must be dyf-badge-active');
  });

  // Test 2: Expiring soon link badge class (<24h)
  test('Link expiring within 24 hours returns dyf-badge-pending', () => {
    const link: Partial<LinkItemResponse> = {
      isActive: true,
      isExpired: false,
      expiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // in 4 hours
    };
    assert(getLinkBadgeClass(link) === 'dyf-badge-pending', 'Must be dyf-badge-pending');
  });

  // Test 3: Inactive/expired link badge class
  test('Expired link returns dyf-badge-expired', () => {
    const link: Partial<LinkItemResponse> = {
      isActive: false,
      isExpired: true,
    };
    assert(getLinkBadgeClass(link) === 'dyf-badge-expired', 'Must be dyf-badge-expired');
  });

  return results;
}
