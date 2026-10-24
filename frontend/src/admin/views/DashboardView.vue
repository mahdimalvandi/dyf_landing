<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { dashboardService } from '@/shared/api/services';
import type { DashboardResponse, LinkItemResponse } from '@/shared/api/types';

const isLoading = ref(true);
const isRefreshing = ref(false);
const fetchError = ref<string | null>(null);
const dashboardData = ref<DashboardResponse | null>(null);

// Persian Solar Date Formatting
const todayFaDate = computed(() => {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(new Date());
  } catch {
    return 'امروز';
  }
});

async function loadDashboard(showRefreshing = false) {
  if (showRefreshing) isRefreshing.value = true;
  else isLoading.value = true;
  fetchError.value = null;

  try {
    const res = await dashboardService.getOverview();
    if (res.success && res.data) {
      dashboardData.value = res.data;
    } else {
      fetchError.value = res.message || 'خطا در دریافت اطلاعات پیشخوان';
    }
  } catch (err: any) {
    fetchError.value = err.message || 'عدم برقراری ارتباط با سرور';
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
}

onMounted(() => {
  loadDashboard();
});

// Check for links expiring within 24 hours or already expired
const expiringLinksCount = computed(() => {
  if (!dashboardData.value?.recentLinks) return 0;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return dashboardData.value.recentLinks.filter((link) => {
    if (link.isExpired) return true;
    const targetDate = link.validUntil || link.expiresAt;
    if (!targetDate) return false;
    const expiryTime = new Date(targetDate).getTime();
    return expiryTime > now && expiryTime - now < dayMs;
  }).length;
});

function getLinkBadgeClass(link: LinkItemResponse) {
  if (link.isExpired || !link.isActive) return 'dyf-badge-expired';
  const targetDate = link.validUntil || link.expiresAt;
  if (targetDate) {
    const expiryTime = new Date(targetDate).getTime();
    const now = Date.now();
    if (expiryTime > now && expiryTime - now < 24 * 60 * 60 * 1000) {
      return 'dyf-badge-pending';
    }
  }
  return 'dyf-badge-active';
}

function getLinkStatusLabel(link: LinkItemResponse) {
  if (link.isExpired || !link.isActive) return 'منقضی شده';
  const targetDate = link.validUntil || link.expiresAt;
  if (targetDate) {
    const expiryTime = new Date(targetDate).getTime();
    const now = Date.now();
    if (expiryTime > now && expiryTime - now < 24 * 60 * 60 * 1000) {
      return 'در آستانه انقضا';
    }
  }
  return 'فعال';
}
</script>

<template>
  <section class="dyf-view is-active">
    <!-- بنر خوش‌آمدگویی هیرو -->
    <div class="dyf-dashboard-hero">
      <div class="dyf-dashboard-hero-text">
        <h1>پیشخوان مدیریت کاتالوگ خصوصی DYF</h1>
      </div>
      <div class="dyf-dashboard-hero-meta" style="display: flex; gap: 0.75rem; align-items: center;">
        <div class="dyf-date-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <span>{{ todayFaDate }}</span>
        </div>

        <button
          type="button"
          class="dyf-btn dyf-btn-outline dyf-btn-sm"
          :disabled="isLoading || isRefreshing"
          title="به‌روزرسانی آمار"
          @click="loadDashboard(true)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            :class="{ 'dyf-spin': isRefreshing }"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          <span>{{ isRefreshing ? 'در حال دریافت...' : 'تازه سازی' }}</span>
        </button>
      </div>
    </div>

    <!-- هشدار وضعیت و خطای ارتباط -->
    <div v-if="fetchError" class="dyf-alert dyf-alert-danger" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <span>{{ fetchError }}</span>
      <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-xs" @click="loadDashboard()">تلاش مجدد</button>
    </div>

    <!-- اعلان هشدارهای انقضای لینک‌ها -->
    <div
      v-if="expiringLinksCount > 0"
      class="dyf-alert dyf-alert-warning"
      style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; background: rgba(224, 159, 36, 0.12); border: 1px solid rgba(224, 159, 36, 0.4); padding: 0.85rem 1.2rem; border-radius: var(--r-sm);"
    >
      <div style="display: flex; align-items: center; gap: 0.75rem; color: #e5a93c;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <span style="font-size: 0.86rem; font-weight: 500;">
          توجه: {{ expiringLinksCount }} لینک اختصاصی در آستانه پایان مهلت مشاهده یا منقضی‌شده می‌باشند.
        </span>
      </div>
      <router-link to="/access-links" class="dyf-btn dyf-btn-outline dyf-btn-xs">
        بررسی لینک‌ها
      </router-link>
    </div>

    <!-- گرید ۴ کارت شاخص KPI با ساپورت اسکلتون -->
    <div class="dyf-stats-grid">
      <!-- کارت ۱: مدل‌های کفش -->
      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">مدل‌های فعال در کاتالوگ</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 18h16" />
              <path d="M4 14l3-6 4 2 5-4 4 8H4z" />
            </svg>
          </div>
        </div>
        <div v-if="isLoading" class="dyf-skeleton" style="height: 38px; width: 80px; margin-top: 0.5rem;"></div>
        <div v-else class="dyf-stat-value">
          {{ dashboardData?.stats?.activeShoesCount ?? 0 }}
          <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">مدل</span>
        </div>
      </div>

      <!-- کارت ۲: مشتریان -->
      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">مشتریان و بنکداران همکار</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
        <div v-if="isLoading" class="dyf-skeleton" style="height: 38px; width: 80px; margin-top: 0.5rem;"></div>
        <div v-else class="dyf-stat-value">
          {{ dashboardData?.stats?.totalCustomersCount ?? 0 }}
          <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">مشتری</span>
        </div>
      </div>

      <!-- کارت ۳: لینک‌های فعال -->
      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">لینک‌های اختصاصی معتبر</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
        </div>
        <div v-if="isLoading" class="dyf-skeleton" style="height: 38px; width: 80px; margin-top: 0.5rem;"></div>
        <div v-else class="dyf-stat-value">
          {{ dashboardData?.stats?.activeLinksCount ?? 0 }}
          <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">لینک فعال</span>
        </div>
      </div>

      <!-- کارت ۴: بازدیدهای ۷ روز اخیر -->
      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">مشاهده کاتالوگ (۷ روز اخیر)</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>
        <div v-if="isLoading" class="dyf-skeleton" style="height: 38px; width: 80px; margin-top: 0.5rem;"></div>
        <div v-else class="dyf-stat-value">
          {{ dashboardData?.stats?.last7DaysViewsCount ?? 0 }}
          <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">بازدید</span>
        </div>
      </div>
    </div>

    <!-- چیدمان دو ستونه داشبورد -->
    <div class="dyf-dashboard-grid">
      <!-- ستون سمت راست: جدول لینک‌های اختصاصی اخیر -->
      <div class="dyf-dashboard-col">
        <div class="dyf-panel-card dyf-dashboard-card">
          <div class="dyf-panel-card-header">
            <h2 class="dyf-panel-card-title">آخرین لینک‌های دسترسی اختصاصی</h2>
            <div class="dyf-panel-card-actions">
              <router-link to="/access-links" class="dyf-btn dyf-btn-primary dyf-btn-sm">
                <span>مشاهده همه</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </router-link>
            </div>
          </div>

          <!-- جدول داده‌ها -->
          <div class="dyf-table-container">
            <table class="dyf-table">
              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>دریافت‌کننده</th>
                  <th>تعداد مدل</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <!-- ردیف‌های اسکلتون در زمان لودینگ -->
                <tr v-if="isLoading" v-for="i in 3" :key="`skel-link-${i}`">
                  <td><div class="dyf-skeleton" style="height: 20px; width: 65px;"></div></td>
                  <td><div class="dyf-skeleton" style="height: 20px; width: 110px;"></div></td>
                  <td><div class="dyf-skeleton" style="height: 20px; width: 50px;"></div></td>
                  <td><div class="dyf-skeleton" style="height: 20px; width: 60px;"></div></td>
                  <td><div class="dyf-skeleton" style="height: 24px; width: 65px;"></div></td>
                </tr>

                <!-- ردیف‌های داده واقعی -->
                <tr v-else v-for="link in dashboardData?.recentLinks || []" :key="link.ID">
                  <td>
                    <span class="dyf-code-tag">LNK-{{ link.linkID || link.ID }}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-ivory);">{{ link.recipientName }}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); direction: ltr; text-align: right;">
                      {{ link.phoneNumber || '-' }}
                    </div>
                  </td>
                  <td>{{ link.shoesCount }} مدل</td>
                  <td>
                    <span class="dyf-badge" :class="getLinkBadgeClass(link)">
                      {{ getLinkStatusLabel(link) }}
                    </span>
                  </td>
                  <td>
                    <a
                      :href="`catalog.html?token=${link.token.slice(0, 8)}`"
                      target="_blank"
                      class="dyf-btn dyf-btn-outline dyf-btn-xs"
                      title="مشاهده زنده"
                      rel="noopener noreferrer"
                    >
                      کاتالوگ
                    </a>
                  </td>
                </tr>

                <!-- حالت خالی -->
                <tr v-if="!dashboardData?.recentLinks?.length && !isLoading">
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    هنوز هیچ لینک اختصاصی ثبت نشده است.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ستون سمت چپ: مشتریان اخیر و عملیات سریع -->
      <div class="dyf-dashboard-col">
        <div class="dyf-panel-card dyf-dashboard-card">
          <div class="dyf-panel-card-header">
            <h2 class="dyf-panel-card-title">مشتریان و بنکداران اخیر</h2>
            <div class="dyf-panel-card-actions">
              <router-link to="/customers" class="dyf-btn dyf-btn-outline dyf-btn-sm">
                مدیریت مشتریان
              </router-link>
            </div>
          </div>

          <div class="dyf-table-container">
            <table class="dyf-table">
              <thead>
                <tr>
                  <th>نام همکار</th>
                  <th>فروشگاه / بنکداری</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                <!-- ردیف‌های اسکلتون مشتریان -->
                <tr v-if="isLoading" v-for="i in 3" :key="`skel-cust-${i}`">
                  <td><div class="dyf-skeleton" style="height: 20px; width: 100px;"></div></td>
                  <td><div class="dyf-skeleton" style="height: 20px; width: 120px;"></div></td>
                  <td><div class="dyf-skeleton" style="height: 20px; width: 50px;"></div></td>
                </tr>

                <!-- داده واقعی مشتریان -->
                <tr v-else v-for="c in dashboardData?.recentCustomers || []" :key="c.ID">
                  <td style="font-weight: 700; color: var(--text-ivory);">
                    {{ c.firstNameFa }} {{ c.lastNameFa }}
                  </td>
                  <td>{{ c.storeName || '-' }}</td>
                  <td>
                    <span class="dyf-badge dyf-badge-active">فعال</span>
                  </td>
                </tr>

                <!-- حالت خالی -->
                <tr v-if="!dashboardData?.recentCustomers?.length && !isLoading">
                  <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    هیچ مشتری ثبت‌شده‌ای یافت نشد.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dyf-spin {
  animation: spin 1s linear infinite;
}
</style>
