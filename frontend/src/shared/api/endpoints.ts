/**
 * DYF API Client — Strongly-Typed Endpoint Services
 * Direct mappings to Go Fiber routes defined in backend/cmd/server/routes/*.
 */

import { apiClient, ApiClient } from './client';
import type {
  AdminProfileResponse,
  ApiResponse,
  CatalogAccessResponse,
  CatalogOtpSendGapRequest,
  CatalogOtpVerifyGapRequest,
  CatalogShoesGapResponse,
  CatalogStatsResponse,
  CategoryResponse,
  ChangeCustomerStatusRequest,
  CreateCategoryRequest,
  CreateCustomerRequest,
  CreateLinkRequest,
  CreateShoeRequest,
  CustomerListResponse,
  CustomerResponse,
  DashboardResponse,
  LinkDetailResponse,
  LinkItemResponse,
  LinkListResponse,
  ListCustomersFilter,
  ListLinksFilter,
  ListShoesFilter,
  RemoveMediaRequest,
  SendOtpRequest,
  SendOtpResponse,
  SetCoverRequest,
  ShoeDetailResponse,
  ShoeListResponse,
  UpdateCategoryRequest,
  UpdateCustomerRequest,
  UpdateLinkRequest,
  UpdateShoeRequest,
  UploadMediaResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from './types';

// ==========================================
// 1. Auth Service (/api/v1/auth/admin/*)
// ==========================================

export const createAuthApi = (client: ApiClient = apiClient) => ({
  sendOtp: (data: SendOtpRequest): Promise<ApiResponse<SendOtpResponse>> => {
    return client.post<SendOtpResponse>('/auth/admin/otp/send', data, { auth: false });
  },

  verifyOtp: (data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> => {
    return client.post<VerifyOtpResponse>('/auth/admin/otp/verify', data, { auth: false });
  },

  logout: (): Promise<ApiResponse<null>> => {
    return client.post<null>('/auth/admin/logout');
  },

  getMe: (): Promise<ApiResponse<AdminProfileResponse>> => {
    return client.get<AdminProfileResponse>('/auth/admin/me');
  },
});

export const authApi = createAuthApi();

// ==========================================
// 2. Dashboard Service (/api/v1/dashboard)
// ==========================================

export const createDashboardApi = (client: ApiClient = apiClient) => ({
  getOverview: (): Promise<ApiResponse<DashboardResponse>> => {
    return client.get<DashboardResponse>('/dashboard');
  },
});

export const dashboardApi = createDashboardApi();

// ==========================================
// 3. Categories Service (/api/v1/categories)
// ==========================================

export const createCategoriesApi = (client: ApiClient = apiClient) => ({
  list: (): Promise<ApiResponse<CategoryResponse[]>> => {
    return client.get<CategoryResponse[]>('/categories', { auth: false });
  },

  getById: (id: number): Promise<ApiResponse<CategoryResponse>> => {
    return client.get<CategoryResponse>(`/categories/${id}`, { auth: false });
  },

  create: (data: CreateCategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    return client.post<CategoryResponse>('/categories', data);
  },

  update: (id: number, data: UpdateCategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    return client.put<CategoryResponse>(`/categories/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<null>> => {
    return client.delete<null>(`/categories/${id}`);
  },
});

export const categoriesApi = createCategoriesApi();

// ==========================================
// 4. Shoes Service (/api/v1/shoes)
// ==========================================

export const createShoesApi = (client: ApiClient = apiClient) => ({
  list: (filter: ListShoesFilter = {}): Promise<ApiResponse<ShoeListResponse>> => {
    return client.get<ShoeListResponse>('/shoes', {
      params: {
        page: filter.page,
        limit: filter.limit,
        categoryID: filter.categoryID,
        search: filter.search,
      },
    });
  },

  getById: (id: number): Promise<ApiResponse<ShoeDetailResponse>> => {
    return client.get<ShoeDetailResponse>(`/shoes/${id}`);
  },

  create: (data: CreateShoeRequest): Promise<ApiResponse<ShoeDetailResponse>> => {
    return client.post<ShoeDetailResponse>('/shoes', data);
  },

  update: (id: number, data: UpdateShoeRequest): Promise<ApiResponse<ShoeDetailResponse>> => {
    return client.put<ShoeDetailResponse>(`/shoes/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<null>> => {
    return client.delete<null>(`/shoes/${id}`);
  },

  setCover: (id: number, data: SetCoverRequest): Promise<ApiResponse<ShoeDetailResponse>> => {
    return client.put<ShoeDetailResponse>(`/shoes/${id}/cover`, data);
  },

  removeMedia: (id: number, data: RemoveMediaRequest): Promise<ApiResponse<ShoeDetailResponse>> => {
    return client.delete<ShoeDetailResponse>(`/shoes/${id}/media`, {
      params: { mediaURL: data.mediaURL },
    });
  },

  upload: (file: File | Blob): Promise<ApiResponse<UploadMediaResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    return client.upload<UploadMediaResponse>('/shoes/upload', formData);
  },
});

export const shoesApi = createShoesApi();

// ==========================================
// 5. Customers Service (/api/v1/customers)
// ==========================================

export const createCustomersApi = (client: ApiClient = apiClient) => ({
  list: (filter: ListCustomersFilter = {}): Promise<ApiResponse<CustomerListResponse>> => {
    return client.get<CustomerListResponse>('/customers', {
      params: {
        page: filter.page,
        limit: filter.limit,
        search: filter.search,
        status: filter.status,
      },
    });
  },

  getById: (id: number): Promise<ApiResponse<CustomerResponse>> => {
    return client.get<CustomerResponse>(`/customers/${id}`);
  },

  create: (data: CreateCustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    return client.post<CustomerResponse>('/customers', data);
  },

  update: (id: number, data: UpdateCustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    return client.put<CustomerResponse>(`/customers/${id}`, data);
  },

  changeStatus: (id: number, data: ChangeCustomerStatusRequest): Promise<ApiResponse<CustomerResponse>> => {
    return client.patch<CustomerResponse>(`/customers/${id}/status`, data);
  },

  delete: (id: number): Promise<ApiResponse<null>> => {
    return client.delete<null>(`/customers/${id}`);
  },
});

export const customersApi = createCustomersApi();

// ==========================================
// 6. Access Links Service (/api/v1/links)
// ==========================================

export const createLinksApi = (client: ApiClient = apiClient) => ({
  list: (filter: ListLinksFilter = {}): Promise<ApiResponse<LinkListResponse>> => {
    return client.get<LinkListResponse>('/links', {
      params: {
        page: filter.page,
        limit: filter.limit,
        search: filter.search,
        status: filter.status,
        customerID: filter.customerID,
      },
    });
  },

  getById: (id: number): Promise<ApiResponse<LinkDetailResponse>> => {
    return client.get<LinkDetailResponse>(`/links/${id}`);
  },

  create: (data: CreateLinkRequest): Promise<ApiResponse<LinkItemResponse>> => {
    return client.post<LinkItemResponse>('/links', data);
  },

  update: (id: number, data: UpdateLinkRequest): Promise<ApiResponse<LinkItemResponse>> => {
    return client.put<LinkItemResponse>(`/links/${id}`, data);
  },

  revoke: (id: number): Promise<ApiResponse<LinkItemResponse>> => {
    return client.patch<LinkItemResponse>(`/links/${id}/revoke`);
  },

  reactivate: (id: number): Promise<ApiResponse<LinkItemResponse>> => {
    return client.patch<LinkItemResponse>(`/links/${id}/reactivate`);
  },

  delete: (id: number): Promise<ApiResponse<null>> => {
    return client.delete<null>(`/links/${id}`);
  },
});

export const linksApi = createLinksApi();

// ==========================================
// 7. Catalog Service (/api/v1/catalog/*)
// ==========================================

export const createCatalogApi = (client: ApiClient = apiClient) => ({
  /**
   * Public link access verification & view tracking
   */
  access: (token: string): Promise<ApiResponse<CatalogAccessResponse>> => {
    return client.post<CatalogAccessResponse>(`/catalog/${token}/access`, null, { auth: false });
  },

  /**
   * Protected 7-day catalog views statistics
   */
  getStats: (): Promise<ApiResponse<CatalogStatsResponse>> => {
    return client.get<CatalogStatsResponse>('/catalog/stats/views');
  },

  /**
   * BE-GAP-01: Projected endpoint for fetching VIP shoes belonging to a link.
   */
  getShoes: (token: string, sessionToken?: string): Promise<ApiResponse<CatalogShoesGapResponse>> => {
    return client.get<CatalogShoesGapResponse>(`/catalog/${token}/shoes`, {
      token: sessionToken,
      auth: Boolean(sessionToken),
    });
  },

  /**
   * BE-GAP-02 Part A: Projected link customer OTP send
   */
  sendCustomerOtp: (
    token: string,
    data: CatalogOtpSendGapRequest
  ): Promise<ApiResponse<SendOtpResponse>> => {
    return client.post<SendOtpResponse>(`/catalog/${token}/otp/send`, data, { auth: false });
  },

  /**
   * BE-GAP-02 Part A: Projected link customer OTP verify
   */
  verifyCustomerOtp: (
    token: string,
    data: CatalogOtpVerifyGapRequest
  ): Promise<ApiResponse<CatalogAccessResponse>> => {
    return client.post<CatalogAccessResponse>(`/catalog/${token}/otp/verify`, data, { auth: false });
  },

  /**
   * BE-GAP-02 Part B: Direct VIP customer OTP send
   */
  sendDirectCustomerOtp: (
    data: CatalogOtpSendGapRequest
  ): Promise<ApiResponse<SendOtpResponse>> => {
    return client.post<SendOtpResponse>('/auth/customer/otp/send', data, { auth: false });
  },

  /**
   * BE-GAP-02 Part B: Direct VIP customer OTP verify
   */
  verifyDirectCustomerOtp: (
    data: CatalogOtpVerifyGapRequest
  ): Promise<ApiResponse<CatalogAccessResponse>> => {
    return client.post<CatalogAccessResponse>('/auth/customer/otp/verify', data, { auth: false });
  },

  /**
   * BE-GAP-02 Part B: Direct VIP customer shoe retrieval
   */
  getCustomerShoes: (sessionToken?: string): Promise<ApiResponse<CatalogShoesGapResponse>> => {
    return client.get<CatalogShoesGapResponse>('/customer/shoes', {
      token: sessionToken,
      auth: Boolean(sessionToken),
    });
  },
});

export const catalogApi = createCatalogApi();
