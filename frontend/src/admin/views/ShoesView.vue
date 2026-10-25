<template>
  <!-- ==================================================================
       ویو ۲: مدیریت مدل‌های کفش (#shoes — تسک ۲)
       ================================================================== -->
  <section id="viewShoes" class="dyf-view is-active">
    <!-- هدر سکشن محصولات -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت مدل‌های کفش</h1>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" id="openAddShoeModalBtn" class="dyf-btn dyf-btn-primary dyf-btn-lg" @click="$emit('create')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>ثبت مدل کفش جدید</span>
        </button>
      </div>
    </div>

    <!-- نوار ابزار جست‌وجو و فیلتر -->
    <div class="dyf-toolbar">
      <!-- جست‌وجو بر اساس عنوان و شناسه عددی -->
      <div class="dyf-toolbar-search">
        <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          id="shoesSearchInput"
          v-model="searchQuery"
          class="dyf-quick-search-input"
          placeholder="جست‌وجو با عنوان یا شناسه عددی (مثال: ۱۰۱)..."
          @input="currentPage = 1"
        >
      </div>

      <!-- فیلتر دسته‌بندی -->
      <div class="dyf-toolbar-filter-wrap">
        <select
          id="shoesCategoryFilter"
          v-model="selectedCategory"
          class="dyf-select"
          style="height: 38px; padding-top: 0.4rem; padding-bottom: 0.4rem;"
          @change="currentPage = 1"
        >
          <option value="all">همه دسته‌بندی‌ها ({{ shoes.length }})</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.name">
            {{ cat.name }} ({{ getCategoryCount(cat.name) }})
          </option>
        </select>
      </div>

      <!-- سوئیچ گرید / جدول -->
      <div class="dyf-view-toggle">
        <button
          type="button"
          id="shoesViewGridBtn"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'grid' }"
          title="نمایش گرید کارت‌ها"
          @click="viewMode = 'grid'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </button>
        <button
          type="button"
          id="shoesViewTableBtn"
          class="dyf-view-btn"
          :class="{ 'is-active': viewMode === 'table' }"
          title="نمایش جدول داده‌ها"
          @click="viewMode = 'table'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- گرید تصویری محصولات -->
    <div v-if="viewMode === 'grid' && filteredShoes.length > 0" id="shoesGridContainer" class="dyf-product-grid">
      <article
        v-for="model in paginatedShoes"
        :key="model.id"
        class="dyf-product-card"
        :data-id="model.id"
        title="مشاهده شناسنامه و جزئیات"
        @click="$emit('open-dossier', model.id)"
      >
        <div class="dyf-product-thumb-wrap">
          <img :src="getPrimaryMediaUrl(model)" :alt="model.title" class="dyf-product-thumb" loading="lazy" @error="$event.target.src = '/assets/images/shoes.jpeg'">
          <div class="dyf-product-id-badge">DYF-{{ model.id }}</div>
        </div>

        <div class="dyf-product-body">
          <h3 class="dyf-product-title">{{ model.title }}</h3>
          <div class="dyf-product-categories">
            <span v-for="c in model.categories" :key="c" class="dyf-category-pill">{{ c }}</span>
          </div>

          <div class="dyf-product-specs-row">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span>تعداد رنگ:</span>
              <span style="color: var(--text-main); font-weight: 700;">{{ (model.colors || []).length }}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span>تعداد سایز:</span>
              <span style="color: var(--gold-light); font-weight: 700;">{{ (model.sizes || []).length }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- جدول داده‌های محصولات (حالت دوم) -->
    <div v-if="viewMode === 'table' && filteredShoes.length > 0" id="shoesTableContainer" class="dyf-panel-card">
      <div class="dyf-table-container">
        <table class="dyf-table">
          <thead>
            <tr>
              <th style="width: 70px;">تصویر</th>
              <th style="width: 100px;">شناسه</th>
              <th style="min-width: 220px;">عنوان مدل</th>
              <th style="min-width: 180px;">دسته‌بندی‌ها</th>
              <th class="dyf-th-actions" style="width: 150px; text-align: center;">عملیات</th>
            </tr>
          </thead>
          <tbody id="shoesTableBody">
            <tr
              v-for="model in paginatedShoes"
              :key="model.id"
              :data-id="model.id"
              style="cursor: pointer;"
              title="مشاهده شناسنامه مدل"
              @click="$emit('open-dossier', model.id)"
            >
              <td style="width: 70px;">
                <img
                  :src="getPrimaryMediaUrl(model)"
                  :alt="model.title"
                  style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--r-sm); border: 1px solid var(--border-subtle); display: block;"
                  @error="$event.target.src = '/assets/images/shoes.jpeg'"
                >
              </td>
              <td style="width: 100px; font-family: var(--font-title); font-weight: 700; color: var(--gold-light); direction: ltr; text-align: right;">
                DYF-{{ model.id }}
              </td>
              <td style="min-width: 220px;">
                <div style="font-weight: 700; color: var(--text-ivory);">{{ model.title }}</div>
              </td>
              <td style="min-width: 180px;">
                <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                  <span v-for="c in model.categories" :key="c" class="dyf-category-pill" style="font-size: 0.68rem;">{{ c }}</span>
                </div>
              </td>
              <td style="width: 150px;">
                <div class="dyf-table-actions" style="justify-content: flex-end;">
                  <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-shoe" @click.stop="$emit('edit', model)">ویرایش</button>
                  <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-dossier-shoe" @click.stop="$emit('open-dossier', model.id)">شناسنامه</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نوار صفحه‌بندی محصولات (Pagination) -->
    <div v-if="totalPages > 1 && filteredShoes.length > 0" id="shoesPagination" class="dyf-pagination-container" style="justify-content: center; padding: 0.75rem 1rem;">
      <div class="dyf-pagination-pages" id="shoesPaginationPages">
        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          class="dyf-pagination-btn"
          :class="{ 'is-active': p === currentPage }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- وضعیت بدون نتیجه (Empty Search/Filter State) -->
    <div v-if="filteredShoes.length === 0" id="shoesEmptyState" class="dyf-panel-card dyf-empty-state">
      <svg class="dyf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m9 9 4 4"/><path d="m13 9-4 4"/></svg>
      <h3 class="dyf-empty-title">هیچ مدلی با مشخصات انتخابی یافت نشد</h3>
      <p class="dyf-empty-desc">برای عبارت یا فیلترهای اعمال‌شده، مدل کفشی پیدا نشد. می‌توانید فیلترها را بازنشانی کرده یا مدل جدیدی ثبت کنید.</p>
      <button type="button" id="resetShoesFiltersBtn" class="dyf-btn dyf-btn-outline" @click="resetFilters">
        بازنشانی فیلترها
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { normalizeImageUrl } from '../../shared/utils/format.js';

const props = defineProps({
  shoes: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['create', 'edit', 'delete', 'open-dossier', 'open-lightbox']);

const searchQuery = ref('');
const selectedCategory = ref('all');
const viewMode = ref('grid');
const currentPage = ref(1);
const pageSize = 12;

const getCategoryCount = (catName) => {
  return props.shoes.filter((s) => (s.categories || []).includes(catName)).length;
};

const getPrimaryMediaUrl = (model) => {
  const primary = (model.media || []).find((m) => m.isPrimary) || (model.media && model.media[0]);
  const url = primary ? primary.url : model.image;
  return normalizeImageUrl(url);
};

const filteredShoes = computed(() => {
  return props.shoes.filter((shoe) => {
    if (searchQuery.value) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchTitle = (shoe.title || '').toLowerCase().includes(q);
      const matchId = String(shoe.id).includes(q);
      if (!matchTitle && !matchId) return false;
    }

    if (selectedCategory.value !== 'all') {
      if (!(shoe.categories || []).includes(selectedCategory.value)) {
        return false;
      }
    }

    return true;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredShoes.value.length / pageSize) || 1;
});

const paginatedShoes = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredShoes.value.slice(start, start + pageSize);
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  currentPage.value = 1;
};
</script>
