<template>
  <!-- ==================================================================
       ویو ۴: مدیریت مشتریان (#customers — تسک ۴)
       ================================================================== -->
  <section id="viewCustomers" class="dyf-view is-active">
    <!-- هدر سکشن مشتریان -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت مشتریان و همکاران تجاری</h1>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" id="openAddCustomerModalBtn" class="dyf-btn dyf-btn-primary dyf-btn-lg" @click="$emit('create')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          <span>ثبت مشتری جدید</span>
        </button>
      </div>
    </div>

    <!-- نوار ابزار جست‌وجو و فیلتر مشتریان -->
    <div class="dyf-toolbar">
      <!-- جست‌وجو در نام، شماره و نام فروشگاه -->
      <div class="dyf-toolbar-search">
        <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          id="customerSearchInput"
          v-model="searchQuery"
          class="dyf-quick-search-input"
          placeholder="جست‌وجو با نام، شماره تلفن یا نام فروشگاه (مثال: کمالی یا ۰۹۱۲)..."
        >
      </div>

      <!-- سوئیچ گرید / جدول (پیش‌فرض جدول) -->
      <div class="dyf-view-toggle">
        <button
          type="button"
          id="customersViewGridBtn"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'grid' }"
          title="نمایش کارتی"
          @click="viewMode = 'grid'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </button>
        <button
          type="button"
          id="customersViewTableBtn"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'table' }"
          title="نمایش جدولی"
          @click="viewMode = 'table'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- گرید کارت‌های مشتریان -->
    <div v-if="viewMode === 'grid' && filteredCustomers.length > 0" id="customersGridContainer" class="dyf-customers-grid">
      <article v-for="cust in filteredCustomers" :key="cust.id" class="dyf-customer-card" :data-id="cust.id">
        <div class="dyf-customer-header">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div class="dyf-customer-avatar">{{ getInitials(cust.nameFa) }}</div>
            <div>
              <h3 class="dyf-customer-title">{{ cust.nameFa }}</h3>
            </div>
          </div>
        </div>

        <div class="dyf-customer-shop" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>{{ cust.shop || 'فروشگاه آزاد' }}</span>
          </div>
          <div style="font-family: var(--font-title); font-size: 0.85rem; font-weight: 700; color: var(--gold-light); direction: ltr;">
            {{ cust.phone }}
          </div>
        </div>

        <div class="dyf-customer-actions" style="justify-content: flex-end;">
          <div style="display: flex; gap: 0.4rem;">
            <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-access-cust" @click="$emit('open-details', cust)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>دسترسی مستقیم</span>
            </button>
            <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-cust" @click="$emit('edit', cust)">
              <span>ویرایش</span>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- جدول داده‌های مشتریان (حالت پیش‌فرض) -->
    <div v-if="viewMode === 'table' && filteredCustomers.length > 0" id="customersTableContainer" class="dyf-panel-card">
      <div class="dyf-table-container">
        <table class="dyf-table">
          <thead>
            <tr>
              <th>نام مشتری / همکار</th>
              <th>مجموعه / فروشگاه</th>
              <th>شماره تلفن</th>
              <th>دسترسی مستقیم</th>
              <th class="dyf-th-actions" style="text-align: center;">عملیات</th>
            </tr>
          </thead>
          <tbody id="customersTableBody">
            <tr v-for="cust in filteredCustomers" :key="cust.id" :data-id="cust.id">
              <td>
                <div style="font-weight: 700; color: var(--text-ivory);">{{ cust.nameFa }}</div>
              </td>
              <td style="font-size: 0.82rem; color: var(--text-muted);">{{ cust.shop || '-' }}</td>
              <td style="font-family: var(--font-title); direction: ltr; text-align: right; color: var(--text-main);">{{ cust.phone }}</td>
              <td>
                <span class="dyf-badge" :class="cust.directAccess?.enabled ? 'dyf-badge-published' : 'dyf-badge-archived'">
                  {{ cust.directAccess?.enabled ? 'مستقیم فعال' : 'غیرفعال' }}
                </span>
              </td>
              <td style="text-align: left;">
                <div class="dyf-table-actions" style="display: flex; gap: 0.35rem; align-items: center; justify-content: flex-end;">
                  <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-access-cust" @click="$emit('open-details', cust)">دسترسی مستقیم</button>
                  <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-cust" @click="$emit('edit', cust)">ویرایش</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- وضعیت بدون نتیجه مشتریان -->
    <div v-if="filteredCustomers.length === 0" id="customersEmptyState" class="dyf-panel-card dyf-empty-state">
      <svg class="dyf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m9 9 4 4"/><path d="m13 9-4 4"/></svg>
      <h3 class="dyf-empty-title">مشتری یا همکاری با این مشخصات یافت نشد</h3>
      <p class="dyf-empty-desc">می‌توانید عبارت جست‌وجو را تغییر دهید یا اطلاعات مشتری جدیدی را ثبت فرمایید.</p>
      <button type="button" id="resetCustomerFiltersBtn" class="dyf-btn dyf-btn-outline" @click="searchQuery = ''">
        بازنشانی جست‌وجو
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  customers: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['create', 'edit', 'delete', 'open-details', 'generate-link']);

const searchQuery = ref('');
const viewMode = ref('table');

const getInitials = (name) => {
  if (!name) return 'م';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('‌') || 'م';
};

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return props.customers;
  const q = searchQuery.value.trim().toLowerCase();
  return props.customers.filter((c) => {
    const matchFa = (c.nameFa || '').toLowerCase().includes(q);
    const matchShop = (c.shop || '').toLowerCase().includes(q);
    const matchPhone = (c.phone || '').includes(q);
    return matchFa || matchShop || matchPhone;
  });
});
</script>
