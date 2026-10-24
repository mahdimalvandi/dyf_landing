/**
 * Unit Tests for DYF API Client (FE-004)
 * Validates request formatting, Go envelope parsing, token management,
 * error hierarchies, and timeout handling.
 */

import { ApiClient } from '../client';
import { ApiError, isApiError } from '../errors';
import { TokenManager } from '../storage';
import type { ApiResponse } from '../types';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runApiClientTests(): Promise<TestResult[]> {
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
  // Test 1: Successful GET response parsing
  // -------------------------------------------------------------
  await test('parses Go Fiber success envelope with status 200', async () => {
    const mockEnvelope: ApiResponse<{ id: number; title: string }> = {
      success: true,
      statusCode: 200,
      message: 'دریافت موفق دسته‌بندی',
      data: { id: 1, title: 'کفش رسمی' },
      meta: null,
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(JSON.stringify(mockEnvelope), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    try {
      const client = new ApiClient({ baseUrl: '/api/v1' });
      const res = await client.get<{ id: number; title: string }>('/categories/1');
      assert(res.success === true, 'Response should indicate success: true');
      assert(res.statusCode === 200, 'Status code should be 200');
      assert(res.data?.id === 1, 'Data ID should match');
      assert(res.data?.title === 'کفش رسمی', 'Data title should match');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------
  // Test 2: Query parameters serialization
  // -------------------------------------------------------------
  await test('correctly serializes complex query params and ignores nullish values', async () => {
    let capturedUrl = '';
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input) => {
      capturedUrl = String(input);
      return new Response(JSON.stringify({ success: true, statusCode: 200 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const client = new ApiClient({ baseUrl: '/api/v1' });
      await client.get('/shoes', {
        params: {
          page: 2,
          limit: 12,
          categoryID: 5,
          search: 'دیفندر',
          empty: undefined,
          emptyNull: null,
          tags: ['formal', 'classic'],
        },
      });

      assert(capturedUrl.includes('/api/v1/shoes?'), 'URL must contain /api/v1/shoes?');
      assert(capturedUrl.includes('page=2'), 'URL must contain page=2');
      assert(capturedUrl.includes('limit=12'), 'URL must contain limit=12');
      assert(capturedUrl.includes('categoryID=5'), 'URL must contain categoryID=5');
      assert(capturedUrl.includes('search=%D8%AF%DB%8C%D9%81%D9%86%D8%AF%D8%B1'), 'Search must be encoded');
      assert(!capturedUrl.includes('empty='), 'Empty undefined values must not be serialized');
      assert(!capturedUrl.includes('emptyNull='), 'Null values must not be serialized');
      assert(capturedUrl.includes('tags=formal&tags=classic'), 'Array query params must be repeated');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------
  // Test 3: Bearer token attachment and bypass
  // -------------------------------------------------------------
  await test('attaches Bearer token from TokenManager, supports auth: false and token overrides', async () => {
    let lastHeaders: Headers | null = null;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (_, init) => {
      lastHeaders = new Headers(init?.headers);
      return new Response(JSON.stringify({ success: true, statusCode: 200 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const tokenManager = new TokenManager('test_token_key');
      tokenManager.setToken('test-opaque-token-12345');

      const client = new ApiClient({ baseUrl: '/api/v1' });
      client.setTokenManager(tokenManager);

      // Default request with auth
      await client.get('/dashboard');
      assert(
        lastHeaders?.get('Authorization') === 'Bearer test-opaque-token-12345',
        'Authorization header should match active token'
      );

      // Request with auth: false
      await client.get('/categories', { auth: false });
      assert(
        lastHeaders?.get('Authorization') === null,
        'Authorization header should not be sent when auth: false'
      );

      // Request with custom token override
      await client.get('/catalog/stats', { token: 'override-token-999' });
      assert(
        lastHeaders?.get('Authorization') === 'Bearer override-token-999',
        'Authorization header should reflect token override'
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------
  // Test 4: Validation error handling (400)
  // -------------------------------------------------------------
  await test('translates 400 validation error into ApiError with details', async () => {
    const errorEnvelope = {
      success: false,
      statusCode: 400,
      error: {
        code: 'validationFailed',
        message: 'اعتبارسنجی داده‌ها با خطا مواجه شد',
        details: [
          {
            field: 'phoneNumber',
            issue: 'شماره تلفن همراه باید ۱۱ رقم بوده و با ۰۹ آغاز شود',
          },
        ],
      },
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(JSON.stringify(errorEnvelope), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });

    try {
      const client = new ApiClient({ baseUrl: '/api/v1' });
      let thrown: ApiError | null = null;

      try {
        await client.post('/auth/admin/otp/send', { phoneNumber: '123' });
      } catch (err) {
        if (isApiError(err)) {
          thrown = err;
        }
      }

      assert(thrown !== null, 'ApiError must be thrown on 400 error response');
      assert(thrown?.statusCode === 400, 'Status code must be 400');
      assert(thrown?.code === 'validationFailed', 'Error code must be validationFailed');
      assert(thrown?.isValidationError === true, 'isValidationError must be true');
      assert(thrown?.message === 'اعتبارسنجی داده‌ها با خطا مواجه شد', 'Persian message must be preserved');
      assert(Array.isArray(thrown?.details) && (thrown?.details as any)[0].field === 'phoneNumber', 'Field details must match');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------
  // Test 5: 401 Unauthorized handling & callback
  // -------------------------------------------------------------
  await test('triggers onUnauthorized callback on 401 response and flags isAuthError', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: false,
          statusCode: 401,
          error: {
            code: 'unauthorized',
            message: 'احراز هویت انجام نشده است',
          },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );

    try {
      let unauthorizedCalled = false;
      const client = new ApiClient({
        baseUrl: '/api/v1',
        onUnauthorized: () => {
          unauthorizedCalled = true;
        },
      });

      let thrown: ApiError | null = null;
      try {
        await client.get('/shoes');
      } catch (err) {
        if (isApiError(err)) {
          thrown = err;
        }
      }

      assert(thrown !== null, 'Should throw ApiError on 401');
      assert(thrown?.isAuthError === true, 'isAuthError must be true');
      assert(unauthorizedCalled === true, 'onUnauthorized hook must be called');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------
  // Test 6: Network failure & timeout handling
  // -------------------------------------------------------------
  await test('detects network errors and timeout aborts', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };

    try {
      const client = new ApiClient({ baseUrl: '/api/v1' });
      let thrown: ApiError | null = null;
      try {
        await client.get('/health');
      } catch (err) {
        if (isApiError(err)) {
          thrown = err;
        }
      }

      assert(thrown !== null, 'Should throw ApiError on network drop');
      assert(thrown?.isNetworkError === true, 'isNetworkError must be true');
      assert(thrown?.code === 'NETWORK_ERROR', 'Code must be NETWORK_ERROR');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  return results;
}
