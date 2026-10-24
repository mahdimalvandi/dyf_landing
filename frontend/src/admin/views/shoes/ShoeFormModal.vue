<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { shoesService } from '@/shared/api/services';
import type { ShoeDetailResponse, CategoryResponse, CreateShoeRequest, UpdateShoeRequest } from '@/shared/api/types';

const props = defineProps<{
  show: boolean;
  shoeToEdit: ShoeDetailResponse | null;
  categories: CategoryResponse[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const form = ref({
  id: 0,
  title: '',
  description: '',
  categoryIDs: [] as number[],
  colors: 'مشکی کلاسیک، عسلی کاراملی',
  sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'] as string[],
  coverImage: '/assets/images/craft-formal.jpeg',
  mediaUrls: [] as string[],
});

const availableSizes = ['۳۹', '۴۰', '۴۱', '۴۲', '۴۳', '۴۴', '۴۵', '۴۶'];

const isEditMode = computed(() => Boolean(props.shoeToEdit && props.shoeToEdit.ID > 0));

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      formError.value = null;
      if (props.shoeToEdit) {
        form.value = {
          id: props.shoeToEdit.ID,
          title: props.shoeToEdit.title,
          description: props.shoeToEdit.description || '',
          categoryIDs: props.shoeToEdit.categories.map((c) => c.ID),
          colors: props.shoeToEdit.colors ? props.shoeToEdit.colors.join('، ') : '',
          sizes: props.shoeToEdit.sizes || ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
          coverImage: props.shoeToEdit.coverImage || '',
          mediaUrls: props.shoeToEdit.media ? props.shoeToEdit.media.map((m) => m.mediaURL) : [],
        };
      } else {
        form.value = {
          id: 0,
          title: '',
          description: '',
          categoryIDs: props.categories.length ? [props.categories[0].ID] : [],
          colors: 'مشکی کلاسیک، عسلی کاراملی',
          sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
          coverImage: '/assets/images/craft-formal.jpeg',
          mediaUrls: ['/assets/images/craft-formal.jpeg'],
        };
      }
    }
  },
  { immediate: true }
);

function toggleCategory(catId: number) {
  const idx = form.value.categoryIDs.indexOf(catId);
  if (idx > -1) {
    if (form.value.categoryIDs.length > 1) {
      form.value.categoryIDs.splice(idx, 1);
    }
  } else {
    form.value.categoryIDs.push(catId);
  }
}

function toggleSize(sz: string) {
  const idx = form.value.sizes.indexOf(sz);
  if (idx > -1) {
    form.value.sizes.splice(idx, 1);
  } else {
    form.value.sizes.push(sz);
  }
}

function setCover(url: string) {
  form.value.coverImage = url;
}

function removeMedia(url: string) {
  form.value.mediaUrls = form.value.mediaUrls.filter((u) => u !== url);
  if (form.value.coverImage === url) {
    form.value.coverImage = form.value.mediaUrls[0] || '';
  }
}

async function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files.length) return;

  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i];
    try {
      isSubmitting.value = true;
      const res = await shoesService.uploadMedia(file);
      if (res.success && res.data?.url) {
        form.value.mediaUrls.push(res.data.url);
        if (!form.value.coverImage) {
          form.value.coverImage = res.data.url;
        }
      }
    } catch {
      // Fallback: local blob url for preview
      const localUrl = URL.createObjectURL(file);
      form.value.mediaUrls.push(localUrl);
      if (!form.value.coverImage) {
        form.value.coverImage = localUrl;
      }
    } finally {
      isSubmitting.value = false;
    }
  }
}

