<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { categoriesService } from '@/shared/api/services';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/shared/api/types';

const props = defineProps<{
  show: boolean;
  categoryToEdit: CategoryResponse | null;
  existingCategories: CategoryResponse[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const title = ref('');
const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const isEditMode = computed(() => Boolean(props.categoryToEdit && props.categoryToEdit.ID > 0));

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      formError.value = null;
      if (props.categoryToEdit) {
        title.value = props.categoryToEdit.title;
      } else {
        title.value = '';
      }
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  formError.value = null;
  const cleanTitle = title.value.trim();

  if (!cleanTitle) {
    formError.value = 'نام دسته‌بندی الزامی است.';
    return;
  }

  // Uniqueness check
  const duplicate = props.existingCategories.find(
    (c) =>
      c.title.trim().toLowerCase() === cleanTitle.toLowerCase() &&
      (!isEditMode.value || c.ID !== props.categoryToEdit?.ID)
  );

  if (duplicate) {
    formError.value = 'دسته‌بندی با این عنوان از قبل وجود دارد.';
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value && props.categoryToEdit) {
      const payload: UpdateCategoryRequest = { title: cleanTitle };
      const res = await categoriesService.update(props.categoryToEdit.ID, payload);
      if (res.success) {
        emit('saved');
        emit('close');
      } else {
        formError.value = res.message || 'خطا در ویرایش دسته‌بندی';
      }
    } else {
      const payload: CreateCategoryRequest = { title: cleanTitle };
      const res = await categoriesService.create(payload);
      if (res.success) {
        emit('saved');
        emit('close');
      } else {
        formError.value = res.message || 'خطا در ایجاد دسته‌بندی';
      }
    }
  } catch (err: any) {
    formError.value = err.message || 'خطا در برقراری ارتباط با سرور';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div v-if="show" class="dyf-modal-backdrop is-open" @click.self="emit('close')">
    <div class="dyf-modal-card" style="max-width: 440px; display: flex; flex-direction: column;">
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title">
            {{ isEditMode ? 'ویرایش عنوان دسته‌بندی' : 'ایجاد دسته‌بندی جدید' }}
          </h3>
        </div>
        <button type="button" class="dyf-modal-close" @click="emit('close')">&times;</button>
      </div>

      <form style="padding: 1.5rem;" @submit.prevent="handleSubmit">
        <div v-if="formError" class="dyf-alert dyf-alert-danger" style="margin-bottom: 1rem;">
          {{ formError }}
        </div>

        <div class="dyf-form-group" style="margin-bottom: 0;">
          <label class="dyf-form-label dyf-form-label-required">نام دسته‌بندی</label>
          <input
            v-model="title"
            type="text"
            class="dyf-input"
            placeholder="مثال: کفش رسمی، کالج، بوت، نیم‌بوت، اسپرت"
            required
            autofocus
          />
          <p class="dyf-form-hint" style="margin-top: 0.5rem;">
            این عنوان در فیلترهای کاتالوگ عمومی و فرم‌های مدیریت نمایش داده خواهد شد.
          </p>

          <!-- پیش‌نمایش بج دسته -->
          <div v-if="title.trim()" style="margin-top: 1rem; padding: 0.75rem; background: rgba(36, 30, 25, 0.4); border-radius: var(--r-sm);">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem;">پیش‌نمایش نشان:</div>
            <span class="dyf-badge dyf-badge-cat" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">
              {{ title.trim() }}
            </span>
          </div>
        </div>
      </form>

      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" :disabled="isSubmitting" @click="emit('close')">
          انصراف
        </button>
        <button type="button" class="dyf-btn dyf-btn-primary" :disabled="isSubmitting" @click="handleSubmit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>{{ isSubmitting ? 'در حال ذخیره...' : (isEditMode ? 'بروزرسانی دسته‌بندی' : 'ذخیره دسته‌بندی') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dyf-modal-backdrop.is-open {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
