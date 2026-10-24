/**
 * DYF Mock Browser Interceptor
 * Intercepts client fetch calls during development when VITE_ENABLE_MOCK is true.
 */

import { handleMockRequest } from './handlers';

let isMockInstalled = false;

export function setupMockServer(): void {
  if (isMockInstalled) {
    return;
  }

  const globalScope = typeof window !== 'undefined' ? window : (globalThis as unknown as Window);
  if (!globalScope || typeof globalScope.fetch !== 'function') {
    return;
  }

  const originalFetch = globalScope.fetch.bind(globalScope);

  globalScope.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url: string;
    let method = 'GET';
    let headers = new Headers(init?.headers);
    let body: any = undefined;

    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
      method = input.method;
      headers = new Headers(input.headers);
    } else {
      url = String(input);
    }

    if (init?.method) {
      method = init.method;
    }

    if (init?.body) {
      if (typeof init.body === 'string') {
        try {
          body = JSON.parse(init.body);
        } catch {
          body = init.body;
        }
      } else {
        body = init.body;
      }
    }

    // Only intercept /api/v1 calls
    if (url.includes('/api/v1/')) {
      const mockResult = handleMockRequest({
        url,
        method,
        headers,
        body,
      });

      if (mockResult) {
        // Optional realistic network delay (50ms - 150ms)
        await new Promise((resolve) => setTimeout(resolve, 60));

        return new Response(JSON.stringify(mockResult.data), {
          status: mockResult.status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-DYF-Mock-Response': 'true',
          },
        });
      }
    }

    return originalFetch(input, init);
  };

  isMockInstalled = true;
  console.info(
    '%c[DYF Mock System]%c Active — Intercepting /api/v1 requests with local fixtures.',
    'color: #c9a96e; font-weight: bold;',
    'color: inherit;'
  );
}