async function handleSubmit() {
  formError.value = null;
  const title = form.value.title.trim();
  if (!title) {
    formError.value = 'عنوان مدل کفش الزامی است.';
    return;
  }
  if (!form.value.categoryIDs.length) {
    formError.value = 'حداقل یک دسته‌بندی باید انتخاب شود.';
    return;
  }

  const colors = form.value.colors
    .split(/[،,]/)
    .map((c) => c.trim())
    .filter(Boolean);

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      const payload: UpdateShoeRequest = {
        title,
        description: form.value.description,
        categoryIDs: form.value.categoryIDs,
        colors,
        sizes: form.value.sizes,
      };
      const res = await shoesService.update(form.value.id, payload);
      if (res.success) {
        emit('saved');
        emit('close');
      } else {
        formError.value = res.message || 'خطا در ویرایش مدل کفش';
      }
    } else {
      const payload: CreateShoeRequest = {
        title,
        description: form.value.description,
        categoryIDs: form.value.categoryIDs,
        colors,
        sizes: form.value.sizes,
      };
      const res = await shoesService.create(payload);
      if (res.success) {
        emit('saved');
        emit('close');
      } else {
        formError.value = res.message || 'خطا در ثبت مدل کفش';
      }
    }
  } catch (err: any) {
    formError.value = err.message || 'خطای غیرمنتظره در ارتباط با سرور';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div v-if="show" class="dyf-modal-backdrop is-open" @click.self="emit('close')">
    <div class="dyf-modal-card" style="max-width: 720px; max-height: 90vh; display: flex; flex-direction: column;">
      <!-- هدر مودال -->
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title">
            {{ isEditMode ? 'ویرایش اطلاعات مدل کفش' : 'ثبت مدل کفش جدید' }}
          </h3>
        </div>
        <button type="button" class="dyf-modal-close" @click="emit('close')">&times;</button>
      </div>

      <!-- فرم بدنه با قابلیت اسکرول -->
      <form style="flex: 1; overflow-y: auto; padding: 1.5rem;" @submit.prevent="handleSubmit">
        <!-- پیام خطا -->
        <div v-if="formError" class="dyf-alert dyf-alert-danger" style="margin-bottom: 1.25rem;">
          {{ formError }}
        </div>

        <!-- شناسه عددی و عنوان مدل -->
        <div class="dyf-form-row-shoe-id" style="display: grid; grid-template-columns: 140px 1fr; gap: 1rem; margin-bottom: 1.25rem;">
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">شناسه</label>
            <input
              type="text"
              class="dyf-input"
              readonly
              :value="isEditMode ? `#${form.id}` : 'خودکار'"
              style="background: rgba(20, 18, 16, 0.7); color: var(--gold-primary); font-weight: 800; font-family: var(--font-title); text-align: center; direction: ltr;"
            />
          </div>
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label dyf-form-label-required">عنوان مدل</label>
            <input
              v-model="form.title"
              type="text"
              class="dyf-input"
              placeholder="مثال: کفش رسمی آکسفورد چرم هورس واکس"
              required
            />
          </div>
        </div>

        <!-- انتخاب دسته‌بندی‌ها (امکان انتخاب چند دسته) -->
        <div class="dyf-form-group">
          <label class="dyf-form-label dyf-form-label-required">دسته‌بندی‌های مرتبط</label>
          <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
            <button
              v-for="cat in categories"
              :key="cat.ID"
              type="button"
              class="dyf-btn dyf-btn-sm"
              :class="form.categoryIDs.includes(cat.ID) ? 'dyf-btn-primary' : 'dyf-btn-outline'"
              style="padding: 0.35rem 0.85rem;"
              @click="toggleCategory(cat.ID)"
            >
              {{ cat.title }}
            </button>
          </div>
        </div>

        <!-- توضیحات و مشخصات متریال -->
        <div class="dyf-form-group">
          <label class="dyf-form-label">توضیحات و مشخصات چرم</label>
          <textarea
            v-model="form.description"
            class="dyf-textarea"
            rows="3"
            placeholder="توضیحات نوع چرم، نوع آستر، مشخصات زیره و ساختار ارگونومیک..."
          ></textarea>
        </div>

        <!-- رنگ‌ها و سایزها -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">رنگ‌ها (با کاما یا ، جدا کنید)</label>
            <input
              v-model="form.colors"
              type="text"
              class="dyf-input"
              placeholder="مشکی، عسلی، قهوه‌ای سوخته"
            />
          </div>
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">سایزبندی موجود</label>
            <div class="dyf-sizes-selector" style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              <label
                v-for="sz in availableSizes"
                :key="sz"
                class="dyf-size-checkbox-label"
                style="cursor: pointer;"
              >
                <input
                  type="checkbox"
                  :value="sz"
                  :checked="form.sizes.includes(sz)"
                  style="display: none;"
                  @change="toggleSize(sz)"
                />
                <span
                  class="dyf-size-box"
                  :style="form.sizes.includes(sz) ? 'background: var(--gold-primary); color: #000; border-color: var(--gold-primary); font-weight: 700;' : ''"
                >
                  {{ sz }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- بخش مدیریت رسانه‌ها (تصاویر) -->
        <div class="dyf-form-group">
          <label class="dyf-form-label">تصاویر مدل و کاور اصلی</label>

          <label
            class="dyf-media-uploader"
            style="cursor: pointer; display: block; text-align: center; border: 1px dashed var(--border-subtle); padding: 1.5rem; border-radius: var(--r-sm);"
          >
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              style="display: none;"
              @change="handleFileUpload"
            />
            <svg class="dyf-media-uploader-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 0.5rem; color: var(--gold-primary);">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <div style="font-weight: 700; color: var(--text-ivory); margin-bottom: 0.25rem;">
              برای انتخاب تصویر یا فایل، کلیک کنید
            </div>
            <div style="font-size: 0.78rem; color: var(--gold-light);">
              تصاویر بارگذاری‌شده در گالری زیر نمایش داده می‌شوند.
            </div>
          </label>

          <!-- پیش‌نمایش رسانه‌ها همراه با انتخاب کاور -->
          <div
            v-if="form.mediaUrls.length"
            class="dyf-media-grid"
            style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 0.75rem; margin-top: 1rem;"
          >
            <div
              v-for="url in form.mediaUrls"
              :key="url"
              class="dyf-media-preview-card"
              style="position: relative; border-radius: var(--r-sm); overflow: hidden; border: 2px solid;"
              :style="form.coverImage === url ? 'border-color: var(--gold-primary);' : 'border-color: var(--border-subtle);'"
            >
              <img :src="url" alt="تصویر کفش" style="width: 100%; height: 90px; object-fit: cover;" />
              <div
                style="position: absolute; bottom: 0; inset-inline: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: space-between; padding: 2px 4px;"
              >
                <button
                  type="button"
                  style="font-size: 0.65rem; color: var(--gold-primary); background: transparent; border: none; cursor: pointer;"
                  @click="setCover(url)"
                >
                  {{ form.coverImage === url ? '★ کاور' : 'کاور' }}
                </button>
                <button
                  type="button"
                  style="font-size: 0.65rem; color: #e06d53; background: transparent; border: none; cursor: pointer;"
                  @click="removeMedia(url)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- فوتر دکمه‌های اقدام -->
      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" :disabled="isSubmitting" @click="emit('close')">
          انصراف
        </button>
        <button
          type="button"
          class="dyf-btn dyf-btn-primary"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>{{ isSubmitting ? 'در حال ثبت...' : (isEditMode ? 'بروزرسانی مدل' : 'ذخیره مدل کفش') }}</span>
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
