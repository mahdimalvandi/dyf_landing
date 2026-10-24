<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { customersService } from '@/shared/api/services';
import type { CustomerResponse } from '@/shared/api/types';

const isLoading = ref(true);
const customers = ref<CustomerResponse[]>([]);
const searchQuery = ref('');
const viewMode = ref<'table' | 'grid'>('table');

onMounted(async () => {
  try {
    const res = await customersService.getAll({ page: 1, limit: 50 });
    if (res.success && res.data?.items) {
      customers.value = res.data.items;
    }
  } catch (err) {
    console.error('Failed to load customers:', err);
  } finally {
    isLoading.value = false;
  }
});

const filteredCustomers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return customers.value;
  return customers.value.filter(
    (c) =>
      c.firstNameFa.toLowerCase().includes(q) ||
      c.lastNameFa.toLowerCase().includes(q) ||
      c.phoneNumber.includes(q) ||
      (c.storeName && c.storeName.toLowerCase().includes(q))
  );
});
</script>

<template>
  <section class="dyf-view is-active">
    <!-- هدر سکشن مشتریان -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت مشتریان و همکاران تجاری</h1>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
          </svg>
          <span>ثبت مشتری جدید</span>
        </button>
      </div>
    </div>

    <!-- نوار ابزار جست‌وجو و فیلتر مشتریان -->
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
          placeholder="جست‌وجو با نام، شماره تلفن یا نام فروشگاه..."
        />
      </div>

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

    <!-- جدول داده‌های مشتریان (پیش‌فرض) -->
    <div v-if="viewMode === 'table'" class="dyf-panel-card">
      <div class="dyf-table-container">
        <table class="dyf-table">
          <thead>
            <tr>
              <th>نام مشتری / همکار</th>
              <th>مجموعه / فروشگاه</th>
              <th>شماره تلفن</th>
              <th>وضعیت</th>
              <th style="text-align: center;">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredCustomers" :key="c.ID">
              <td style="font-weight: 700; color: var(--text-ivory);">
                {{ c.firstNameFa }} {{ c.lastNameFa }}
                <div v-if="c.firstNameEn" style="font-size: 0.76rem; color: var(--text-muted); font-family: var(--font-serif);">
                  {{ c.firstNameEn }} {{ c.lastNameEn }}
                </div>
              </td>
              <td>{{ c.storeName || '-' }}</td>
              <td style="direction: ltr; text-align: right; font-family: monospace;">{{ c.phoneNumber }}</td>
              <td>
                <span class="dyf-badge" :class="c.isActive ? 'dyf-badge-active' : 'dyf-badge-expired'">
                  {{ c.isActive ? 'فعال' : 'غیرفعال' }}
                </span>
              </td>
              <td style="text-align: center;">
                <router-link
                  :to="`/access-links?customerID=${c.ID}`"
                  class="dyf-btn dyf-btn-outline dyf-btn-xs"
                >
                  صدور لینک
                </router-link>
              </td>
            </tr>
            <tr v-if="!filteredCustomers.length && !isLoading">
              <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                مشتری یا همکاری با این مشخصات یافت نشد.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- گرید کارت‌های مشتریان -->
    <div v-else class="dyf-customers-grid">
      <div v-for="c in filteredCustomers" :key="c.ID" class="dyf-customer-card">
        <div class="dyf-customer-header">
          <div>
            <h3 class="dyf-customer-name">{{ c.firstNameFa }} {{ c.lastNameFa }}</h3>
            <div class="dyf-customer-store">{{ c.storeName }}</div>
          </div>
          <span class="dyf-badge" :class="c.isActive ? 'dyf-badge-active' : 'dyf-badge-expired'">
            {{ c.isActive ? 'فعال' : 'غیرفعال' }}
          </span>
        </div>
        <div class="dyf-customer-meta">
          <div>تلفن: <span dir="ltr">{{ c.phoneNumber }}</span></div>
        </div>
      </div>
    </div>
  </section>
</template>
