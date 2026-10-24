/**
 * DYF API — Services Façade
 * High-level services wrapping API client endpoints for views & stores.
 */

import {
  authApi,
  dashboardApi,
  categoriesApi,
  shoesApi,
  customersApi,
  linksApi,
  catalogApi,
} from './endpoints';
import { adminTokenManager } from './storage';
import type {
  AdminProfileResponse,
  ApiResponse,
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
  SendOtpResponse,
  ShoeDetailResponse,
  ShoeListResponse,
  UpdateCategoryRequest,
  UpdateCustomerRequest,
  UpdateLinkRequest,
  UpdateShoeRequest,
  UploadMediaResponse,
  VerifyOtpResponse,
} from './types';

export const tokenManager = adminTokenManager;

export const authService = {
  sendOtp: (phoneNumber: string): Promise<ApiResponse<SendOtpResponse>> => {
    return authApi.sendOtp({ phoneNumber });
  },
  verifyOtp: (phoneNumber: string, code: string): Promise<ApiResponse<VerifyOtpResponse>> => {
    return authApi.verifyOtp({ phoneNumber, code });
  },
  getMe: (): Promise<ApiResponse<AdminProfileResponse>> => {
    return authApi.getMe();
  },
  logout: (): Promise<ApiResponse<null>> => {
    return authApi.logout();
  },
};

export const dashboardService = {
  getOverview: (): Promise<ApiResponse<DashboardResponse>> => {
    return dashboardApi.getOverview();
  },
};

export const categoriesService = {
  getAll: (): Promise<ApiResponse<CategoryResponse[]>> => {
    return categoriesApi.list();
  },
  getById: (id: number): Promise<ApiResponse<CategoryResponse>> => {
    return categoriesApi.getById(id);
  },
  create: (data: CreateCategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    return categoriesApi.create(data);
  },
  update: (id: number, data: UpdateCategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    return categoriesApi.update(id, data);
  },
  delete: (id: number): Promise<ApiResponse<null>> => {
    return categoriesApi.delete(id);
  },
};

export const shoesService = {
  getAll: (filter: ListShoesFilter = {}): Promise<ApiResponse<ShoeListResponse>> => {
    return shoesApi.list(filter);
  },
  getById: (id: number): Promise<ApiResponse<ShoeDetailResponse>> => {
    return shoesApi.getById(id);
  },
  create: (data: CreateShoeRequest): Promise<ApiResponse<ShoeDetailResponse>> => {
    return shoesApi.create(data);
  },
  update: (id: number, data: UpdateShoeRequest): Promise<ApiResponse<ShoeDetailResponse>> => {
    return shoesApi.update(id, data);
  },
  delete: (id: number): Promise<ApiResponse<null>> => {
    return shoesApi.delete(id);
  },
  uploadMedia: (file: File | Blob): Promise<ApiResponse<UploadMediaResponse>> => {
    return shoesApi.upload(file);
  },
};

export const customersService = {
  getAll: (filter: ListCustomersFilter = {}): Promise<ApiResponse<CustomerListResponse>> => {
    return customersApi.list(filter);
  },
  getById: (id: number): Promise<ApiResponse<CustomerResponse>> => {
    return customersApi.getById(id);
  },
  create: (data: CreateCustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    return customersApi.create(data);
  },
  update: (id: number, data: UpdateCustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    return customersApi.update(id, data);
  },
  changeStatus: (id: number, data: ChangeCustomerStatusRequest): Promise<ApiResponse<CustomerResponse>> => {
    return customersApi.changeStatus(id, data);
  },
  delete: (id: number): Promise<ApiResponse<null>> => {
    return customersApi.delete(id);
  },
};

export const linksService = {
  getAll: (filter: ListLinksFilter = {}): Promise<ApiResponse<LinkListResponse>> => {
    return linksApi.list(filter);
  },
  getById: (id: number): Promise<ApiResponse<LinkDetailResponse>> => {
    return linksApi.getById(id);
  },
  create: (data: CreateLinkRequest): Promise<ApiResponse<LinkItemResponse>> => {
    return linksApi.create(data);
  },
  update: (id: number, data: UpdateLinkRequest): Promise<ApiResponse<LinkItemResponse>> => {
    return linksApi.update(id, data);
  },
  revoke: (id: number): Promise<ApiResponse<LinkItemResponse>> => {
    return linksApi.revoke(id);
  },
  reactivate: (id: number): Promise<ApiResponse<LinkItemResponse>> => {
    return linksApi.reactivate(id);
  },
  delete: (id: number): Promise<ApiResponse<null>> => {
    return linksApi.delete(id);
  },
};

export const catalogService = catalogApi;
