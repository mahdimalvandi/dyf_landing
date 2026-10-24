# مستند API: دریافت فهرست مشتریان (Get Customers List)
**مسیر:** `docs/apiDocs/customers/list.md`  
**خانواده API:** مشتریان و همکاران تجاری (`customers`)  
**دسترسی:** محافظت‌شده (نیازمند توکن ادمین در هدر Authorization)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه مدیریت مشتریان در پنل ادمین (`/admin/customers`):**
  - نمایش جدول مشتریان، فروشگاه‌ها و شماره تماس خریداران کارگاه.
  - اعمال فیلتر بر اساس وضعیت فعالیت حساب (`status`: `all`, `active`, `inactive`).
  - جستجوی زنده در نام، نام خانوادگی، نام فروشگاه یا شماره تماس (`search`).
  - صفحه‌بندی مینیمال جدول بر اساس اطلاعات ساختار `pagination`.

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/customers`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. پارامترهای کوئری (Query Parameters)
| پارامتر | نوع داده | پیش‌فرض | الزامی | توضیحات |
|:---|:---:|:---:|:---:|:---|
| `page` | `int` | `1` | خیر | شماره صفحه |
| `limit` | `int` | `12` | خیر | تعداد رکورد در هر صفحه (حداکثر ۵۰) |
| `search` | `string` | - | خیر | جستجو در نام فارسی/انگلیسی، نام فروشگاه یا شماره موبایل |
| `status` | `string` | `all` | خیر | فیلتر وضعیت: `active`، `inactive` یا `all` |

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "فهرست مشتریان با موفقیت دریافت شد",
  "data": {
    "items": [
      {
        "ID": 1792770000000000000,
        "firstNameFa": "علی",
        "lastNameFa": "محمدی",
        "firstNameEn": "Ali",
        "lastNameEn": "Mohammadi",
        "storeName": "بوتیک چرم پالادیوم",
        "phoneNumber": "09121112233",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 35,
      "totalPages": 3
    }
  },
  "meta": null
}
```

---

## ۴. سناریوهای خطا (Error Scenarios)

| کد وضعیت HTTP | کد خطا (`error.code`) | پیام فارسی سرور (`error.message`) | علت رخداد و اقدام پیشنهادی فرانت‌اند |
|:---:|:---|:---|:---|
| `401 Unauthorized` | `unauthorized` | احراز هویت انجام نشده است | توکن ادمین ارسال نشده یا منقضی شده است. کاربر به `/login` هدایت شود. |

---

## ۵. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export interface Customer {
  ID: number;
  firstNameFa: string;
  lastNameFa: string;
  firstNameEn: string;
  lastNameEn: string;
  storeName: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerListResponse {
  items: Customer[];
  pagination: Pagination;
}

export async function fetchCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "inactive";
}): Promise<CustomerListResponse> {
  const token = localStorage.getItem("admin_token");
  const response = await axios.get<{ data: CustomerListResponse }>(
    "http://localhost:8080/api/v1/customers",
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
}
```
