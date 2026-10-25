<template>
  <div
    v-if="isOpen"
    id="modalCategoryForm"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 440px; display: flex; flex-direction: column;"
      @click.stop
    >
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title" id="categoryFormModalTitle">
            {{ isEdit ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید' }}
          </h3>
        </div>
        <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">
          &times;
        </button>
      </div>

      <form id="categoryEditForm" style="padding: 1.5rem;" @submit.prevent="handleSubmit">
        <div class="dyf-form-group" style="margin-bottom: 0;">
          <label class="dyf-form-label dyf-form-label-required">نام دسته‌بندی</label>
          <input
            v-model="categoryName"
            type="text"
            id="categoryFormName"
            class="dyf-input"
            placeholder="مثال: کفش رسمی، کالج، بوت، اسپرت"
            required
            autofocus
          />
          <p class="dyf-form-hint">این عنوان در فیلترها و فرم ثبت مدل کفش نمایش داده می‌شود.</p>
        </div>
      </form>

      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" @click="close">
          انصراف
        </button>
        <button
          type="button"
          id="saveCategoryBtn"
          class="dyf-btn dyf-btn-primary"
          :disabled="!categoryName.trim()"
          @click="handleSubmit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>{{ isEdit ? 'ذخیره تغییرات' : 'ذخیره دسته‌بندی' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  category: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'save']);

const categoryName = ref('');
const isEdit = computed(() => !!props.category);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      categoryName.value = props.category ? props.category.name : '';
    }
  }
);

function handleSubmit() {
  if (!categoryName.value.trim()) return;
  emit('save', {
    name: categoryName.value.trim(),
  });
}

function close() {
  emit('close');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) close();
}
</script>
