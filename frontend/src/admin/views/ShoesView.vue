<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { shoesService, categoriesService } from '@/shared/api/services';
import type { ShoeItemResponse, ShoeDetailResponse, CategoryResponse } from '@/shared/api/types';
import ShoeFormModal from './shoes/ShoeFormModal.vue';
import ShoeDossierModal from './shoes/ShoeDossierModal.vue';

const isLoading = ref(true);
const shoes = ref<ShoeItemResponse[]>([]);
const categories = ref<CategoryResponse[]>([]);
const searchQuery = ref('');
const selectedCategory = ref<number | 'all'>('all');
const viewMode = ref<'grid' | 'table'>('grid');

// Pagination state
const page = ref(1);
const limit = ref(12);
const totalPages = ref(1);
const totalCount = ref(0);

// Modal states
const isFormModalOpen = ref(false);
const shoeToEdit = ref<ShoeDetailResponse | null>(null);

const isDossierModalOpen = ref(false);
const shoeForDossier = ref<ShoeDetailResponse | null>(null);

async function loadData() {
  isLoading.value = true;
  try {
    const [shoesRes, catsRes] = await Promise.all([
      shoesService.getAll({
        page: page.value,
        limit: limit.value,
        search: searchQuery.value || undefined,
        categoryID: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
      }),
      categoriesService.getAll(),
    ]);

    if (shoesRes.success && shoesRes.data) {
      shoes.value = shoesRes.data.items || [];
      totalCount.value = shoesRes.data.total || shoes.value.length;
      totalPages.value = shoesRes.data.totalPages || 1;
    }
    if (catsRes.success && catsRes.data) {
      categories.value = catsRes.data;
    }
  } catch (err) {
    console.error('Failed to load shoes data:', err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});

// Refetch on category filter change
watch(selectedCategory, () => {
  page.value = 1;
  loadData();
});

// Debounced search
let searchTimer: ReturnType<typeof setTimeout> | null = null;
function handleSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 350);
}

function openCreateModal() {
  shoeToEdit.value = null;
  isFormModalOpen.value = true;
}

async function openEditModal(shoe: ShoeItemResponse) {
  try {
    const res = await shoesService.getById(shoe.ID);
    if (res.success && res.data) {
      shoeToEdit.value = res.data;
    } else {
      // Fallback to list item data
      shoeToEdit.value = {
        ...shoe,
        categories: shoe.categories || [],
        media: [],
        createdAt: '',
        updatedAt: '',
      } as ShoeDetailResponse;
    }
  } catch {
    shoeToEdit.value = {
      ...shoe,
      categories: shoe.categories || [],
      media: [],
      createdAt: '',
      updatedAt: '',
    } as ShoeDetailResponse;
  }
  isFormModalOpen.value = true;
}

async function openDossierModal(shoe: ShoeItemResponse) {
  try {
    const res = await shoesService.getById(shoe.ID);
    if (res.success && res.data) {
      shoeForDossier.value = res.data;
    } else {
      shoeForDossier.value = {
        ...shoe,
        media: [],
        createdAt: '',
        updatedAt: '',
      } as ShoeDetailResponse;
    }
  } catch {
    shoeForDossier.value = {
      ...shoe,
      media: [],
      createdAt: '',
      updatedAt: '',
    } as ShoeDetailResponse;
  }
  isDossierModalOpen.value = true;
}

async function handleDeleteShoe(shoe: ShoeItemResponse) {
  if (!confirm(`آیا از حذف مدل کفش «${shoe.title}» اطمینان دارید؟ این عمل غیرقابل بازگشت است.`)) {
    return;
  }
  try {
    const res = await shoesService.delete(shoe.ID);
    if (res.success) {
      await loadData();
    } else {
      alert(res.message || 'خطا در حذف مدل کفش');
    }
  } catch (err: any) {
    alert(err.message || 'خطا در برقراری ارتباط با سرور');
  }
}
</script>

