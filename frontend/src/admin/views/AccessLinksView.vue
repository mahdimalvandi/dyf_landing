<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { linksService } from '@/shared/api/services';
import type { LinkItemResponse } from '@/shared/api/types';
import { useToast } from '../stores/toast';
import { useConfirm } from '../stores/confirm';
import LinkWizardModal from '../components/links/LinkWizardModal.vue';

const route = useRoute();
const toast = useToast();
const { confirm } = useConfirm();

const isLoading = ref(true);
const links = ref<LinkItemResponse[]>([]);
const searchQuery = ref('');
const statusFilter = ref<'all' | 'active' | 'pending' | 'expired'>('all');
const viewMode = ref<'table' | 'grid'>('table');
const copiedId = ref<number | null>(null);

// Wizard Modal state
const isWizardOpen = ref(false);
const preselectedCustomerId = ref<number | undefined>(undefined);

onMounted(async () => {
  await fetchLinks();
  checkRouteActions();
});

watch(
  () => route.query,
  () => {
    checkRouteActions();
  }
);

function checkRouteActions() {
  if (route.query.action === 'create') {
    isWizardOpen.value = true;
  }
  if (route.query.customerID) {
    preselectedCustomerId.value = Number(route.query.customerID);
    isWizardOpen.value = true;
  }
}

async function fetchLinks() {
  try {
    isLoading.value = true;
    const res = await linksService.getAll({ page: 1, limit: 50 });
    if (res.success && res.data?.items) {
      links.value = res.data.items;
    }
  } catch (err) {
    console.error('Failed to load access links:', err);
  } finally {
    isLoading.value = false;
  }
}

const counts = computed(() => {
  const all = links.value.length;
  const active = links.value.filter((l) => l.status === 'active' || (l.isActive && !l.isExpired)).length;
  const pending = links.value.filter((l) => l.status === 'pending').length;
  const expired = links.value.filter((l) => l.status === 'expired' || l.isExpired).length;
  return { all, active, pending, expired };
});

const filteredLinks = computed(() => {
  return links.value.filter((link) => {
    // Filter status
    let matchStatus = true;
    if (statusFilter.value === 'active') {
      matchStatus = link.status === 'active' || (link.isActive && !link.isExpired);
    } else if (statusFilter.value === 'pending') {
      matchStatus = link.status === 'pending';
    } else if (statusFilter.value === 'expired') {
      matchStatus = link.status === 'expired' || link.isExpired;
    }

    // Filter query
    const q = searchQuery.value.trim().toLowerCase();
    const matchQuery =
      !q ||
      link.recipientName.toLowerCase().includes(q) ||
      (link.customerName && link.customerName.toLowerCase().includes(q)) ||
      (link.phoneNumber && link.phoneNumber.includes(q)) ||
      link.token.toLowerCase().includes(q) ||
      String(link.linkID || link.ID).includes(q);

    return matchStatus && matchQuery;
  });
});

async function copyLinkUrl(link: LinkItemResponse) {
  const url = `${window.location.origin}/catalog.html?token=${link.token}`;
  try {
    await navigator.clipboard.writeText(url);
    copiedId.value = link.ID;
    setTimeout(() => {
      if (copiedId.value === link.ID) copiedId.value = null;
    }, 2000);
  } catch (err) {
    console.error('Could not copy link:', err);
  }
}

async function toggleRevoke(link: LinkItemResponse) {
  const isCurrentlyActive = link.isActive && !link.isExpired;
  const actionText = isCurrentlyActive ? 'ابطال دسترسی' : 'فعال‌سازی مجدد';

  const confirmed = await confirm({
    title: `${actionText} لینک اختصاصی`,
    message: `آیا از ${actionText} لینک کاتالوگ «${link.recipientName}» اطمینان دارید؟`,
    confirmText: actionText,
    isDestructive: isCurrentlyActive,
  });

  if (!confirmed) return;

  try {
    if (isCurrentlyActive) {
      await linksService.revoke(link.ID);
      toast.warning(`دسترسی لینک «${link.recipientName}» با موفقیت لغو شد.`);
    } else {
      await linksService.reactivate(link.ID);
      toast.success(`لینک «${link.recipientName}» مجدداً فعال گردید.`);
    }
    await fetchLinks();
  } catch (err: any) {
    toast.error(err.message || 'خطا در تغییر وضعیت لینک');
  }
}

