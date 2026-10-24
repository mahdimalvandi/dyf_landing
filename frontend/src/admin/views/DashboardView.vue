<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dashboardService } from '@/shared/api/services';
import type { DashboardResponse, LinkItemResponse, CustomerResponse } from '@/shared/api/types';

const isLoading = ref(true);
const dashboardData = ref<DashboardResponse | null>(null);

const todayFaDate = ref('دوشنبه ۲۸ مهر ۱۴۰۵ — ساعت ۱۰:۳۰');

onMounted(async () => {
  try {
    const res = await dashboardService.getOverview();
    if (res.success && res.data) {
      dashboardData.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="dyf-view is-active">
    <!-- بنر خوش‌آمدگویی هیرو -->
    <div class="dyf-dashboard-hero">
      <div class="dyf-dashboard-hero-text">
        <h1>پیشخوان مدیریت کاتالوگ خصوصی DYF</h1>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <div class="dyf-date-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <span>{{ todayFaDate }}</span>
        </div>
      </div>
    </div>

    <!-- گرید ۴ کارت شاخص KPI -->
    <div class="dyf-stats-grid">
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
        <div class="dyf-stat-value">
          {{ dashboardData?.stats?.activeShoesCount ?? 18 }}
          <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">مدل</span>
        </div>
      </div>

      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">مشتریان و بنکداران همکار</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: block; margin: auto;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
        <div class="dyf-stat-value">
          {{ dashboardData?.stats?.totalCustomersCount ?? 24 }}
          <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">مشتری</span>
        </div>
      </div>

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
        <div class="dyf-stat-value">
          {{ dashboardData?.stats?.activeLinksCount ?? 9 }}
          <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">لینک فعال</span>
        </div>
      </div>

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
        <div class="dyf-stat-value">
          {{ dashboardData?.stats?.last7DaysViewsCount ?? 142 }}
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
                <tr v-for="link in dashboardData?.recentLinks || []" :key="link.ID">
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
                    <span
                      class="dyf-badge"
                      :class="link.isActive ? 'dyf-badge-active' : 'dyf-badge-expired'"
                    >
                      {{ link.isActive ? 'فعال' : 'منقضی' }}
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
                <tr v-for="c in dashboardData?.recentCustomers || []" :key="c.ID">
                  <td style="font-weight: 700; color: var(--text-ivory);">
                    {{ c.firstNameFa }} {{ c.lastNameFa }}
                  </td>
                  <td>{{ c.storeName || '-' }}</td>
                  <td>
                    <span class="dyf-badge dyf-badge-active">فعال</span>
                  </td>
                </tr>
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