<template>
  <section class="dyf-view is-active">
    <!-- هدر سکشن محصولات -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت مدل‌های کفش</h1>
          <span class="dyf-badge dyf-badge-active" style="margin-right: 0.5rem;">
            {{ totalCount }} مدل ثبت‌شده
          </span>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-lg" @click="openCreateModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span>ثبت مدل کفش جدید</span>
        </button>
      </div>
    </div>

    <!-- نوار ابزار جست‌وجو و فیلتر -->
    <div class="dyf-toolbar">
      <!-- جست‌وجو بر اساس عنوان و شناسه عددی -->
      <div class="dyf-toolbar-search">
        <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="dyf-quick-search-input"
          placeholder="جست‌وجو با عنوان یا شناسه عددی (مثال: آکسفورد یا ۱۰۱)..."
          @input="handleSearchInput"
        />
      </div>

      <!-- فیلتر دسته‌بندی -->
      <div class="dyf-toolbar-filter-wrap">
        <select
          v-model="selectedCategory"
          class="dyf-select"
          style="height: 38px; padding-top: 0.4rem; padding-bottom: 0.4rem;"
        >
          <option value="all">همه دسته‌بندی‌ها</option>
          <option v-for="cat in categories" :key="cat.ID" :value="cat.ID">
            {{ cat.title }} ({{ cat.shoeCount }})
          </option>
        </select>
      </div>

      <!-- سوئیچ گرید / جدول -->
      <div class="dyf-view-toggle">
        <button
          type="button"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'grid' }"
          title="نمایش گرید کارت‌ها"
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
          title="نمایش جدول داده‌ها"
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

    <!-- حالت اسکلتون در زمان بارگذاری -->
    <div v-if="isLoading" class="dyf-product-grid">
      <div v-for="i in 6" :key="`shoe-skel-${i}`" class="dyf-product-card" style="padding: 0; overflow: hidden;">
        <div class="dyf-skeleton" style="width: 100%; height: 220px; border-radius: 0;"></div>
        <div style="padding: 1.25rem;">
          <div class="dyf-skeleton" style="height: 20px; width: 75%; margin-bottom: 0.75rem;"></div>
          <div class="dyf-skeleton" style="height: 14px; width: 45%; margin-bottom: 1rem;"></div>
          <div class="dyf-skeleton" style="height: 14px; width: 90%;"></div>
        </div>
      </div>
    </div>

    <!-- گرید تصویری محصولات (حالت اول) -->
    <div v-else-if="viewMode === 'grid'" class="dyf-product-grid">
      <div v-for="shoe in shoes" :key="shoe.ID" class="dyf-product-card">
        <div class="dyf-product-thumb-wrap">
          <img
            :src="shoe.coverImage || '/assets/images/craft-formal.jpeg'"
            :alt="shoe.title"
            class="dyf-product-thumb"
            loading="lazy"
          />
          <span class="dyf-product-id-tag">#{{ shoe.modelID || shoe.ID }}</span>
        </div>

        <div class="dyf-product-body">
          <h3 class="dyf-product-title" style="cursor: pointer;" @click="openDossierModal(shoe)">
            {{ shoe.title }}
          </h3>

          <div class="dyf-product-cats">
            <span v-for="c in shoe.categories" :key="c.ID" class="dyf-badge dyf-badge-cat">
              {{ c.title }}
            </span>
          </div>

          <p class="dyf-product-desc">{{ shoe.description }}</p>

          <div class="dyf-product-footer">
            <div class="dyf-product-meta-item">
              <span class="dyf-product-meta-label">رنگ‌ها:</span>
              <span class="dyf-product-meta-val">{{ shoe.colors.join('، ') }}</span>
            </div>
            <div class="dyf-product-meta-item">
              <span class="dyf-product-meta-label">سایزها:</span>
              <span class="dyf-product-meta-val">{{ shoe.sizes.join(' - ') }}</span>
            </div>
          </div>

          <!-- دکمه‌های اقدام کارت -->
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
            <button
              type="button"
              class="dyf-btn dyf-btn-outline dyf-btn-xs"
              style="flex: 1;"
              title="شناسنامه فنی و مشخصات"
              @click="openDossierModal(shoe)"
            >
              شناسنامه
            </button>
            <button
              type="button"
              class="dyf-btn dyf-btn-primary dyf-btn-xs"
              style="flex: 1;"
              title="ویرایش اطلاعات مدل"
              @click="openEditModal(shoe)"
            >
              ویرایش
            </button>
            <button
              type="button"
              class="dyf-btn dyf-btn-outline dyf-btn-xs"
              style="color: #e06d53; border-color: rgba(224, 109, 83, 0.4);"
              title="حذف مدل"
              @click="handleDeleteShoe(shoe)"
            >
              حذف
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="!shoes.length && !isLoading"
        style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem 1rem;"
      >
        هیچ مدلی مطابق با جست‌وجو و فیلترهای انتخابی یافت نشد.
      </div>
    </div>

    <!-- جدول داده‌های محصولات (حالت دوم) -->
    <div v-else class="dyf-panel-card">
      <div class="dyf-table-container">
        <table class="dyf-table">
          <thead>
            <tr>
              <th>تصویر</th>
              <th>شناسه</th>
              <th>عنوان مدل</th>
              <th>دسته‌بندی‌ها</th>
              <th>رنگ‌ها</th>
              <th>سایزبندی</th>
              <th style="text-align: center;">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shoe in shoes" :key="shoe.ID">
              <td>
                <img
                  :src="shoe.coverImage || '/assets/images/craft-formal.jpeg'"
                  :alt="shoe.title"
                  style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px;"
                />
              </td>
              <td><span class="dyf-code-tag">#{{ shoe.modelID || shoe.ID }}</span></td>
              <td>
                <div style="font-weight: 700; color: var(--text-ivory); cursor: pointer;" @click="openDossierModal(shoe)">
                  {{ shoe.title }}
                </div>
              </td>
              <td>
                <span v-for="c in shoe.categories" :key="c.ID" class="dyf-badge dyf-badge-cat" style="margin-left: 4px;">
                  {{ c.title }}
                </span>
              </td>
              <td>{{ shoe.colors.join('، ') }}</td>
              <td>{{ shoe.sizes.join(' - ') }}</td>
              <td style="text-align: center;">
                <div style="display: inline-flex; gap: 0.35rem;">
                  <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-xs" @click="openDossierModal(shoe)">
                    مشاهده
                  </button>
                  <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-xs" @click="openEditModal(shoe)">
                    ویرایش
                  </button>
                  <button
                    type="button"
                    class="dyf-btn dyf-btn-outline dyf-btn-xs"
                    style="color: #e06d53; border-color: rgba(224, 109, 83, 0.4);"
                    @click="handleDeleteShoe(shoe)"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!shoes.length && !isLoading">
              <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                هیچ مدلی یافت نشد.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- مودال فرم ایجاد / ویرایش کفش -->
    <ShoeFormModal
      :show="isFormModalOpen"
      :shoe-to-edit="shoeToEdit"
      :categories="categories"
      @close="isFormModalOpen = false"
      @saved="loadData"
    />

    <!-- مودال شناسنامه فنی -->
    <ShoeDossierModal
      :show="isDossierModalOpen"
      :shoe="shoeForDossier"
      @close="isDossierModalOpen = false"
      @edit="openEditModal"
    />
  </section>
</template>
