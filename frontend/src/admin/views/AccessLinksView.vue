<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { linksService } from '@/shared/api/services';
import type { LinkItemResponse } from '@/shared/api/types';

const isLoading = ref(true);
const links = ref<LinkItemResponse[]>([]);
const searchQuery = ref('');
const statusFilter = ref<'all' | 'active' | 'pending' | 'expired'>('all');
const viewMode = ref<'table' | 'grid'>('table');
const copiedId = ref<number | null>(null);

onMounted(async () => {
  await fetchLinks();
});

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
</script>

<template>
  <section class="dyf-view is-active">
    <!-- هدر سکشن لینک‌ها -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت لینک‌های دسترسی اختصاصی کاتالوگ</h1>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-lg">
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

    <!-- جدول داده‌های لینک‌های اختصاصی (حالت پیش‌فرض) -->
    <div v-if="viewMode === 'table'" class="dyf-panel-card">
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
                <div style="display: inline-flex; gap: 0.4rem;">
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
        <div class="dyf-link-card-footer" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
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
        </div>
      </div>
    </div>
  </section>
</template>
