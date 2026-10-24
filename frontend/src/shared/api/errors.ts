/**
 * DYF API Client — Error Handling & Custom Exceptions
 * Captures Go Fiber error format and network faults.
 */

import type { ApiResponse, ApiErrorInfo, ValidationErrorDetail } from './types';

export interface ApiErrorInit {
  message: string;
  statusCode: number;
  code?: string;
  details?: ValidationErrorDetail[] | unknown;
  response?: ApiResponse<unknown> | null;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

export class ApiError extends Error {
  public override readonly name = 'ApiError';
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ValidationErrorDetail[] | unknown;
  public readonly response: ApiResponse<unknown> | null;
  public readonly isNetworkError: boolean;
  public readonly isTimeout: boolean;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.statusCode = init.statusCode;
    this.code = init.code || 'UNKNOWN_ERROR';
    this.details = init.details;
    this.response = init.response || null;
    this.isNetworkError = Boolean(init.isNetworkError);
    this.isTimeout = Boolean(init.isTimeout);

    // Maintain standard prototype chain in transpiled ES environments
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * True if the error indicates unauthorized access or expired token.
   */
  public get isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'unauthorized';
  }

  /**
   * True if the error indicates forbidden action (403) or inactive admin account.
   */
  public get isForbidden(): boolean {
    return this.statusCode === 403 || this.code === 'forbidden' || this.code === 'adminInactive';
  }

  /**
   * True if resource was not found (404).
   */
  public get isNotFound(): boolean {
    return (
      this.statusCode === 404 ||
      this.code === 'notFound' ||
      this.code === 'userNotFound' ||
      this.code === 'shoeNotFound' ||
      this.code === 'categoryNotFound' ||
      this.code === 'customerNotFound' ||
      this.code === 'linkNotFound'
    );
  }

  /**
   * True if request failed due to input validation errors.
   */
  public get isValidationError(): boolean {
    return (
      this.statusCode === 400 &&
      (this.code === 'validationFailed' || (Array.isArray(this.details) && this.details.length > 0))
    );
  }

  /**
   * Factory method to build ApiError from an HTTP response and parsed body.
   */
  public static fromEnvelope(
    status: number,
    envelope?: ApiResponse<unknown> | null,
    fallbackMessage?: string
  ): ApiError {
    const errorInfo: ApiErrorInfo | undefined = envelope?.error;
    const message =
      errorInfo?.message ||
      envelope?.message ||
      fallbackMessage ||
      `خطای سرور با کد ${status}`;

    return new ApiError({
      message,
      statusCode: status,
      code: errorInfo?.code || `HTTP_${status}`,
      details: errorInfo?.details,
      response: envelope || null,
      isNetworkError: false,
      isTimeout: false,
    });
  }

  /**
   * Factory method for connection drops, DNS issues, or CORS blocks.
   */
  public static fromNetworkError(cause: unknown): ApiError {
    const errorMsg = cause instanceof Error ? cause.message : 'خطای اتصال به شبکه';
    return new ApiError({
      message: 'برقراری ارتباط با سرور ممکن نیست. لطفاً اتصال اینترنت خود را بررسی کنید.',
      statusCode: 0,
      code: 'NETWORK_ERROR',
      details: errorMsg,
      response: null,
      isNetworkError: true,
      isTimeout: false,
    });
  }

  /**
   * Factory method for aborted requests due to timeout.
   */
  public static fromTimeout(timeoutMs: number): ApiError {
    return new ApiError({
      message: `زمان پاسخ‌گویی سرور به پایان رسید (${Math.round(timeoutMs / 1000)} ثانیه).`,
      statusCode: 408,
      code: 'REQUEST_TIMEOUT',
      details: { timeoutMs },
      response: null,
      isNetworkError: true,
      isTimeout: true,
    });
  }
}

/**
 * Type guard to check if an unknown error is an ApiError instance.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
