/**
 * DYF API Client — Token & Session Storage Management
 * Safely manages bearer tokens with localStorage & memory fallbacks.
 */

export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  hasToken(): boolean;
  clear(): void;
}

export const DEFAULT_ADMIN_TOKEN_KEY = 'dyf_admin_token';
export const DEFAULT_CATALOG_TOKEN_KEY = 'dyf_catalog_token';

export class TokenManager implements TokenStorage {
  private key: string;
  private memoryFallback: string | null = null;

  constructor(key: string = DEFAULT_ADMIN_TOKEN_KEY) {
    this.key = key;
  }

  public getToken(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(this.key) || this.memoryFallback;
      }
    } catch {
      // SecurityError / quota errors
    }
    return this.memoryFallback;
  }

  public setToken(token: string): void {
    const trimmed = (token || '').trim();
    this.memoryFallback = trimmed || null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (trimmed) {
          window.localStorage.setItem(this.key, trimmed);
        } else {
          window.localStorage.removeItem(this.key);
        }
      }
    } catch {
      // Ignore localStorage write failures
    }
  }

  public removeToken(): void {
    this.memoryFallback = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.key);
      }
    } catch {
      // Ignore
    }
  }

  public hasToken(): boolean {
    const token = this.getToken();
    return Boolean(token && token.length > 0);
  }

  public clear(): void {
    this.removeToken();
  }
}

export const adminTokenManager = new TokenManager(DEFAULT_ADMIN_TOKEN_KEY);
export const catalogTokenManager = new TokenManager(DEFAULT_CATALOG_TOKEN_KEY);
