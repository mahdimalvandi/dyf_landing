<template>
  <!-- ==================================================================
       ویو ۵: مدیریت لینک‌های اختصاصی (#access-links — تسک ۵)
       ================================================================== -->
  <section id="viewAccessLinks" class="dyf-view is-active">
    <!-- هدر سکشن لینک‌ها -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت لینک‌های دسترسی اختصاصی کاتالوگ</h1>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" id="openCreateLinkWizardBtn" class="dyf-btn dyf-btn-primary dyf-btn-lg" @click="$emit('create')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span>صدور لینک جدید</span>
        </button>
      </div>
    </div>

    <!-- نوار ابزار جست‌وجو و فیلتر لینک‌ها -->
    <div class="dyf-toolbar">
      <!-- جست‌وجو در نام گیرنده، مشتری، توکن -->
      <div class="dyf-toolbar-search">
        <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          id="linkSearchInput"
          v-model="searchQuery"
          class="dyf-quick-search-input"
          placeholder="جست‌وجو با نام گیرنده، مشتری، شماره یا توکن لینک..."
        >
      </div>

      <!-- تب‌های فیلتر وضعیت -->
      <div class="dyf-filter-tabs">
        <button type="button" class="dyf-filter-tab" :class="{ 'is-active': selectedStatus === 'all' }" @click="selectedStatus = 'all'">همه (<span id="countAllLinks">{{ links.length }}</span>)</button>
        <button type="button" class="dyf-filter-tab" :class="{ 'is-active': selectedStatus === 'active' }" @click="selectedStatus = 'active'">فعال (<span id="countActiveLinks">{{ activeCount }}</span>)</button>
        <button type="button" class="dyf-filter-tab" :class="{ 'is-active': selectedStatus === 'pending' }" @click="selectedStatus = 'pending'">در انتظار (<span id="countPendingLinks">{{ pendingCount }}</span>)</button>
        <button type="button" class="dyf-filter-tab" :class="{ 'is-active': selectedStatus === 'expired' }" @click="selectedStatus = 'expired'">منقضی (<span id="countExpiredLinks">{{ expiredCount }}</span>)</button>
      </div>

      <!-- سوئیچ گرید / جدول (پیش‌فرض جدول) -->
      <div class="dyf-view-toggle">
        <button
          type="button"
          id="linksViewGridBtn"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'grid' }"
          title="نمایش کارتی"
          @click="viewMode = 'grid'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </button>
        <button
          type="button"
          id="linksViewTableBtn"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'table' }"
          title="نمایش جدولی"
          @click="viewMode = 'table'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- گرید کارت‌های لینک‌های اختصاصی -->
    <div v-if="viewMode === 'grid' && filteredLinks.length > 0" id="linksGridContainer" class="dyf-links-grid">
      <article v-for="link in filteredLinks" :key="link.id" class="dyf-link-card" :data-id="link.id">
        <div class="dyf-link-header">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="font-family: var(--font-title); font-weight: 800; color: var(--gold-light); font-size: 0.92rem; direction: ltr;">{{ link.id }}</span>
            </div>
            <h3 style="font-family: var(--font-title); font-size: 1.05rem; font-weight: 800; color: var(--text-ivory);">{{ link.recipientFa }}</h3>
          </div>
          <div>
            <span v-if="link.status === 'active'" class="dyf-badge dyf-badge-active">فعال</span>
            <span v-else-if="link.status === 'pending'" class="dyf-badge dyf-badge-pending">در انتظار</span>
            <span v-else-if="link.status === 'expired'" class="dyf-badge dyf-badge-archived">منقضی</span>
            <span v-else class="dyf-badge dyf-badge-disabled">غیرفعال</span>
          </div>
        </div>

        <div class="dyf-link-url-box">
          <span class="dyf-link-url-text">token={{ link.token }}</span>
          <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-copy-link" title="کپی لینک" @click="copyLink(link)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span>کپی</span>
          </button>
        </div>

        <div class="dyf-link-meta-grid">
          <div class="dyf-link-meta-item">
            <span style="color: var(--text-dim); font-size: 0.7rem;">مهلت شروع:</span>
            <span style="color: var(--gold-primary); font-weight: 600;">{{ formatDeadline(link.startDeadline) }}</span>
          </div>
          <div class="dyf-link-meta-item">
            <span style="color: var(--text-dim); font-size: 0.7rem;">مدت مشاهده:</span>
            <span style="color: var(--gold-light); font-weight: 600;">{{ formatDuration(link.viewingDuration) }}</span>
          </div>
          <div class="dyf-link-meta-item">
            <span style="color: var(--text-dim); font-size: 0.7rem;">تعداد مدل‌ها:</span>
            <span style="color: #4cd964; font-weight: 700;">{{ (link.addModels || []).length || 'اختصاصی' }} مدل</span>
          </div>
          <div class="dyf-link-meta-item">
            <span style="color: var(--text-dim); font-size: 0.7rem;">تعداد ورود:</span>
            <span style="color: var(--text-muted); font-family: var(--font-title);">{{ link.views || 0 }} مرتبه</span>
          </div>
        </div>

        <div class="dyf-link-actions-footer" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); margin-top: auto;">
          <div style="display: flex; gap: 0.35rem;">
            <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-view-link" @click="$emit('view-detail', link)">
              <span>جزئیات</span>
            </button>
            <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-link" @click="$emit('edit', link)">
              <span>ویرایش</span>
            </button>
          </div>
          <div>
            <button
              v-if="link.status === 'active' || link.status === 'pending'"
              type="button"
              class="dyf-btn dyf-btn-outline dyf-btn-sm js-status-link"
              style="color: var(--status-danger); border-color: rgba(224, 86, 74, 0.35);"
              @click="toggleStatus(link)"
            >
              ابطال لینک
            </button>
            <button
              v-else
              type="button"
              class="dyf-btn dyf-btn-outline dyf-btn-sm js-status-link"
              style="color: #4cd964; border-color: rgba(76, 217, 100, 0.35);"
              @click="toggleStatus(link)"
            >
              فعال‌سازی
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- جدول داده‌های لینک‌های اختصاصی (حالت پیش‌فرض) -->
    <div v-if="viewMode === 'table' && filteredLinks.length > 0" id="linksTableContainer" class="dyf-panel-card">
      <div class="dyf-table-container">
        <table class="dyf-table">
          <thead>
            <tr>
              <th>شناسه و توکن</th>
              <th>نام گیرنده</th>
              <th class="dyf-col-deadline">مهلت شروع</th>
              <th class="dyf-col-duration">مدت مشاهده</th>
              <th>وضعیت</th>
              <th class="dyf-th-actions" style="text-align: center;">عملیات</th>
            </tr>
          </thead>
          <tbody id="linksTableBody">
            <tr v-for="link in filteredLinks" :key="link.id" :data-id="link.id">
              <td>
                <div style="font-family: var(--font-title); font-weight: 700; color: var(--gold-light); direction: ltr; text-align: right;">{{ link.id }}</div>
                <div style="font-family: var(--font-title); font-size: 0.72rem; color: var(--text-dim); direction: ltr; text-align: right;">token: {{ link.token }}</div>
              </td>
              <td>
                <div style="font-weight: 700; color: var(--text-ivory);">{{ link.recipientFa }}</div>
              </td>
              <td class="dyf-col-deadline" style="font-size: 0.8rem; color: var(--gold-primary); font-weight: 600;">{{ formatDeadline(link.startDeadline) }}</td>
              <td class="dyf-col-duration" style="font-size: 0.8rem; color: var(--gold-light); font-weight: 600;">{{ formatDuration(link.viewingDuration) }}</td>
              <td>
                <span v-if="link.status === 'active'" class="dyf-badge dyf-badge-active">فعال</span>
                <span v-else-if="link.status === 'pending'" class="dyf-badge dyf-badge-pending">در انتظار</span>
                <span v-else-if="link.status === 'expired'" class="dyf-badge dyf-badge-archived">منقضی</span>
                <span v-else class="dyf-badge dyf-badge-disabled">غیرفعال</span>
              </td>
              <td style="text-align: left;">
                <div class="dyf-table-actions dyf-links-table-actions">
                  <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm dyf-btn-action-view js-view-link" @click="$emit('view-detail', link)">جزئیات</button>
                  <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm dyf-btn-action-edit js-edit-link" @click="$emit('edit', link)">ویرایش</button>
                  <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm dyf-btn-action-copy js-copy-link" @click="copyLink(link)">کپی</button>
                  <button
                    v-if="link.status === 'active' || link.status === 'pending'"
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-sm dyf-btn-action-status js-status-link"
                    style="color: var(--status-danger);"
                    @click="toggleStatus(link)"
                  >
                    ابطال
                  </button>
                  <button
                    v-else
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-sm dyf-btn-action-status js-status-link"
                    style="color: #4cd964;"
                    @click="toggleStatus(link)"
                  >
                    فعال‌سازی
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- وضعیت بدون نتیجه لینک‌ها -->
    <div v-if="filteredLinks.length === 0" id="linksEmptyState" class="dyf-panel-card dyf-empty-state">
      <svg class="dyf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m9 9 4 4"/><path d="m13 9-4 4"/></svg>
      <h3 class="dyf-empty-title">لینکی با مشخصات انتخابی پیدا نشد</h3>
      <p class="dyf-empty-desc">می‌توانید فیلترها را بازنشانی کرده یا لینک جدیدی صادر فرمایید.</p>
      <button type="button" id="resetLinkFiltersBtn" class="dyf-btn dyf-btn-outline" @click="resetFilters">
        بازنشانی جست‌وجو
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  links: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['create', 'edit', 'delete', 'view-detail', 'change-status']);

