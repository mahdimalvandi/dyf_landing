<template>
  <!-- ==================================================================
       ویو ۳: مدیریت دسته‌بندی‌ها (#categories — تسک ۳)
       ================================================================== -->
  <section id="viewCategories" class="dyf-view is-active">
    <!-- هدر سکشن دسته‌بندی‌ها -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت دسته‌بندی‌ها</h1>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" id="openAddCategoryModalBtn" class="dyf-btn dyf-btn-primary dyf-btn-lg" @click="$emit('create')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>ایجاد دسته‌بندی جدید</span>
        </button>
      </div>
    </div>

    <!-- نوار ابزار جست‌وجو و فیلتر دسته‌بندی‌ها -->
    <div class="dyf-toolbar">
      <!-- جست‌وجو در نام -->
      <div class="dyf-toolbar-search">
        <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          id="categorySearchInput"
          v-model="searchQuery"
          class="dyf-quick-search-input"
          placeholder="جست‌وجو در نام دسته‌بندی..."
        >
      </div>
    </div>

    <!-- گرید کارت‌های دسته‌بندی -->
    <div v-if="filteredCategories.length > 0" id="categoriesGridContainer" class="dyf-categories-grid">
      <article v-for="cat in filteredCategories" :key="cat.id" class="dyf-category-card" :data-id="cat.id">
        <div class="dyf-category-header">
          <h3 class="dyf-category-title">{{ cat.name }}</h3>
          <span class="dyf-category-badge">{{ getModelCount(cat.name) }} مدل</span>
        </div>

        <div class="dyf-category-actions">
          <div style="display: flex; gap: 0.4rem;">
            <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-edit-cat" @click="$emit('edit', cat)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              <span>ویرایش</span>
            </button>
            <button
              type="button"
              class="dyf-btn dyf-btn-outline dyf-btn-sm js-delete-cat"
              style="color: var(--status-danger); border-color: rgba(224, 86, 74, 0.3);"
              @click="$emit('delete', cat.id)"
            >
              <span>حذف</span>
            </button>
          </div>
          <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-cat-shoes" @click="$emit('view-shoes', cat.name)">
            <span>مشاهده مدل‌ها</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>
      </article>
    </div>

    <!-- وضعیت بدون نتیجه دسته‌بندی‌ها -->
    <div v-else id="categoriesEmptyState" class="dyf-panel-card dyf-empty-state">
      <svg class="dyf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m9 9 4 4"/><path d="m13 9-4 4"/></svg>
      <h3 class="dyf-empty-title">دسته‌بندی با مشخصات جست‌وجوشده پیدا نشد</h3>
      <p class="dyf-empty-desc">می‌توانید عبارت جست‌وجو را تغییر دهید یا دسته‌بندی جدیدی برای کارگاه ایجاد نمایید.</p>
      <button type="button" id="resetCategoryFiltersBtn" class="dyf-btn dyf-btn-outline" @click="searchQuery = ''">
        بازنشانی جست‌وجو
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  shoes: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['create', 'edit', 'delete', 'view-shoes']);

const searchQuery = ref('');

const getModelCount = (categoryName) => {
  return props.shoes.filter((m) => (m.categories || []).includes(categoryName)).length;
};

const filteredCategories = computed(() => {
  if (!searchQuery.value) return props.categories;
  const q = searchQuery.value.trim().toLowerCase();
  return props.categories.filter((c) => (c.name || '').toLowerCase().includes(q));
});
</script>
