<template>
  <!-- ==================================================================
       ویو ۱: داشبورد اصلی (#dashboard)
       ================================================================== -->
  <section id="viewDashboard" class="dyf-view is-active">
    <!-- بنر خوش‌آمدگویی هیرو -->
    <div class="dyf-dashboard-hero">
      <div class="dyf-dashboard-hero-text">
        <h1>پیشخوان مدیریت کاتالوگ خصوصی DYF</h1>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <div class="dyf-date-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <span>دوشنبه ۲۸ مهر ۱۴۰۵ — ساعت ۱۰:۳۰</span>
        </div>
      </div>
    </div>

    <!-- گرید ۴ کارت شاخص KPI -->
    <div class="dyf-stats-grid">
      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">مدل‌های فعال در کاتالوگ</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18h16"/><path d="M4 14l3-6 4 2 5-4 4 8H4z"/></svg>
          </div>
        </div>
        <div class="dyf-stat-value">{{ stats.totalShoes }} <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">مدل</span></div>
      </div>

      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">مشتریان و بنکداران همکار</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: block; margin: auto;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
        <div class="dyf-stat-value">{{ stats.activeCustomers }} <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">مشتری</span></div>
      </div>

      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">لینک‌های اختصاصی معتبر</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
        </div>
        <div class="dyf-stat-value">{{ stats.activeLinks }} <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">لینک فعال</span></div>
      </div>

      <div class="dyf-stat-card">
        <div class="dyf-stat-header">
          <span class="dyf-stat-title">مشاهده کاتالوگ (۷ روز اخیر)</span>
          <div class="dyf-stat-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </div>
        <div class="dyf-stat-value">{{ stats.totalViews }} <span style="font-size: 1.05rem; font-weight: 500; color: var(--text-muted);">بازدید</span></div>
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
              <a href="#access-links" class="dyf-btn dyf-btn-primary dyf-btn-sm" @click.prevent="$emit('navigate', '#access-links')">
                <span>مشاهده همه</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
              </a>
            </div>
          </div>

          <!-- جدول داده‌ها -->
          <div class="dyf-table-container">
            <table class="dyf-table">
              <thead>
                <tr>
                  <th>گیرنده لینک</th>
                  <th>وضعیت</th>
                  <th class="dyf-col-expires">اعتبار و مهلت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody id="recentLinksTableBody">
                <tr v-for="lnk in recentLinks" :key="lnk.id" class="dyf-dashboard-tr">
                  <td class="dyf-td-recipient">
                    <div style="font-weight: 700; color: var(--text-ivory);">{{ lnk.recipientFa }}</div>
                  </td>
                  <td class="dyf-td-status">
                    <span v-if="lnk.status === 'active'" class="dyf-badge dyf-badge-active" style="white-space: nowrap;">فعال</span>
                    <span v-else-if="lnk.status === 'expired'" class="dyf-badge dyf-badge-expired" style="white-space: nowrap;">منقضی</span>
                    <span v-else class="dyf-badge dyf-badge-pending" style="white-space: nowrap;">در انتظار ورود</span>
                  </td>
                  <td class="dyf-td-expires">
                    <div style="font-size: 0.8rem; color: var(--text-muted); white-space: nowrap;">{{ lnk.expiresAt || formatDeadline(lnk.startDeadline) }}</div>
                    <div style="font-size: 0.7rem; color: var(--text-dim); white-space: nowrap;">{{ lnk.duration || formatDuration(lnk.viewingDuration) }}</div>
                  </td>
                  <td class="dyf-td-actions">
                    <div class="dyf-table-actions" style="display: flex; flex-direction: row; gap: 0.45rem; align-items: center; white-space: nowrap;">
                      <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-copy-link" title="کپی لینک اختصاصی" @click="handleCopyLink(lnk)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        <span>کپی</span>
                      </button>
                      <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-link-detail" title="مشاهده جزئیات" @click="$emit('view-link-detail', lnk)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>جزئیات</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- وضعیت خالی جدول (Empty State) -->
          <div v-if="!recentLinks.length" id="tableEmptyState" class="dyf-empty-state">
            <svg class="dyf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <h3 class="dyf-empty-title">هیچ لینک فعالی یافت نشد</h3>
            <p class="dyf-empty-desc">در حال حاضر هیچ لینک دسترسی اختصاصی برای همکاران ایجاد نشده است. می‌توانید با کلیک بر دکمه زیر اولین لینک را صادر کنید.</p>
            <a href="#access-links" class="dyf-btn dyf-btn-primary" @click.prevent="$emit('open-link-wizard')">
              <span>ایجاد اولین لینک دسترسی</span>
            </a>
          </div>
        </div>
      </div>

      <!-- ستون سمت چپ: لیست مشتریان فعال -->
      <div class="dyf-dashboard-col">
        <div class="dyf-panel-card dyf-dashboard-card">
          <div class="dyf-panel-card-header">
            <h3 class="dyf-panel-card-title">مشتریان فعال</h3>
            <div class="dyf-panel-card-actions">
              <a href="#customers" class="dyf-btn dyf-btn-primary dyf-btn-sm" @click.prevent="$emit('navigate', '#customers')">
                <span>مشاهده همه</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
              </a>
            </div>
          </div>
          <div id="dashboardActiveCustomersList" class="dyf-dashboard-active-cust-list" style="padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
            <div
              v-for="c in activeCustomersList"
              :key="c.id"
              style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.65rem 0.85rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-sm);"
            >
              <div style="display: flex; align-items: center; gap: 0.7rem; min-width: 0;">
                <div class="dyf-customer-avatar" style="width: 36px; height: 36px; font-size: 0.82rem; flex-shrink: 0;">{{ getInitials(c.nameFa) }}</div>
                <div style="min-width: 0;">
                  <div style="font-weight: 700; color: var(--text-ivory); font-size: 0.86rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ c.nameFa }}</div>
                  <div style="font-size: 0.74rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ c.shop || c.city || 'همکار کارگاه' }}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
                <span class="dyf-badge dyf-badge-active" style="font-size: 0.7rem; padding: 0.15rem 0.5rem; white-space: nowrap;">فعال</span>
              </div>
            </div>
            <div v-if="!activeCustomersList.length" style="color: var(--text-dim); font-size: 0.8rem; text-align: center; padding: 1rem;">
              مشتری فعالی ثبت نشده است.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalShoes: 18,
      totalCategories: 3,
      activeCustomers: 24,
      activeLinks: 9,
      totalViews: 142,
    }),
  },
  links: {
    type: Array,
    default: () => [],
  },
  customers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['open-link-wizard', 'view-link-detail', 'navigate']);

const recentLinks = computed(() => {
  return (props.links || []).slice(0, 4);
});

const activeCustomersList = computed(() => {
  return (props.customers || []).filter((c) => c.status === 'active').slice(0, 4);
});

const getInitials = (name) => {
  if (!name) return 'م';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('‌') || 'م';
};

const formatDeadline = (dl) => {
  if (!dl || dl === 'none') return 'نامحدود';
  if (dl === '24h') return 'مهلت: 24h';
  if (dl === '3d') return 'مهلت: 3d';
  if (dl === '7d') return 'مهلت: 7d';
  return `مهلت: ${dl}`;
};

const formatDuration = (dur) => {
  if (!dur || dur === 'unlimited') return 'نامحدود';
  if (dur === '15m') return 'مدت: 15m';
  if (dur === '10m') return 'مدت: 10m';
  if (dur === '1h') return 'مدت: 1h';
  return `مدت: ${dur}`;
};

const handleCopyLink = (lnk) => {
  const url = lnk.url || `${window.location.origin}/catalog?token=${lnk.token}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert('لینک در کلیپ‌بورد کپی شد');
    }).catch(() => {
      prompt('لینک اختصاصی:', url);
    });
  } else {
    prompt('لینک اختصاصی:', url);
  }
};
</script>
