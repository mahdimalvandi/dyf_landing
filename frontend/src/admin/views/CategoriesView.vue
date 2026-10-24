<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { categoriesService } from '@/shared/api/services';
import type { CategoryResponse } from '@/shared/api/types';
import { useToast } from '../stores/toast';
import { useConfirm } from '../stores/confirm';
import CategoryFormModal from './categories/CategoryFormModal.vue';

const toast = useToast();
const { confirm } = useConfirm();

const isLoading = ref(true);
const categories = ref<CategoryResponse[]>([]);
const searchQuery = ref('');

// Modal states
const isModalOpen = ref(false);
const categoryToEdit = ref<CategoryResponse | null>(null);

async function loadCategories() {
  isLoading.value = true;
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
}

onMounted(() => {
  loadCategories();
});

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return categories.value;
  return categories.value.filter((cat) => cat.title.toLowerCase().includes(q));
});

function openCreateModal() {
  categoryToEdit.value = null;
  isModalOpen.value = true;
}

function openEditModal(cat: CategoryResponse) {
  categoryToEdit.value = cat;
  isModalOpen.value = true;
}

async function handleDelete(cat: CategoryResponse) {
  const confirmMsg =
    cat.shoeCount && cat.shoeCount > 0
      ? `توجه: این دسته‌بندی دارای ${cat.shoeCount} مدل کفش وابسته است. آیا از حذف دسته‌بندی «${cat.title}» اطمینان دارید؟`
      : `آیا از حذف دسته‌بندی «${cat.title}» اطمینان دارید؟`;

  const confirmed = await confirm({
    title: 'حذف دسته‌بندی',
    message: confirmMsg,
    confirmText: 'حذف دسته‌بندی',
    isDestructive: true,
  });

  if (!confirmed) return;

  try {
    const res = await categoriesService.delete(cat.ID);
    if (res.success) {
      toast.success(`دسته‌بندی «${cat.title}» با موفقیت حذف گردید.`);
      await loadCategories();
    } else {
      toast.error(res.message || 'خطا در حذف دسته‌بندی');
    }
  } catch (err: any) {
    toast.error(err.message || 'خطا در برقراری ارتباط با سرور');
  }
}
</script>

<template>
  <section class="dyf-view is-active">
    <!-- هدر سکشن دسته‌بندی‌ها -->
    <div class="dyf-dashboard-hero" style="margin-bottom: 1.5rem; padding: 1.4rem 1.8rem;">
      <div class="dyf-dashboard-hero-text">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h1>مدیریت دسته‌بندی‌ها</h1>
          <span class="dyf-badge dyf-badge-active">
            {{ categories.length }} دسته ثبت‌شده
          </span>
        </div>
      </div>
      <div class="dyf-dashboard-hero-meta">
        <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-lg" @click="openCreateModal">
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

    <!-- حالت اسکلتون بارگذاری -->
    <div v-if="isLoading" class="dyf-categories-grid">
      <div v-for="i in 4" :key="`cat-skel-${i}`" class="dyf-category-card">
        <div class="dyf-skeleton" style="height: 24px; width: 60%; margin-bottom: 0.75rem;"></div>
        <div class="dyf-skeleton" style="height: 16px; width: 40%; margin-bottom: 1.25rem;"></div>
        <div class="dyf-skeleton" style="height: 32px; width: 100%;"></div>
      </div>
    </div>

    <!-- گرید کارت‌های دسته‌بندی -->
    <div v-else class="dyf-categories-grid">
      <div v-for="cat in filteredCategories" :key="cat.ID" class="dyf-category-card">
        <div class="dyf-category-header">
          <h3 class="dyf-category-title">{{ cat.title }}</h3>
          <span class="dyf-badge dyf-badge-published">فعال</span>
        </div>

        <div class="dyf-category-meta">
          <span class="dyf-category-count">{{ cat.shoeCount || 0 }} مدل ثبت‌شده</span>
        </div>

        <div class="dyf-category-actions" style="margin-top: 1.25rem; display: flex; gap: 0.5rem;">
          <button
            type="button"
            class="dyf-btn dyf-btn-outline dyf-btn-xs"
            style="flex: 1;"
            @click="openEditModal(cat)"
          >
            ویرایش عنوان
          </button>
          <button
            type="button"
            class="dyf-btn dyf-btn-outline dyf-btn-xs"
            style="color: #e06d53; border-color: rgba(224, 109, 83, 0.4);"
            title="حذف دسته‌بندی"
            @click="handleDelete(cat)"
          >
            حذف
          </button>
        </div>
      </div>

      <div
        v-if="!filteredCategories.length && !isLoading"
        style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem 1rem;"
      >
        هیچ دسته‌بندی با مشخصات واردشده یافت نشد.
      </div>
    </div>

    <!-- مودال فرم ایجاد / ویرایش دسته‌بندی -->
    <CategoryFormModal
      :show="isModalOpen"
      :category-to-edit="categoryToEdit"
      :existing-categories="categories"
      @close="isModalOpen = false"
      @saved="loadCategories"
    />
  </section>
</template>
