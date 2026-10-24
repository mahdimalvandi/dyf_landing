<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { customersService } from '@/shared/api/services';
import type { CustomerResponse, CustomerStatus } from '@/shared/api/types';
import CustomerFormModal from './customers/CustomerFormModal.vue';
import CustomerDetailsModal from './customers/CustomerDetailsModal.vue';

const router = useRouter();

const isLoading = ref(true);
const customers = ref<CustomerResponse[]>([]);
const searchQuery = ref('');
const statusFilter = ref<'all' | 'active' | 'inactive'>('all');
const viewMode = ref<'table' | 'grid'>('table');

// Modal states
const isFormOpen = ref(false);
const customerToEdit = ref<CustomerResponse | null>(null);

const isDetailsOpen = ref(false);
const customerForDetails = ref<CustomerResponse | null>(null);

async function loadCustomers() {
  isLoading.value = true;
  try {
    const res = await customersService.getAll({ page: 1, limit: 100 });
    if (res.success && res.data?.items) {
      customers.value = res.data.items;
    }
  } catch (err) {
    console.error('Failed to load customers:', err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadCustomers();
});

const counts = computed(() => {
  const all = customers.value.length;
  const active = customers.value.filter((c) => c.isActive).length;
  const inactive = customers.value.filter((c) => !c.isActive).length;
  return { all, active, inactive };
});

const filteredCustomers = computed(() => {
  return customers.value.filter((c) => {
    // Status filter
    if (statusFilter.value === 'active' && !c.isActive) return false;
    if (statusFilter.value === 'inactive' && c.isActive) return false;

    // Search query
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return true;
    return (
      c.firstNameFa.toLowerCase().includes(q) ||
      c.lastNameFa.toLowerCase().includes(q) ||
      c.phoneNumber.includes(q) ||
      (c.storeName && c.storeName.toLowerCase().includes(q))
    );
  });
});

function openCreateModal() {
  customerToEdit.value = null;
  isFormOpen.value = true;
}

function openEditModal(c: CustomerResponse) {
  customerToEdit.value = c;
  isFormOpen.value = true;
}

function openDetailsModal(c: CustomerResponse) {
  customerForDetails.value = c;
  isDetailsOpen.value = true;
}

function issueLinkForCustomer(c: CustomerResponse) {
  router.push({ path: '/access-links', query: { customerID: String(c.ID), action: 'create' } });
}

async function toggleStatus(c: CustomerResponse) {
  const newStatus: CustomerStatus = c.isActive ? 'inactive' : 'active';
  const actionText = c.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی';
  if (!confirm(`آیا از ${actionText} حساب کاربری «${c.firstNameFa} ${c.lastNameFa}» اطمینان دارید؟`)) {
    return;
  }

  try {
    const res = await customersService.changeStatus(c.ID, { status: newStatus });
    if (res.success) {
      await loadCustomers();
    } else {
      alert(res.message || 'خطا در تغییر وضعیت مشتری');
    }
  } catch (err: any) {
    alert(err.message || 'خطا در ارتباط با سرور');
  }
}

async function handleDelete(c: CustomerResponse) {
  if (!confirm(`آیا از حذف کامل مشتری «${c.firstNameFa} ${c.lastNameFa}» اطمینان دارید؟`)) {
    return;
  }
  try {
    const res = await customersService.delete(c.ID);
    if (res.success) {
      await loadCustomers();
    } else {
      alert(res.message || 'خطا در حذف مشتری');
    }
  } catch (err: any) {
    alert(err.message || 'خطا در ارتباط با سرور');
  }
}
</script>

<template>
  <section class="dyf-view is-active">
    <!-- هدر سکشن مشتریان -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت مشتریان و همکاران تجاری</h1>
          <span class="dyf-badge dyf-badge-active">{{ counts.all }} همکار ثبت‌شده</span>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-lg" @click="openCreateModal">
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

      <!-- تب‌های فیلتر وضعیت مشتریان -->
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
          :class="{ 'is-active': statusFilter === 'inactive' }"
          @click="statusFilter = 'inactive'"
        >
          غیرفعال (<span>{{ counts.inactive }}</span>)
        </button>
      </div>

      <!-- سوئیچ گرید / جدول -->
      <div class="dyf-view-toggle">
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
      </div>
    </div>

    <!-- حالت اسکلتون بارگذاری -->
    <div v-if="isLoading" class="dyf-panel-card">
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
            <tr v-for="i in 5" :key="`c-skel-${i}`">
              <td><div class="dyf-skeleton" style="height: 20px; width: 140px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 20px; width: 110px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 20px; width: 90px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 22px; width: 50px;"></div></td>
              <td><div class="dyf-skeleton" style="height: 26px; width: 140px; margin: auto;"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- جدول داده‌های مشتریان (پیش‌فرض) -->
    <div v-else-if="viewMode === 'table'" class="dyf-panel-card">
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
                <div style="cursor: pointer;" @click="openDetailsModal(c)">
                  {{ c.firstNameFa }} {{ c.lastNameFa }}
                </div>
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
                <div style="display: inline-flex; gap: 0.35rem; align-items: center;">
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-primary dyf-btn-xs"
                    title="صدور لینک کاتالوگ برای این مشتری"
                    @click="issueLinkForCustomer(c)"
                  >
                    صدور لینک
                  </button>
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-xs"
                    title="مشاهده پرونده مشتری"
                    @click="openDetailsModal(c)"
                  >
                    پرونده
                  </button>
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-xs"
                    title="ویرایش مشخصات"
                    @click="openEditModal(c)"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-xs"
                    :title="c.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'"
                    @click="toggleStatus(c)"
                  >
                    {{ c.isActive ? 'غیرفعال' : 'فعال' }}
                  </button>
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-xs"
                    style="color: #e06d53; border-color: rgba(224, 109, 83, 0.4);"
                    title="حذف مشتری"
                    @click="handleDelete(c)"
                  >
                    حذف
                  </button>
                </div>
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
            <h3 class="dyf-customer-name" style="cursor: pointer;" @click="openDetailsModal(c)">
              {{ c.firstNameFa }} {{ c.lastNameFa }}
            </h3>
            <div class="dyf-customer-store">{{ c.storeName || 'مشتری مستقل' }}</div>
          </div>
          <span class="dyf-badge" :class="c.isActive ? 'dyf-badge-active' : 'dyf-badge-expired'">
            {{ c.isActive ? 'فعال' : 'غیرفعال' }}
          </span>
        </div>
        <div class="dyf-customer-meta">
          <div>تلفن: <span dir="ltr">{{ c.phoneNumber }}</span></div>
        </div>
        <div style="display: flex; gap: 0.4rem; margin-top: 1rem;">
          <button
            type="button"
            class="dyf-btn dyf-btn-primary dyf-btn-xs"
            style="flex: 1;"
            @click="issueLinkForCustomer(c)"
          >
            صدور لینک
          </button>
          <button
            type="button"
            class="dyf-btn dyf-btn-outline dyf-btn-xs"
            style="flex: 1;"
            @click="openDetailsModal(c)"
          >
            مشاهده
          </button>
          <button
            type="button"
            class="dyf-btn dyf-btn-outline dyf-btn-xs"
            @click="openEditModal(c)"
          >
            ویرایش
          </button>
        </div>
      </div>
    </div>

    <!-- مودال ثبت / ویرایش مشتری -->
    <CustomerFormModal
      :show="isFormOpen"
      :customer-to-edit="customerToEdit"
      @close="isFormOpen = false"
      @saved="loadCustomers"
    />

    <!-- مودال پرونده مشتری -->
    <CustomerDetailsModal
      :show="isDetailsOpen"
      :customer="customerForDetails"
      @close="isDetailsOpen = false"
      @edit="openEditModal"
      @issue-link="issueLinkForCustomer"
    />
  </section>
</template>