const searchQuery = ref('');
const selectedStatus = ref('all');
const viewMode = ref('table');

const activeCount = computed(() => props.links.filter((l) => l.status === 'active').length);
const pendingCount = computed(() => props.links.filter((l) => l.status === 'pending').length);
const expiredCount = computed(() => props.links.filter((l) => l.status === 'expired').length);

const formatDeadline = (dl) => {
  if (!dl || dl === 'none') return 'نامحدود';
  if (dl === '24h') return '۲۴ ساعت';
  if (dl === '3d') return '۳ روز';
  if (dl === '7d') return '۷ روز';
  return dl;
};

const formatDuration = (dur) => {
  if (!dur || dur === 'unlimited') return 'نامحدود';
  if (dur === '15m') return '۱۵ دقیقه';
  if (dur === '10m') return '۱۰ دقیقه';
  if (dur === '1h') return '۱ ساعت';
  return dur;
};

const filteredLinks = computed(() => {
  return props.links.filter((l) => {
    if (selectedStatus.value !== 'all' && l.status !== selectedStatus.value) {
      return false;
    }
    if (searchQuery.value) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchRec = (l.recipientFa || '').toLowerCase().includes(q);
      const matchToken = (l.token || '').toLowerCase().includes(q);
      const matchId = (l.id || '').toLowerCase().includes(q);
      if (!matchRec && !matchToken && !matchId) return false;
    }
    return true;
  });
});

const copyLink = (link) => {
  const url = link.url || `${window.location.origin}/catalog?token=${link.token}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert('لینک اختصاصی در کلیپ‌بورد کپی شد');
    }).catch(() => {
      prompt('لینک اختصاصی:', url);
    });
  } else {
    prompt('لینک اختصاصی:', url);
  }
};

const toggleStatus = (link) => {
  const action = link.status === 'active' || link.status === 'pending' ? 'deactivate' : 'activate';
  emit('change-status', { link, action });
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedStatus.value = 'all';
};
</script>
