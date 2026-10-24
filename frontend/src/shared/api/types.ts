/**
 * DYF API Client — TypeScript Types & Interfaces
 * Matches Go Fiber backend envelope, DTOs, and error models.
 */

// ==========================================
// 1. Generic API Response Envelope
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: ApiMeta | null;
  error?: ApiErrorInfo;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorInfo {
  code: string;
  message: string;
  details?: ValidationErrorDetail[] | unknown;
}

export interface ValidationErrorDetail {
  field: string;
  issue: string;
}

// ==========================================
// 2. HTTP & Request Configuration
// ==========================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParamValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, QueryParamValue | QueryParamValue[]>;
  body?: unknown;
  timeout?: number;
  auth?: boolean;
  token?: string;
  signal?: AbortSignal;
}

export interface ApiClientConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  onUnauthorized?: () => void | Promise<void>;
}

// ==========================================
// 3. Domain Models: Auth
// ==========================================

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface SendOtpResponse {
  expiresInSeconds: number;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  code: string;
}

export interface AdminProfileResponse {
  ID: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface VerifyOtpResponse {
  admin: AdminProfileResponse;
  token: string;
}

// ==========================================
// 4. Domain Models: Category
// ==========================================

export interface CategoryResponse {
  ID: number;
  title: string;
  shoeCount: number;
}

export interface CreateCategoryRequest {
  title: string;
}

export interface UpdateCategoryRequest {
  title: string;
}

// ==========================================
// 5. Domain Models: Shoe
// ==========================================

export interface ShoeCategorySummary {
  ID: number;
  title: string;
}

export interface ShoeItemResponse {
  ID: number;
  modelID: number;
  title: string;
  description: string;
  coverImage: string;
  categories: ShoeCategorySummary[];
  colors: string[];
  colorsCount: number;
  sizes: number[];
  sizesCount: number;
  images: string[];
  videos: string[];
}

export interface ShoeDetailResponse extends ShoeItemResponse {
  categoryIDs: number[];
}

export interface ShoeListResponse {
  items: ShoeItemResponse[];
  pagination: ApiMeta;
}

export interface CreateShoeRequest {
  title: string;
  description?: string;
  coverImage?: string;
  categoryIDs: number[];
  colors?: string[];
  sizes?: number[];
  images?: string[];
  videos?: string[];
}

export interface UpdateShoeRequest {
  title: string;
  description?: string;
  coverImage?: string;
  categoryIDs: number[];
  colors?: string[];
  sizes?: number[];
  images?: string[];
  videos?: string[];
}

export interface SetCoverRequest {
  coverImage: string;
}

export interface RemoveMediaRequest {
  mediaURL: string;
}

export interface UploadMediaResponse {
  url: string;
  fileType: string;
  fileSize: number;
}

export interface ListShoesFilter {
  page?: number;
  limit?: number;
  categoryID?: number;
  search?: string;
}

// ==========================================
// 6. Domain Models: Customer
// ==========================================

export interface CustomerResponse {
  ID: number;
  firstNameFa: string;
  lastNameFa: string;
  firstNameEn?: string;
  lastNameEn?: string;
  storeName?: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface CustomerListResponse {
  items: CustomerResponse[];
  pagination: ApiMeta;
}

export interface CreateCustomerRequest {
  firstNameFa: string;
  lastNameFa: string;
  firstNameEn?: string;
  lastNameEn?: string;
  storeName?: string;
  phoneNumber: string;
  isActive?: boolean;
}

export interface UpdateCustomerRequest {
  firstNameFa: string;
  lastNameFa: string;
  firstNameEn?: string;
  lastNameEn?: string;
  storeName?: string;
  phoneNumber: string;
  isActive?: boolean;
}

export interface ChangeCustomerStatusRequest {
  isActive: boolean;
}

export interface ListCustomersFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | string;
}

// ==========================================
// 7. Domain Models: Access Links & VIP Catalog
// ==========================================

export type LinkAuthMethod = 'DIRECT' | 'OTP' | string;
export type LinkStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'INACTIVE' | string;

export interface LinkItemResponse {
  ID: number;
  linkID: number;
  token: string;
  url: string;
  customerID: number;
  recipientName: string;
  phoneNumber: string;
  authMethod: LinkAuthMethod;
  shoesCount: number;
  viewingDurationMinutes: number;
  expiresAt: number;
  firstViewedAt: number;
  viewingExpiresAt: number;
  isActive: boolean;
  status: LinkStatus;
  lastAccessedAt: number;
}

export interface LinkDetailResponse extends LinkItemResponse {
  shoeIDs: number[];
}

export interface LinkListResponse {
  items: LinkItemResponse[];
  pagination: ApiMeta;
}

export interface CreateLinkRequest {
  customerID?: number;
  recipientName: string;
  phoneNumber?: string;
  authMethod?: LinkAuthMethod;
  shoeIDs: number[];
  viewingDurationMinutes?: number;
  expiresAt?: number;
}

export interface UpdateLinkRequest {
  customerID?: number;
  recipientName: string;
  phoneNumber?: string;
  authMethod?: LinkAuthMethod;
  shoeIDs: number[];
  viewingDurationMinutes?: number;
  expiresAt?: number;
}

export interface ListLinksFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerID?: number;
}

export interface CatalogAccessResponse {
  linkID: number;
  recipientName: string;
  authMethod: LinkAuthMethod;
  status: LinkStatus;
  firstViewedAt: number;
  viewingExpiresAt: number;
  lastAccessedAt: number;
  remainingSeconds: number;
  shoesCount: number;
}

export interface CatalogStatsResponse {
  last7DaysViews: number;
  totalAccessedLinks: number;
}

// ==========================================
// 8. Domain Models: Dashboard
// ==========================================

export interface DashboardStats {
  activeShoesCount: number;
  totalCustomersCount: number;
  activeLinksCount: number;
  last7DaysViewsCount: number;
}

export interface RecentLinkItem {
  ID: number;
  linkID: number;
  token: string;
  url: string;
  recipientName: string;
  phoneNumber: string;
  shoesCount: number;
  viewingDurationMinutes: number;
  expiresAt: number;
  firstViewedAt: number;
  viewingExpiresAt: number;
  lastAccessedAt: number;
  isActive: boolean;
  status: LinkStatus;
}

export interface RecentCustomerItem {
  ID: number;
  firstNameFa: string;
  lastNameFa: string;
  firstNameEn: string;
  lastNameEn: string;
  storeName: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentLinks: RecentLinkItem[];
  recentCustomers: RecentCustomerItem[];
}

// ==========================================
// 9. Documented Backend Gaps Interfaces
// ==========================================

/**
 * BE-GAP-01: Endpoint to retrieve shoes assigned to a catalog link token.
 * Projected endpoint: GET /api/v1/catalog/:token/shoes
 */
export interface CatalogShoesGapResponse {
  linkID: number;
  recipientName: string;
  items: ShoeItemResponse[];
}

/**
 * BE-GAP-02: Endpoints to verify OTP for VIP customers accessing a catalog link.
 * Projected endpoints:
 *   POST /api/v1/catalog/:token/otp/send
 *   POST /api/v1/catalog/:token/otp/verify
 */
export interface CatalogOtpSendGapRequest {
  phoneNumber: string;
}

export interface CatalogOtpVerifyGapRequest {
  phoneNumber: string;
  code: string;
}
