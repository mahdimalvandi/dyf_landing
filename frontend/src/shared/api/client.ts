/**
 * DYF API Client — Core HTTP Client
 * Built on native fetch with Go Fiber envelope support, JWT management,
 * timeout controls, and unified error handling.
 */

import { ApiError } from './errors';
import { adminTokenManager, TokenManager } from './storage';
import type {
  ApiClientConfig,
  ApiResponse,
  HttpMethod,
  QueryParamValue,
  RequestOptions,
} from './types';

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeoutMs: number;
  private tokenManager: TokenManager;
  private onUnauthorizedCallback?: () => void | Promise<void>;

  constructor(config: ApiClientConfig = {}) {
    // Resolve base URL from Vite environment or fallback to standard /api/v1 prefix
    let envBaseUrl = '';
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        envBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || '';
      }
    } catch {
      // Safe fallback when executed outside Vite bundling
    }

    this.baseUrl = (config.baseUrl || envBaseUrl || '/api/v1').replace(/\/+$/, '');
    this.defaultHeaders = {
      Accept: 'application/json',
      ...config.defaultHeaders,
    };
    this.timeoutMs = config.timeout && config.timeout > 0 ? config.timeout : 30000;
    this.tokenManager = adminTokenManager;
    this.onUnauthorizedCallback = config.onUnauthorized;
  }

  /**
   * Set custom token manager instance (e.g. for catalog vs admin)
   */
  public setTokenManager(manager: TokenManager): this {
    this.tokenManager = manager;
    return this;
  }

  /**
   * Register unauthorized (401) listener — invoked when token expires or is invalid
   */
  public onUnauthorized(callback: () => void | Promise<void>): this {
    this.onUnauthorizedCallback = callback;
    return this;
  }

  /**
   * Execute an HTTP request with envelope unwrapping and error handling
   */
  public async request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options.params);
    const headers = this.buildHeaders(options);
    const method: HttpMethod = (options.method || 'GET').toUpperCase() as HttpMethod;

    let body: BodyInit | null | undefined = undefined;
    if (options.body !== undefined && options.body !== null) {
      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        body = options.body;
      } else if (typeof options.body === 'string') {
        body = options.body;
      } else {
        body = JSON.stringify(options.body);
      }
    }

    const effectiveTimeout = options.timeout ?? this.timeoutMs;
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let didTimeout = false;

    if (effectiveTimeout > 0) {
      timeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, effectiveTimeout);
    }

    // Link user-provided signal if present
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // Check for 401 Unauthorized (expired or invalid token)
      if (response.status === 401) {
        this.tokenManager.removeToken();

        if (this.onUnauthorizedCallback) {
          try {
            await this.onUnauthorizedCallback();
          } catch {
            // Ignore callback failures
          }
        }
      }

      const parsedEnvelope = await this.parseResponseBody<T>(response);

      if (!response.ok || !parsedEnvelope.success) {
        throw ApiError.fromEnvelope(response.status, parsedEnvelope);
      }

      return parsedEnvelope;
    } catch (error: unknown) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      if (didTimeout) {
        throw ApiError.fromTimeout(effectiveTimeout);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        if (options.signal?.aborted) {
          throw new ApiError({
            message: 'درخواست توسط کاربر لغو شد.',
            statusCode: 499,
            code: 'CLIENT_ABORTED',
            isNetworkError: false,
          });
        }
        throw ApiError.fromTimeout(effectiveTimeout);
      }

      throw ApiError.fromNetworkError(error);
    }
  }

  public get<T = unknown>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  public put<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  public patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  public delete<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  public upload<T = unknown>(
    path: string,
    formData: FormData,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }

  // ==========================================
  // Internal Helpers
  // ==========================================

  private buildUrl(path: string, params?: Record<string, QueryParamValue | QueryParamValue[]>): string {
    let targetUrl: string;

    if (/^https?:\/\//i.test(path)) {
      targetUrl = path;
    } else {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      targetUrl = `${this.baseUrl}${cleanPath}`;
    }

    if (!params) {
      return targetUrl;
    }

    const queryParts: string[] = [];
    for (const [key, rawValue] of Object.entries(params)) {
      if (rawValue === undefined || rawValue === null || rawValue === '') {
        continue;
      }

      if (Array.isArray(rawValue)) {
        for (const item of rawValue) {
          if (item !== undefined && item !== null && item !== '') {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
          }
        }
      } else {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(rawValue))}`);
      }
    }

    if (queryParts.length === 0) {
      return targetUrl;
    }

    const delimiter = targetUrl.includes('?') ? '&' : '?';
    return `${targetUrl}${delimiter}${queryParts.join('&')}`;
  }

  private buildHeaders(options: RequestOptions): Headers {
    const headers = new Headers();

    for (const [key, value] of Object.entries(this.defaultHeaders)) {
      headers.set(key, value);
    }

    // Default JSON content-type if body is JSON-serializable
    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (options.body !== undefined && options.body !== null && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    // Authorization Bearer token attachment
    if (options.auth !== false) {
      const token = options.token || this.tokenManager.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value);
      }
    }

    return headers;
  }

  private async parseResponseBody<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!isJson) {
      const rawText = await response.text();
      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          message: rawText,
          data: (rawText as unknown) as T,
          meta: null,
        };
      }
      return {
        success: false,
        statusCode: response.status,
        error: {
          code: `HTTP_${response.status}`,
          message: rawText || `خطای سرور (${response.status})`,
        },
      };
    }

    try {
      const json = await response.json();
      return json as ApiResponse<T>;
    } catch {
      return {
        success: false,
        statusCode: response.status,
        error: {
          code: 'JSON_PARSE_ERROR',
          message: 'خطا در پردازش پاسخ سرور',
        },
      };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
