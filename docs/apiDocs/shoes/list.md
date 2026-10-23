# مستند API: دریافت فهرست مدل‌های کفش (Get Shoes List)
**مسیر:** `docs/apiDocs/shoes/list.md`  
**خانواده API:** مدل‌های کفش (`shoes`)  
**دسترسی:** نیازمند توکن ادمین در هدر Authorization (در فاز حاضر)

---

## ۱. سناریو و محل فراخوانی در فرانت‌اند (UX Flow)
- **صفحه مدیریت مدل‌های کفش در پنل ادمین (`/admin/shoes`):**
  - نمایش جدول یا گرید کارت‌های محصولات کارگاه.
  - اعمال فیلتر بر اساس دسته‌بندی لاین محصول (`categoryID`).
  - جستجوی زنده بر اساس عنوان مدل یا کد کارگاهی (`search`).
  - کنترل صفحه‌بندی مینیمال (دکمه‌های ۱ ۲ ۳...).

---

## ۲. مشخصات فنی درخواست (Request Specification)

- **متد:** `GET`
- **مسیر (URL):** `/api/v1/shoes`
- **هدرهای الزامی:**
  ```http
  Accept: application/json
  Authorization: Bearer <ADMIN_TOKEN>
  ```

### ۲.۱. پارامترهای کوئری (Query Parameters)
| پارامتر | نوع | پیش‌فرض | الزامی | توضیحات |
|:---|:---:|:---:|:---:|:---|
| `page` | `int` | `1` | خیر | شماره صفحه |
| `limit` | `int` | `12` | خیر | تعداد آیتم در هر صفحه (حداکثر ۵۰) |
| `categoryID` | `int64` | - | خیر | فیلتر بر اساس شناسه دسته‌بندی مشخص |
| `search` | `string` | - | خیر | جستجو در عنوان کفش یا کد کارگاهی عددی (`modelID`) |

---

## ۳. پاسخ موفق (Success Response - 200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "فهرست مدل‌های کفش با موفقیت دریافت شد",
  "data": {
    "items": [
      {
        "ID": 1792761483100205500,
        "modelID": 1,
        "title": "کفش آکسفورد مدل ونیز",
        "description": "رویه چرم طبیعی گاوی درجه یک، زیره میکرولایت با دوخت دستی",
        "coverImage": "/uploads/shoes/1792761483100_oxford.jpg",
        "categories": [
          {
            "ID": 1792757059582788000,
            "title": "کفش رسمی دست‌دوز"
          }
        ],
        "colors": ["مشکی واکس‌خورده", "عسلی پتینه‌ای"],
        "colorsCount": 2,
        "sizes": [40, 41, 42, 43, 44],
        "sizesCount": 5,
        "images": [
          "/uploads/shoes/1792761483100_oxford.jpg",
          "/uploads/shoes/1792761483101_side.jpg"
        ],
        "videos": [
          "/uploads/shoes/1792761483102_making.mp4"
        ]
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

## ۴. نمونه کد فرانت‌اند (TypeScript / Axios Example)

```typescript
import axios from "axios";

export interface ShoeListItem {
  ID: number;
  modelID: number;
  title: string;
  description: string;
  coverImage: string;
  categories: { ID: number; title: string }[];
  colors: string[];
  colorsCount: number;
  sizes: number[];
  sizesCount: number;
  images: string[];
  videos: string[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ShoeListResponse {
  items: ShoeListItem[];
  pagination: Pagination;
}

export async function fetchShoes(params?: {
  page?: number;
  limit?: number;
  categoryID?: number;
  search?: string;
}): Promise<ShoeListResponse> {
  const token = localStorage.getItem("admin_token");
  const response = await axios.get<{
    data: ShoeListResponse;
  }>("http://localhost:8080/api/v1/shoes", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
}
```
