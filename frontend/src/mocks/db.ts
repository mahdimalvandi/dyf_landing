/**
 * DYF Mock In-Memory Database
 * Stateful development storage supporting CRUD, relationship synchronization,
 * and optional sessionStorage persistence.
 */

import {
  initialCategories,
  initialCustomers,
  initialLinks,
  initialShoes,
  mockAdminUser,
} from './data/fixtures';
import type {
  AdminProfileResponse,
  CategoryResponse,
  CustomerResponse,
  DashboardResponse,
  LinkDetailResponse,
  LinkItemResponse,
  ShoeDetailResponse,
  ShoeItemResponse,
} from '@/shared/api/types';

export interface OtpSession {
  phoneNumber: string;
  code: string;
  expiresAt: number;
  purpose: string;
}

const STORAGE_KEY = 'dyf_mock_db_v1';

export class MockDatabase {
  public admin: AdminProfileResponse = { ...mockAdminUser };
  public categories: CategoryResponse[] = [];
  public shoes: ShoeDetailResponse[] = [];
  public customers: CustomerResponse[] = [];
  public links: (LinkItemResponse & { shoeIDs: number[] })[] = [];
  public otps: OtpSession[] = [];
  public activeTokens = new Set<string>();

  constructor() {
    this.reset();
    this.loadFromStorage();
  }

  public reset(): void {
    this.admin = { ...mockAdminUser };
    this.categories = JSON.parse(JSON.stringify(initialCategories));
    this.shoes = JSON.parse(JSON.stringify(initialShoes));
    this.customers = JSON.parse(JSON.stringify(initialCustomers));
    this.links = JSON.parse(JSON.stringify(initialLinks));
    this.otps = [];
    this.activeTokens.clear();
    this.activeTokens.add('dev-admin-mock-token-0ea76e8c48e4978b295bdb02288e1122');
    this.recalculateCategoryCounts();
  }