async function handleDelete(link: LinkItemResponse) {
  const confirmed = await confirm({
    title: 'حذف لینک اختصاصی',
    message: `آیا از حذف کامل لینک «${link.recipientName}» اطمینان دارید؟`,
    confirmText: 'حذف لینک',
    isDestructive: true,
  });

  if (!confirmed) return;

  try {
    await linksService.delete(link.ID);
    toast.success('لینک مورد نظر با موفقیت حذف شد.');
    await fetchLinks();
  } catch (err: any) {
    toast.error(err.message || 'خطا در حذف لینک');
  }
}

function handleLinkCreated() {
  fetchLinks();
}
</script>

<template>
  <section class="dyf-view is-active">
    <!-- هدر سکشن لینک‌ها -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت لینک‌های دسترسی اختصاصی کاتالوگ</h1>
          <span class="dyf-badge dyf-badge-active">{{ counts.all }} لینک صادرشده</span>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button
          type="button"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          @click="isWizardOpen = true; preselectedCustomerId = undefined;"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>صدور لینک جدید</span>
        </button>
      </div>
    </div>

    <!-- نوار ابزار جست‌وجو و فیلتر لینک‌ها -->
    <div class="dyf-toolbar">
      <div class="dyf-toolbar-search">
        <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="dyf-quick-search-input"
          placeholder="جست‌وجو با نام گیرنده، مشتری، شماره یا توکن لینک..."
        />
      </div>

      <!-- تب‌های فیلتر وضعیت -->
      <div class="dyf-filter-tabs">
        <button
          type="button"
          class="dyf-filter-tab"
          :class="{ 'is-active': statusFilter === 'all' }"
          @click="statusFilter = 'all'"
        >
          همه (<span>{{ counts.all }}</span>)
        </button>
        <button
          type="button"
          class="dyf-filter-tab"
          :class="{ 'is-active': statusFilter === 'active' }"
          @click="statusFilter = 'active'"
        >
          فعال (<span>{{ counts.active }}</span>)
        </button>
        <button
          type="button"
          class="dyf-filter-tab"
          :class="{ 'is-active': statusFilter === 'pending' }"
          @click="statusFilter = 'pending'"
        >
          در انتظار (<span>{{ counts.pending }}</span>)
        </button>
        <button
          type="button"
          class="dyf-filter-tab"
          :class="{ 'is-active': statusFilter === 'expired' }"
          @click="statusFilter = 'expired'"
        >
          منقضی (<span>{{ counts.expired }}</span>)
        </button>
      </div>

      <!-- سوئیچ گرید / جدول -->
      <div class="dyf-view-toggle">
        <button
          type="button"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'grid' }"
          title="نمایش کارتی"
          @click="viewMode = 'grid'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        </button>
        <button
          type="button"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'table' }"
          title="نمایش جدولی"
          @click="viewMode = 'table'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- حالت اسکلتون لودینگ -->
    <div v-if="isLoading" class="dyf-panel-card">
      <div class="dyf-table-container">
        <table class="dyf-table">
          <thead>
            <tr>
              <th>شناسه و توکن</th>
              <th>نام گیرنده</th>
              <th>تعداد مدل</th>
              <th>مدت مشاهده</th>
              <th>وضعیت</th>
              <th style="text-align: center;">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 5" :key="`link-skel-${i}`">
              <td><div class="dyf-skeleton" style="height: 22px; width: 90px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 20px; width: 140px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 20px; width: 60px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 20px; width: 70px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 24px; width: 60px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 28px; width: 120px; margin: auto;"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- جدول داده‌های لینک‌های اختصاصی (حالت پیش‌فرض) -->
    <div v-else-if="viewMode === 'table'" class="dyf-panel-card">
      <div class="dyf-table-container">
        <table class="dyf-table">
          <thead>
            <tr>
              <th>شناسه و توکن</th>
              <th>نام گیرنده</th>
              <th>تعداد مدل</th>
              <th>مدت مشاهده</th>
              <th>وضعیت</th>
              <th style="text-align: center;">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="link in filteredLinks" :key="link.ID">
              <td>
                <span class="dyf-code-tag">LNK-{{ link.linkID || link.ID }}</span>
                <div style="font-size: 0.73rem; color: var(--text-muted); font-family: monospace; margin-top: 2px;">
                  {{ link.token.slice(0, 10) }}...
                </div>
              </td>
              <td>
                <div style="font-weight: 700; color: var(--text-ivory);">{{ link.recipientName }}</div>
                <div v-if="link.customerName" style="font-size: 0.76rem; color: var(--gold-light);">
                  مشتری: {{ link.customerName }}
                </div>
              </td>
              <td>{{ link.shoesCount }} مدل اختصاصی</td>
              <td>
                <span v-if="link.durationHours">{{ link.durationHours }} ساعت</span>
                <span v-else>نامحدود</span>
              </td>
              <td>
                <span
                  class="dyf-badge"
                  :class="link.isActive && !link.isExpired ? 'dyf-badge-active' : 'dyf-badge-expired'"
                >
                  {{ link.isActive && !link.isExpired ? 'فعال' : 'منقضی' }}
                </span>
              </td>
              <td style="text-align: center;">
                <div style="display: inline-flex; gap: 0.35rem; align-items: center;">
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-xs"
                    :title="copiedId === link.ID ? 'کپی شد!' : 'کپی لینک کاتالوگ'"
                    @click="copyLinkUrl(link)"
                  >
                    <span>{{ copiedId === link.ID ? 'کپی شد' : 'کپی لینک' }}</span>
                  </button>
                  <a
                    :href="`catalog.html?token=${link.token.slice(0, 8)}`"
                    target="_blank"
                    class="dyf-btn dyf-btn-primary dyf-btn-xs"
                    title="مشاهده زنده کاتالوگ"
                    rel="noopener noreferrer"
                  >
                    کاتالوگ
                  </a>
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-xs"
                    :title="link.isActive && !link.isExpired ? 'ابطال دسترسی' : 'فعال‌سازی مجدد'"
                    @click="toggleRevoke(link)"
                  >
                    {{ link.isActive && !link.isExpired ? 'ابطال' : 'فعال‌سازی' }}
                  </button>
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-xs"
                    style="color: #e06d53; border-color: rgba(224, 109, 83, 0.4);"
                    title="حذف کامل لینک"
                    @click="handleDelete(link)"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredLinks.length && !isLoading">
              <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                لینکی مطابق با فیلترهای انتخابی یافت نشد.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- گرید کارت‌های لینک‌های اختصاصی -->
    <div v-else class="dyf-links-grid">
      <div v-for="link in filteredLinks" :key="link.ID" class="dyf-link-card">
        <div class="dyf-link-card-header">
          <div>
            <h3 class="dyf-link-recipient">{{ link.recipientName }}</h3>
            <div class="dyf-link-token">توکن: {{ link.token.slice(0, 12) }}...</div>
          </div>
          <span
            class="dyf-badge"
            :class="link.isActive && !link.isExpired ? 'dyf-badge-active' : 'dyf-badge-expired'"
          >
            {{ link.isActive && !link.isExpired ? 'فعال' : 'منقضی' }}
          </span>
        </div>
        <div class="dyf-link-card-body">
          <div class="dyf-link-stat-item">
            <span>مدل‌های مجاز:</span>
            <strong>{{ link.shoesCount }} مدل</strong>
          </div>
          <div class="dyf-link-stat-item">
            <span>مدت دسترسی:</span>
            <strong>{{ link.durationHours ? `${link.durationHours} ساعت` : 'نامحدود' }}</strong>
          </div>
        </div>
        <div class="dyf-link-card-footer" style="display: flex; gap: 0.4rem; margin-top: 1rem;">
          <button
            type="button"
            class="dyf-btn dyf-btn-outline dyf-btn-xs"
            style="flex: 1;"
            @click="copyLinkUrl(link)"
          >
            {{ copiedId === link.ID ? 'کپی شد!' : 'کپی لینک' }}
          </button>
          <a
            :href="`catalog.html?token=${link.token.slice(0, 8)}`"
            target="_blank"
            class="dyf-btn dyf-btn-primary dyf-btn-xs"
            style="flex: 1;"
            rel="noopener noreferrer"
          >
            مشاهده
          </a>
          <button
            type="button"
            class="dyf-btn dyf-btn-outline dyf-btn-xs"
            @click="toggleRevoke(link)"
          >
            {{ link.isActive && !link.isExpired ? 'ابطال' : 'فعال' }}
          </button>
        </div>
      </div>
    </div>

    <!-- مودال ویزارد صدور لینک VIP -->
    <LinkWizardModal
      :show="isWizardOpen"
      :preselected-customer-id="preselectedCustomerId"
      @close="isWizardOpen = false"
      @created="handleLinkCreated"
    />
  </section>
</template>
