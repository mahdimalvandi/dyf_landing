<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { categoriesService } from '@/shared/api/services';
import type { CategoryResponse } from '@/shared/api/types';

const isLoading = ref(true);
const categories = ref<CategoryResponse[]>([]);
const searchQuery = ref('');

onMounted(async () => {
  try {
    const res = await categoriesService.getAll();
    if (res.success && res.data) {
      categories.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  } finally {
    isLoading.value = false;
  }
});

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return categories.value;
  return categories.value.filter((cat) => cat.title.toLowerCase().includes(q));
});
</script>

<template>
  <section class="dyf-view is-active">
    <!-- هدر سکشن دسته‌بندی‌ها -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت دسته‌بندی‌ها</h1>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span>ایجاد دسته‌بندی جدید</span>
        </button>
      </div>
    </div>

    <!-- نوار ابزار جست‌وجو -->
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
          placeholder="جست‌وجو در نام دسته‌بندی..."
        />
      </div>
    </div>

    <!-- گرید کارت‌های دسته‌بندی -->
    <div class="dyf-categories-grid">
      <div v-for="cat in filteredCategories" :key="cat.ID" class="dyf-category-card">
        <div class="dyf-category-header">
          <h3 class="dyf-category-title">{{ cat.title }}</h3>
          <span class="dyf-badge dyf-badge-published">فعال</span>
        </div>
        <div class="dyf-category-meta">
          <span class="dyf-category-count">{{ cat.shoeCount }} مدل ثبت‌شده</span>
        </div>
        <div class="dyf-category-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-xs">ویرایش عنوان</button>
        </div>
      </div>
      <div v-if="!filteredCategories.length && !isLoading" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
        هیچ دسته‌بندی با مشخصات واردشده یافت نشد.
      </div>
    </div>
  </section>
</template>
