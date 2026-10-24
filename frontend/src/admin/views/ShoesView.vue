<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { shoesService, categoriesService } from '@/shared/api/services';
import type { ShoeItemResponse, CategoryResponse } from '@/shared/api/types';

const isLoading = ref(true);
const shoes = ref<ShoeItemResponse[]>([]);
const categories = ref<CategoryResponse[]>([]);
const searchQuery = ref('');
const selectedCategory = ref<number | 'all'>('all');
const viewMode = ref<'grid' | 'table'>('grid');

onMounted(async () => {
  try {
    const [shoesRes, catsRes] = await Promise.all([
      shoesService.getAll({ page: 1, limit: 50 }),
      categoriesService.getAll(),
    ]);
    if (shoesRes.success && shoesRes.data?.items) {
      shoes.value = shoesRes.data.items;
    }
    if (catsRes.success && catsRes.data) {
      categories.value = catsRes.data;
    }
  } catch (err) {
    console.error('Failed to load shoes data:', err);
  } finally {
    isLoading.value = false;
  }
});

const filteredShoes = computed(() => {
  return shoes.value.filter((shoe) => {
    const matchCat =
      selectedCategory.value === 'all' ||
      shoe.categories.some((c) => c.ID === selectedCategory.value);
    const q = searchQuery.value.trim().toLowerCase();
    const matchQuery =
      !q ||
      shoe.title.toLowerCase().includes(q) ||
      String(shoe.modelID).includes(q) ||
      (shoe.description && shoe.description.toLowerCase().includes(q));
    return matchCat && matchQuery;
  });
});
</script>

<template>
  <section class="dyf-view is-active">
    <!-- هدر سکشن محصولات -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت مدل‌های کفش</h1>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-lg">
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
          placeholder="جست‌وجو با عنوان یا شناسه عددی (مثال: ۱۰۱)..."
        />
      </div>

      <!-- فیلتر دسته‌بندی -->
      <div class="dyf-toolbar-filter-wrap">
        <select
          v-model="selectedCategory"
          class="dyf-select"
          style="height: 38px; padding-top: 0.4rem; padding-bottom: 0.4rem;"
        >
          <option value="all">همه دسته‌بندی‌ها ({{ shoes.length }})</option>
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

    <!-- گرید تصویری محصولات -->
    <div v-if="viewMode === 'grid'" class="dyf-product-grid">
      <div v-for="shoe in filteredShoes" :key="shoe.ID" class="dyf-product-card">
        <div class="dyf-product-thumb-wrap">
          <img :src="shoe.coverImage" :alt="shoe.title" class="dyf-product-thumb" />
          <span class="dyf-product-id-tag">#{{ shoe.modelID }}</span>
        </div>
        <div class="dyf-product-body">
          <h3 class="dyf-product-title">{{ shoe.title }}</h3>
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
        </div>
      </div>
      <div v-if="!filteredShoes.length && !isLoading" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
        هیچ مدلی مطابق با جست‌وجوی شما یافت نشد.
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="shoe in filteredShoes" :key="shoe.ID">
              <td>
                <img :src="shoe.coverImage" :alt="shoe.title" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px;" />
              </td>
              <td><span class="dyf-code-tag">#{{ shoe.modelID }}</span></td>
              <td style="font-weight: 700; color: var(--text-ivory);">{{ shoe.title }}</td>
              <td>
                <span v-for="c in shoe.categories" :key="c.ID" class="dyf-badge dyf-badge-cat" style="margin-left: 4px;">
                  {{ c.title }}
                </span>
              </td>
              <td>{{ shoe.colors.join('، ') }}</td>
              <td>{{ shoe.sizes.join(' - ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