  public saveToStorage(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const payload = JSON.stringify({
          categories: this.categories,
          shoes: this.shoes,
          customers: this.customers,
          links: this.links,
        });
        window.sessionStorage.setItem(STORAGE_KEY, payload);
      } catch {
        // Ignore quota/security errors
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const data = window.sessionStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed.categories)) this.categories = parsed.categories;
          if (Array.isArray(parsed.shoes)) this.shoes = parsed.shoes;
          if (Array.isArray(parsed.customers)) this.customers = parsed.customers;
          if (Array.isArray(parsed.links)) this.links = parsed.links;
        }
      } catch {
        // Fallback to fresh initial data
      }
    }
  }

  public recalculateCategoryCounts(): void {
    const counts: Record<number, number> = {};
    for (const cat of this.categories) {
      counts[cat.ID] = 0;
    }
    for (const shoe of this.shoes) {
      for (const catID of shoe.categoryIDs || []) {
        counts[catID] = (counts[catID] || 0) + 1;
      }
    }
    for (const cat of this.categories) {
      cat.shoeCount = counts[cat.ID] || 0;
    }
  }

  // -------------------------------------------------------------
  // Categories CRUD
  // -------------------------------------------------------------
  public createCategory(title: string): CategoryResponse {
    const newID = this.categories.reduce((max, c) => Math.max(max, c.ID), 0) + 1;
    const newCategory: CategoryResponse = {
      ID: newID,
      title: title.trim(),
      shoeCount: 0,
    };
    this.categories.push(newCategory);
    this.saveToStorage();
    return newCategory;
  }

  public updateCategory(id: number, title: string): CategoryResponse | null {
    const cat = this.categories.find((c) => c.ID === id);
    if (!cat) return null;
    cat.title = title.trim();
    // Update category titles inside shoes
    for (const shoe of this.shoes) {
      for (const sc of shoe.categories) {
        if (sc.ID === id) sc.title = cat.title;
      }
    }
    this.saveToStorage();
    return cat;
  }

  public deleteCategory(id: number): boolean {
    const index = this.categories.findIndex((c) => c.ID === id);
    if (index === -1) return false;
    this.categories.splice(index, 1);
    for (const shoe of this.shoes) {
      shoe.categoryIDs = shoe.categoryIDs.filter((cId) => cId !== id);
      shoe.categories = shoe.categories.filter((c) => c.ID !== id);
    }
    this.saveToStorage();
    return true;
  }

  // -------------------------------------------------------------
  // Shoes CRUD
  // -------------------------------------------------------------
  public createShoe(data: Partial<ShoeDetailResponse>): ShoeDetailResponse {
    const newID = this.shoes.reduce((max, s) => Math.max(max, s.ID), 100) + 1;
    const catIDs = data.categoryIDs || [];
    const categories = this.categories
      .filter((c) => catIDs.includes(c.ID))
      .map((c) => ({ ID: c.ID, title: c.title }));

    const newShoe: ShoeDetailResponse = {
      ID: newID,
      modelID: newID,
      title: data.title || `مدل جدید ${newID}`,
      description: data.description || '',
      coverImage: data.coverImage || 'assets/images/shoes.jpeg',
      categories,
      categoryIDs: catIDs,
      colors: data.colors || ['مشکی'],
      colorsCount: (data.colors || ['مشکی']).length,
      sizes: data.sizes || [40, 41, 42, 43],
      sizesCount: (data.sizes || [40, 41, 42, 43]).length,
      images: data.images || (data.coverImage ? [data.coverImage] : ['assets/images/shoes.jpeg']),
      videos: data.videos || [],
    };

    this.shoes.push(newShoe);
    this.recalculateCategoryCounts();
    this.saveToStorage();
    return newShoe;
  }

  public updateShoe(id: number, data: Partial<ShoeDetailResponse>): ShoeDetailResponse | null {
    const shoe = this.shoes.find((s) => s.ID === id);
    if (!shoe) return null;

    if (data.title) shoe.title = data.title;
    if (data.description !== undefined) shoe.description = data.description;
    if (data.coverImage) shoe.coverImage = data.coverImage;
    if (data.colors) {
      shoe.colors = data.colors;
      shoe.colorsCount = data.colors.length;
    }
    if (data.sizes) {
      shoe.sizes = data.sizes;
      shoe.sizesCount = data.sizes.length;
    }
    if (data.images) shoe.images = data.images;
    if (data.videos) shoe.videos = data.videos;

    if (data.categoryIDs) {
      shoe.categoryIDs = data.categoryIDs;
      shoe.categories = this.categories
        .filter((c) => data.categoryIDs!.includes(c.ID))
        .map((c) => ({ ID: c.ID, title: c.title }));
    }

    this.recalculateCategoryCounts();
    this.saveToStorage();
    return shoe;
  }

  public deleteShoe(id: number): boolean {
    const index = this.shoes.findIndex((s) => s.ID === id);
    if (index === -1) return false;
    this.shoes.splice(index, 1);
    this.recalculateCategoryCounts();
    this.saveToStorage();
    return true;
  }

  // -------------------------------------------------------------
  // Customers CRUD
  // -------------------------------------------------------------
  public createCustomer(data: Partial<CustomerResponse>): CustomerResponse {
    const newID = this.customers.reduce((max, c) => Math.max(max, c.ID), 100) + 1;
    const newCust: CustomerResponse = {
      ID: newID,
      firstNameFa: data.firstNameFa || 'مشتری',
      lastNameFa: data.lastNameFa || 'جدید',
      firstNameEn: data.firstNameEn || '',
      lastNameEn: data.lastNameEn || '',
      storeName: data.storeName || '',
      phoneNumber: data.phoneNumber || '09120000000',
      isActive: data.isActive ?? true,
    };
    this.customers.push(newCust);
    this.saveToStorage();
    return newCust;
  }

  public updateCustomer(id: number, data: Partial<CustomerResponse>): CustomerResponse | null {
    const cust = this.customers.find((c) => c.ID === id);
    if (!cust) return null;
    if (data.firstNameFa) cust.firstNameFa = data.firstNameFa;
    if (data.lastNameFa) cust.lastNameFa = data.lastNameFa;
    if (data.firstNameEn !== undefined) cust.firstNameEn = data.firstNameEn;
    if (data.lastNameEn !== undefined) cust.lastNameEn = data.lastNameEn;
    if (data.storeName !== undefined) cust.storeName = data.storeName;
    if (data.phoneNumber) cust.phoneNumber = data.phoneNumber;
    if (data.isActive !== undefined) cust.isActive = data.isActive;
    this.saveToStorage();
    return cust;
  }

  public deleteCustomer(id: number): boolean {
    const index = this.customers.findIndex((c) => c.ID === id);
    if (index === -1) return false;
    this.customers.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // -------------------------------------------------------------
  // Links CRUD
  // -------------------------------------------------------------
  public createLink(data: {
    customerID?: number;
    recipientName: string;
    phoneNumber?: string;
    authMethod?: string;
    shoeIDs: number[];
    viewingDurationMinutes?: number;
    expiresAt?: number;
  }): LinkDetailResponse {
    const newID = this.links.reduce((max, l) => Math.max(max, l.ID), 0) + 1;
    const linkID = 9080 + newID;
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const token = `${randomHex}${randomHex}`;

    const newLink: LinkItemResponse & { shoeIDs: number[] } = {
      ID: newID,
      linkID,
      token,
      url: `/catalog/${token}`,
      customerID: data.customerID || 0,
      recipientName: data.recipientName,
      phoneNumber: data.phoneNumber || '',
      authMethod: data.authMethod || 'DIRECT',
      shoesCount: data.shoeIDs.length,
      shoeIDs: data.shoeIDs,
      viewingDurationMinutes: data.viewingDurationMinutes || 0,
      expiresAt: data.expiresAt || Math.floor(Date.now() / 1000) + 86400 * 7,
      firstViewedAt: 0,
      viewingExpiresAt: 0,
      isActive: true,
      status: 'PENDING',
      lastAccessedAt: 0,
    };

    this.links.push(newLink);
    this.saveToStorage();
    return newLink;
  }

  public updateLink(
    id: number,
    data: {
      recipientName?: string;
      phoneNumber?: string;
      authMethod?: string;
      shoeIDs?: number[];
      viewingDurationMinutes?: number;
      expiresAt?: number;
    }
  ): LinkDetailResponse | null {
    const link = this.links.find((l) => l.ID === id);
    if (!link) return null;
    if (data.recipientName) link.recipientName = data.recipientName;
    if (data.phoneNumber !== undefined) link.phoneNumber = data.phoneNumber;
    if (data.authMethod) link.authMethod = data.authMethod;
    if (data.shoeIDs) {
      link.shoeIDs = data.shoeIDs;
      link.shoesCount = data.shoeIDs.length;
    }
    if (data.viewingDurationMinutes !== undefined) {
      link.viewingDurationMinutes = data.viewingDurationMinutes;
    }
    if (data.expiresAt !== undefined) link.expiresAt = data.expiresAt;
    this.saveToStorage();
    return link;
  }

  public revokeLink(id: number): LinkItemResponse | null {
    const link = this.links.find((l) => l.ID === id);
    if (!link) return null;
    link.isActive = false;
    link.status = 'INACTIVE';
    this.saveToStorage();
    return link;
  }

  public reactivateLink(id: number): LinkItemResponse | null {
    const link = this.links.find((l) => l.ID === id);
    if (!link) return null;
    link.isActive = true;
    link.status = 'ACTIVE';
    this.saveToStorage();
    return link;
  }

  public deleteLink(id: number): boolean {
    const index = this.links.findIndex((l) => l.ID === id);
    if (index === -1) return false;
    this.links.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // -------------------------------------------------------------
  // Dashboard Aggregation
  // -------------------------------------------------------------
  public getDashboardOverview(): DashboardResponse {
    const activeShoes = this.shoes.length;
    const totalCust = this.customers.length;
    const activeLinks = this.links.filter((l) => l.isActive && l.status === 'ACTIVE').length;
    const last7DaysViews = this.links.filter((l) => l.lastAccessedAt > 0).length + 10;

    const recentLinks = this.links
      .slice(-5)
      .reverse()
      .map((l) => ({
        ID: l.ID,
        linkID: l.linkID,
        token: l.token,
        url: l.url,
        recipientName: l.recipientName,
        phoneNumber: l.phoneNumber,
        shoesCount: l.shoesCount,
        viewingDurationMinutes: l.viewingDurationMinutes,
        expiresAt: l.expiresAt,
        firstViewedAt: l.firstViewedAt,
        viewingExpiresAt: l.viewingExpiresAt,
        lastAccessedAt: l.lastAccessedAt,
        isActive: l.isActive,
        status: l.status,
      }));

    const recentCustomers = this.customers.slice(-4).reverse();

    return {
      stats: {
        activeShoesCount: activeShoes,
        totalCustomersCount: totalCust,
        activeLinksCount: activeLinks,
        last7DaysViewsCount: last7DaysViews,
      },
      recentLinks,
      recentCustomers,
    };
  }
}

export const mockDb = new MockDatabase();
