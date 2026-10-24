/**
 * DYF Mock API Handlers
 * Simulates all Go Fiber endpoints with precise envelopes, error structures,
 * and realistic pagination/filtering.
 */

import { mockDb } from './db';
import type { ApiResponse } from '@/shared/api/types';

export interface MockRequest {
  url: string;
  method: string;
  headers: Headers;
  body?: any;
}

export interface MockResponse {
  status: number;
  data: ApiResponse<any>;
}

export function handleMockRequest(req: MockRequest): MockResponse | null {
  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();
  const searchParams = parsedUrl.searchParams;

  // Only handle /api/v1 routes
  if (!pathname.startsWith('/api/v1')) {
    return null;
  }

  const subPath = pathname.replace('/api/v1', '') || '/';

  // Helper response builders
  const ok = <T>(data: T, message = '', meta: any = null, status = 200): MockResponse => ({
    status,
    data: {
      success: true,
      statusCode: status,
      message,
      data,
      meta,
    },
  });

  const err = (status: number, code: string, message: string, details?: any): MockResponse => ({
    status,
    data: {
      success: false,
      statusCode: status,
      error: {
        code,
        message,
        details,
      },
    },
  });

  // -------------------------------------------------------------
  // 1. Health Check
  // -------------------------------------------------------------
  if (subPath === '/health' && method === 'GET') {
    return ok({ status: 'ok', time: new Date().toISOString() });
  }

  // -------------------------------------------------------------
  // 2. Auth Endpoints (/auth/admin/*)
  // -------------------------------------------------------------
  if (subPath === '/auth/admin/otp/send' && method === 'POST') {
    const phone = req.body?.phoneNumber || '';
    if (!/^09\d{9}$/.test(phone)) {
      return err(400, 'validationFailed', 'شماره تلفن همراه باید ۱۱ رقم بوده و با ۰۹ آغاز شود', [
        { field: 'phoneNumber', issue: 'فرمت شماره همراه نامعتبر است' },
      ]);
    }
    return ok({ expiresInSeconds: 120 }, 'کد تایید با موفقیت ارسال شد');
  }

  if (subPath === '/auth/admin/otp/verify' && method === 'POST') {
    const phone = req.body?.phoneNumber || '';
    const code = req.body?.code || '';
    if (code.length < 4 || code.length > 6) {
      return err(400, 'invalidOTP', 'کد تایید وارد شده نادرست است');
    }
    const token = 'dev-admin-mock-token-0ea76e8c48e4978b295bdb02288e1122';
    mockDb.activeTokens.add(token);
    return ok(
      {
        admin: {
          ...mockDb.admin,
          phoneNumber: phone,
        },
        token,
      },
      'ورود با موفقیت انجام شد'
    );
  }

  if (subPath === '/auth/admin/logout' && method === 'POST') {
    return ok(null, 'با موفقیت خارج شدید');
  }

  if (subPath === '/auth/admin/me' && method === 'GET') {
    return ok(mockDb.admin, 'اطلاعات مدیر');
  }

  // -------------------------------------------------------------
  // 3. Dashboard (/dashboard)
  // -------------------------------------------------------------
  if (subPath === '/dashboard' && method === 'GET') {
    return ok(mockDb.getDashboardOverview(), 'اطلاعات داشبورد با موفقیت دریافت شد');
  }

  // -------------------------------------------------------------
  // 4. Categories Endpoints (/categories)
  // -------------------------------------------------------------
  if (subPath === '/categories' && method === 'GET') {
    return ok(mockDb.categories, 'فهرست دسته‌بندی‌ها');
  }

  if (subPath === '/categories' && method === 'POST') {
    const title = req.body?.title;
    if (!title || title.trim().length < 2) {
      return err(400, 'validationFailed', 'عنوان دسته‌بندی الزامی است');
    }
    const created = mockDb.createCategory(title);
    return ok(created, 'دسته‌بندی با موفقیت ایجاد شد', null, 201);
  }

  const catMatch = subPath.match(/^\/categories\/(\d+)$/);
  if (catMatch) {
    const catId = parseInt(catMatch[1], 10);
    if (method === 'GET') {
      const cat = mockDb.categories.find((c) => c.ID === catId);
      if (!cat) return err(404, 'categoryNotFound', 'دسته‌بندی مورد نظر یافت نشد');
      return ok(cat);
    }
    if (method === 'PUT') {
      const title = req.body?.title;
      if (!title) return err(400, 'validationFailed', 'عنوان الزامی است');
      const updated = mockDb.updateCategory(catId, title);
      if (!updated) return err(404, 'categoryNotFound', 'دسته‌بندی مورد نظر یافت نشد');
      return ok(updated, 'دسته‌بندی با موفقیت به‌روزرسانی شد');
    }
    if (method === 'DELETE') {
      const deleted = mockDb.deleteCategory(catId);
      if (!deleted) return err(404, 'categoryNotFound', 'دسته‌بندی مورد نظر یافت نشد');
      return ok(null, 'دسته‌بندی با موفقیت حذف شد');
    }
  }

  // -------------------------------------------------------------
  // 5. Shoes Endpoints (/shoes)
  // -------------------------------------------------------------
  if (subPath === '/shoes' && method === 'GET') {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const categoryID = parseInt(searchParams.get('categoryID') || '0', 10);
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    let filtered = [...mockDb.shoes];
    if (categoryID > 0) {
      filtered = filtered.filter((s) => s.categoryIDs.includes(categoryID));
    }
    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search) ||
          String(s.modelID).includes(search)
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedItems = filtered.slice(offset, offset + limit);

    return ok(
      {
        items: paginatedItems,
        pagination: { page, limit, total, totalPages },
      },
      'فهرست مدل‌های کفش'
    );
  }

  if (subPath === '/shoes' && method === 'POST') {
    const title = req.body?.title;
    if (!title) return err(400, 'validationFailed', 'عنوان کفش الزامی است');
    const created = mockDb.createShoe(req.body);
    return ok(created, 'مدل کفش با موفقیت ثبت شد', null, 201);
  }

  if (subPath === '/shoes/upload' && method === 'POST') {
    return ok(
      {
        url: 'assets/images/craft-sport.jpg',
        fileType: 'image/jpeg',
        fileSize: 276152,
      },
      'فایل با موفقیت آپلود شد'
    );
  }

  const shoeCoverMatch = subPath.match(/^\/shoes\/(\d+)\/cover$/);
  if (shoeCoverMatch && method === 'PUT') {
    const shoeId = parseInt(shoeCoverMatch[1], 10);
    const coverImage = req.body?.coverImage;
    const updated = mockDb.updateShoe(shoeId, { coverImage });
    if (!updated) return err(404, 'shoeNotFound', 'مدل کفش یافت نشد');
    return ok(updated, 'تصویر کاور با موفقیت تنظیم شد');
  }

  const shoeMediaMatch = subPath.match(/^\/shoes\/(\d+)\/media$/);
  if (shoeMediaMatch && method === 'DELETE') {
    const shoeId = parseInt(shoeMediaMatch[1], 10);
    const mediaURL = searchParams.get('mediaURL');
    const shoe = mockDb.shoes.find((s) => s.ID === shoeId);
    if (!shoe) return err(404, 'shoeNotFound', 'مدل کفش یافت نشد');
    if (mediaURL) {
      shoe.images = shoe.images.filter((img) => img !== mediaURL);
    }
    return ok(shoe, 'فایل رسانه حذف شد');
  }

  const shoeMatch = subPath.match(/^\/shoes\/(\d+)$/);
  if (shoeMatch) {
    const shoeId = parseInt(shoeMatch[1], 10);
    if (method === 'GET') {
      const shoe = mockDb.shoes.find((s) => s.ID === shoeId);
      if (!shoe) return err(404, 'shoeNotFound', 'مدل کفش مورد نظر یافت نشد');
      return ok(shoe);
    }
    if (method === 'PUT') {
      const updated = mockDb.updateShoe(shoeId, req.body);
      if (!updated) return err(404, 'shoeNotFound', 'مدل کفش مورد نظر یافت نشد');
      return ok(updated, 'مدل کفش با موفقیت به‌روزرسانی شد');
    }
    if (method === 'DELETE') {
      const deleted = mockDb.deleteShoe(shoeId);
      if (!deleted) return err(404, 'shoeNotFound', 'مدل کفش مورد نظر یافت نشد');
      return ok(null, 'مدل کفش با موفقیت حذف شد');
    }
  }

  // -------------------------------------------------------------
  // 6. Customers Endpoints (/customers)
  // -------------------------------------------------------------
  if (subPath === '/customers' && method === 'GET') {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const status = searchParams.get('status');

    let filtered = [...mockDb.customers];
    if (status === 'active') filtered = filtered.filter((c) => c.isActive);
    if (status === 'inactive') filtered = filtered.filter((c) => !c.isActive);
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.firstNameFa.toLowerCase().includes(search) ||
          c.lastNameFa.toLowerCase().includes(search) ||
          c.phoneNumber.includes(search) ||
          (c.storeName && c.storeName.toLowerCase().includes(search))
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedItems = filtered.slice(offset, offset + limit);

    return ok(
      {
        items: paginatedItems,
        pagination: { page, limit, total, totalPages },
      },
      'فهرست مشتریان'
    );
  }

  if (subPath === '/customers' && method === 'POST') {
    const created = mockDb.createCustomer(req.body);
    return ok(created, 'مشتری با موفقیت ثبت شد', null, 201);
  }

  const custStatusMatch = subPath.match(/^\/customers\/(\d+)\/status$/);
  if (custStatusMatch && method === 'PATCH') {
    const custId = parseInt(custStatusMatch[1], 10);
    const isActive = Boolean(req.body?.isActive);
    const updated = mockDb.updateCustomer(custId, { isActive });
    if (!updated) return err(404, 'customerNotFound', 'مشتری مورد نظر یافت نشد');
    return ok(updated, 'وضعیت مشتری به‌روزرسانی شد');
  }

  const custMatch = subPath.match(/^\/customers\/(\d+)$/);
  if (custMatch) {
    const custId = parseInt(custMatch[1], 10);
    if (method === 'GET') {
      const cust = mockDb.customers.find((c) => c.ID === custId);
      if (!cust) return err(404, 'customerNotFound', 'مشتری مورد نظر یافت نشد');
      return ok(cust);
    }
    if (method === 'PUT') {
      const updated = mockDb.updateCustomer(custId, req.body);
      if (!updated) return err(404, 'customerNotFound', 'مشتری مورد نظر یافت نشد');
      return ok(updated, 'اطلاعات مشتری به‌روزرسانی شد');
    }
    if (method === 'DELETE') {
      const deleted = mockDb.deleteCustomer(custId);
      if (!deleted) return err(404, 'customerNotFound', 'مشتری مورد نظر یافت نشد');
      return ok(null, 'مشتری با موفقیت حذف شد');
    }
  }

  // -------------------------------------------------------------
  // 7. Access Links Endpoints (/links)
  // -------------------------------------------------------------
  if (subPath === '/links' && method === 'GET') {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const status = searchParams.get('status');

    let filtered = [...mockDb.links];
    if (status) filtered = filtered.filter((l) => l.status === status);
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.recipientName.toLowerCase().includes(search) ||
          l.phoneNumber.includes(search) ||
          l.token.includes(search)
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedItems = filtered.slice(offset, offset + limit);

    return ok(
      {
        items: paginatedItems,
        pagination: { page, limit, total, totalPages },
      },
      'فهرست لینک‌های دسترسی'
    );
  }

  if (subPath === '/links' && method === 'POST') {
    const shoeIDs = req.body?.shoeIDs || [];
    if (!Array.isArray(shoeIDs) || shoeIDs.length === 0) {
      return err(400, 'noShoesSelectedForLink', 'حداقل یک مدل کفش باید برای این لینک انتخاب شود');
    }
    const created = mockDb.createLink(req.body);
    return ok(created, 'لینک اختصاصی صادر شد', null, 201);
  }

  const linkRevokeMatch = subPath.match(/^\/links\/(\d+)\/revoke$/);
  if (linkRevokeMatch && method === 'PATCH') {
    const linkId = parseInt(linkRevokeMatch[1], 10);
    const revoked = mockDb.revokeLink(linkId);
    if (!revoked) return err(404, 'linkNotFound', 'لینک مورد نظر یافت نشد');
    return ok(revoked, 'لینک با موفقیت باطل شد');
  }

  const linkReactivateMatch = subPath.match(/^\/links\/(\d+)\/reactivate$/);
  if (linkReactivateMatch && method === 'PATCH') {
    const linkId = parseInt(linkReactivateMatch[1], 10);
    const reactivated = mockDb.reactivateLink(linkId);
    if (!reactivated) return err(404, 'linkNotFound', 'لینک مورد نظر یافت نشد');
    return ok(reactivated, 'لینک مجدداً فعال شد');
  }

  const linkMatch = subPath.match(/^\/links\/(\d+)$/);
  if (linkMatch) {
    const linkId = parseInt(linkMatch[1], 10);
    if (method === 'GET') {
      const link = mockDb.links.find((l) => l.ID === linkId);
      if (!link) return err(404, 'linkNotFound', 'لینک مورد نظر یافت نشد');
      return ok(link);
    }
    if (method === 'PUT') {
      const updated = mockDb.updateLink(linkId, req.body);
      if (!updated) return err(404, 'linkNotFound', 'لینک مورد نظر یافت نشد');
      return ok(updated, 'لینک با موفقیت به‌روزرسانی شد');
    }
    if (method === 'DELETE') {
      const deleted = mockDb.deleteLink(linkId);
      if (!deleted) return err(404, 'linkNotFound', 'لینک مورد نظر یافت نشد');
      return ok(null, 'لینک با موفقیت حذف شد');
    }
  }

  // -------------------------------------------------------------
  // 8. Catalog Endpoints (/catalog/*)
  // -------------------------------------------------------------
  if (subPath === '/catalog/stats/views' && method === 'GET') {
    return ok({
      last7DaysViews: 14,
      totalAccessedLinks: 42,
    });
  }

  const catalogAccessMatch = subPath.match(/^\/catalog\/([a-zA-Z0-9]+)\/access$/);
  if (catalogAccessMatch && method === 'POST') {
    const token = catalogAccessMatch[1];
    const link = mockDb.links.find((l) => l.token.startsWith(token) || token.startsWith(l.token.slice(0, 8)));
    if (!link) {
      return err(404, 'linkNotFound', 'لینک دسترسی معتبر نیست یا وجود ندارد');
    }
    if (!link.isActive || link.status === 'INACTIVE') {
      return err(403, 'linkInactive', 'این لینک توسط مدیریت غیرفعال شده است');
    }
    if (link.status === 'EXPIRED') {
      return err(410, 'linkExpired', 'مهلت زمانی این لینک به پایان رسیده است');
    }

    link.lastAccessedAt = Math.floor(Date.now() / 1000);
    if (link.firstViewedAt === 0) {
      link.firstViewedAt = link.lastAccessedAt;
      link.status = 'ACTIVE';
      if (link.viewingDurationMinutes > 0) {
        link.viewingExpiresAt = link.firstViewedAt + link.viewingDurationMinutes * 60;
      }
    }

    const remaining = link.viewingExpiresAt > 0 ? Math.max(0, link.viewingExpiresAt - link.lastAccessedAt) : 86400;

    return ok(
      {
        linkID: link.linkID,
        recipientName: link.recipientName,
        authMethod: link.authMethod,
        status: link.status,
        firstViewedAt: link.firstViewedAt,
        viewingExpiresAt: link.viewingExpiresAt,
        lastAccessedAt: link.lastAccessedAt,
        remainingSeconds: remaining,
        shoesCount: link.shoesCount,
      },
      'ورود به کاتالوگ با موفقیت ثبت شد'
    );
  }

  // BE-GAP-01: Catalog shoes
  const catalogShoesMatch = subPath.match(/^\/catalog\/([a-zA-Z0-9]+)\/shoes$/);
  if (catalogShoesMatch && method === 'GET') {
    const token = catalogShoesMatch[1];
    const link = mockDb.links.find((l) => l.token.startsWith(token) || token.startsWith(l.token.slice(0, 8)));
    if (!link) return err(404, 'linkNotFound', 'لینک مورد نظر یافت نشد');

    const authorizedShoes = mockDb.shoes.filter((s) => link.shoeIDs.includes(s.ID));
    return ok(
      {
        linkID: link.linkID,
        recipientName: link.recipientName,
        items: authorizedShoes,
      },
      'فهرست مدل‌های کفش کاتالوگ'
    );
  }

  // BE-GAP-02: Customer OTP Send & Verify
  const catalogOtpSendMatch = subPath.match(/^\/catalog\/([a-zA-Z0-9]+)\/otp\/send$/);
  if (catalogOtpSendMatch && method === 'POST') {
    return ok({ expiresInSeconds: 120 }, 'کد تایید با موفقیت ارسال شد');
  }

  const catalogOtpVerifyMatch = subPath.match(/^\/catalog\/([a-zA-Z0-9]+)\/otp\/verify$/);
  if (catalogOtpVerifyMatch && method === 'POST') {
    const token = catalogOtpVerifyMatch[1];
    const link = mockDb.links.find((l) => l.token.startsWith(token) || token.startsWith(l.token.slice(0, 8)));
    if (!link) return err(404, 'linkNotFound', 'لینک مورد نظر یافت نشد');

    return ok(
      {
        linkID: link.linkID,
        recipientName: link.recipientName,
        authMethod: link.authMethod,
        status: 'ACTIVE',
        firstViewedAt: Math.floor(Date.now() / 1000),
        viewingExpiresAt: Math.floor(Date.now() / 1000) + 7200,
        lastAccessedAt: Math.floor(Date.now() / 1000),
        remainingSeconds: 7200,
        shoesCount: link.shoesCount,
      },
      'ورود خریدار با موفقیت انجام شد'
    );
  }

  // Customer direct catalog endpoints
  if (subPath === '/customer/shoes' || subPath === '/catalog/shoes') {
    return ok({ items: mockDb.shoes }, 'فهرست مدل‌های کفش');
  }

  // Fallback 404 for unhandled /api/v1 paths
  return err(404, 'notFound', `مسیر ${pathname} در ماک سرور تعریف نشده است`);
}
