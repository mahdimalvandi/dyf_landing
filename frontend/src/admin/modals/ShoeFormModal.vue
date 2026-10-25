<template>
  <div
    v-if="isOpen"
    id="modalShoeForm"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 720px; max-height: 90vh; display: flex; flex-direction: column;"
      @click.stop
    >
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title" id="shoeFormModalTitle">
            {{ isEdit ? 'ویرایش اطلاعات مدل کفش' : 'ثبت مدل کفش جدید' }}
          </h3>
        </div>
        <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">&times;</button>
      </div>

      <form id="shoeEditForm" style="flex: 1; overflow-y: auto; padding: 1.5rem;" @submit.prevent="handleSubmit">
        <input type="hidden" id="shoeFormMode" :value="isEdit ? 'edit' : 'create'">

        <!-- شناسه عددی خودکار و عنوان مدل -->
        <div class="dyf-form-row-shoe-id dyf-form-row-grid" style="display: grid; grid-template-columns: 140px 1fr; gap: 1rem; margin-bottom: 1.25rem;">
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">شناسه</label>
            <input
              type="text"
              id="shoeFormId"
              class="dyf-input"
              readonly
              :value="formId || 'خودکار'"
              style="background: rgba(20, 18, 16, 0.7); color: var(--gold-primary); font-weight: 800; font-family: var(--font-title); text-align: center; direction: ltr;"
            >
          </div>
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label dyf-form-label-required">عنوان مدل</label>
            <input
              type="text"
              id="shoeFormTitle"
              v-model="formTitle"
              class="dyf-input"
              placeholder="مثال: کفش رسمی آکسفورد چرم هورس واکس"
              required
            >
          </div>
        </div>

        <!-- انتخاب دسته‌بندی‌ها (امکان انتخاب چند دسته) -->
        <div class="dyf-form-group">
          <label class="dyf-form-label dyf-form-label-required">دسته‌بندی‌های مرتبط</label>
          <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;" id="shoeFormCategoriesWrap">
            <label
              v-for="cat in availableCategories"
              :key="cat.id"
              class="dyf-category-checkbox-card"
              :class="{ 'is-checked': selectedCategories.includes(cat.name) }"
            >
              <span class="dyf-category-checkbox-name">{{ cat.name }}</span>
              <input
                type="checkbox"
                name="shoeCategories"
                :value="cat.name"
                v-model="selectedCategories"
              >
            </label>
          </div>
          <p v-if="categoryError" class="dyf-form-hint dyf-form-hint-error" style="margin-top: 0.35rem;">
            حداقل یک دسته‌بندی باید انتخاب شود.
          </p>
        </div>

        <!-- توضیحات و مشخصات متریال -->
        <div class="dyf-form-group">
          <label class="dyf-form-label">توضیحات</label>
          <textarea
            id="shoeFormDesc"
            v-model="formDesc"
            class="dyf-textarea"
            rows="3"
            placeholder="توضیحات نوع چرم، نوع آستر، مشخصات زیره و ساختار ارگونومیک..."
          ></textarea>
        </div>

        <!-- رنگ‌ها و سایزها -->
        <div class="dyf-form-row-2col dyf-form-row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">رنگ‌ها</label>
            <input
              type="text"
              id="shoeFormColors"
              v-model="formColors"
              class="dyf-input"
              placeholder="مشکی، عسلی، قهوه‌ای سوخته"
            >
          </div>
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">سایزبندی</label>
            <div class="dyf-sizes-selector" id="shoeFormSizesWrap">
              <label
                v-for="size in allSizes"
                :key="size"
                class="dyf-size-checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="size"
                  v-model="selectedSizes"
                >
                <span class="dyf-size-box">{{ size }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- بخش مدیریت رسانه‌ها (تصاویر و ویدئوها) -->
        <div class="dyf-form-group">
          <label class="dyf-form-label dyf-form-label-required">تصاویر مدل</label>
          
          <div
            class="dyf-media-uploader"
            id="shoeMediaDropzone"
            style="cursor: pointer;"
            title="برای انتخاب فایل‌های عکس یا ویدئو کلیک کنید"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              id="shoeFileInput"
              accept="image/*,video/*"
              multiple
              style="display: none;"
              @change="handleFileChange"
            >
            <svg class="dyf-media-uploader-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <div style="font-weight: 700; color: var(--text-ivory); margin-bottom: 0.25rem;">برای انتخاب تصویر یا ویدئو، روی این کادر کلیک کنید</div>
            <div style="font-size: 0.78rem; color: var(--gold-primary);">یا فایل‌ها را به داخل این کادر بکشید و رها کنید</div>
          </div>

          <!-- گرید پیش‌نمایش رسانه‌ها همراه با جابه‌جایی و انتخاب کاور -->
          <div id="shoeMediaGrid" class="dyf-media-grid">
            <div
              v-if="!mediaList.length"
              style="grid-column: 1 / -1; text-align: center; padding: 1rem; color: var(--text-dim); font-size: 0.82rem;"
            >
              هنوز تصویری انتخاب نشده است. لطفاً حداقل یک تصویر برای مدل بارگذاری کنید.
            </div>

            <div
              v-for="(item, index) in mediaList"
              :key="index"
              class="dyf-media-card"
              :class="{ 'is-primary': item.isPrimary }"
            >
              <div class="dyf-media-thumb-wrap">
                <video v-if="item.type === 'video'" :src="item.url" class="dyf-media-thumb" muted></video>
                <img v-else :src="item.url" alt="پیش‌نمایش" class="dyf-media-thumb" @error="$event.target.src = '/assets/images/shoes.jpeg'">
                <span v-if="item.isPrimary" class="dyf-media-primary-badge">عکس اصلی</span>
              </div>
              <div class="dyf-media-card-actions">
                <button
                  type="button"
                  class="dyf-media-card-btn js-set-cover"
                  :class="{ 'is-active': item.isPrimary }"
                  @click="setPrimary(index)"
                >
                  {{ item.isPrimary ? '★ عکس اصلی' : 'انتخاب به عنوان عکس اصلی' }}
                </button>
                <button
                  type="button"
                  class="dyf-media-card-btn dyf-media-card-btn-danger js-remove-media"
                  @click="removeMedia(index)"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" @click="close">انصراف</button>
        <button type="button" id="saveShoeBtn" class="dyf-btn dyf-btn-primary" @click="handleSubmit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span id="saveShoeBtnText">{{ isEdit ? 'ذخیره تغییرات مدل' : 'ذخیره اطلاعات مدل' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { normalizeImageUrl } from '../../shared/utils/format.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  shoe: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'save']);

const allSizes = ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴', '۴۵'];

const fileInputRef = ref(null);
const formId = ref(null);
const formTitle = ref('');
const formDesc = ref('');
const formColors = ref('');
const selectedCategories = ref([]);
const selectedSizes = ref(['۴۰', '۴۱', '۴۲', '۴۳', '۴۴']);
const mediaList = ref([]);
const categoryError = ref(false);

const isEdit = computed(() => !!props.shoe);
const availableCategories = computed(() => props.categories || []);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.shoe) {
        formId.value = props.shoe.id;
        formTitle.value = props.shoe.title || '';
        formDesc.value = props.shoe.description || '';
        formColors.value = Array.isArray(props.shoe.colors)
          ? props.shoe.colors.map((c) => (typeof c === 'object' ? c.name : c)).join('، ')
          : (props.shoe.colors || '');
        selectedCategories.value = [...(props.shoe.categories || [])];
        selectedSizes.value = props.shoe.sizes?.length ? [...props.shoe.sizes] : ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'];
        mediaList.value = props.shoe.media?.length
          ? props.shoe.media.map((m) => ({ ...m, url: normalizeImageUrl(m.url) }))
          : [{ url: normalizeImageUrl(props.shoe.image), type: 'image', isPrimary: true }];
      } else {
        formId.value = null;
        formTitle.value = '';
        formDesc.value = '';
        formColors.value = 'مشکی کلاسیک، عسلی کاراملی';
        selectedCategories.value = availableCategories.value.length ? [availableCategories.value[0].name] : [];
        selectedSizes.value = ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'];
        mediaList.value = [
          { url: '/assets/images/craft-formal.jpeg', type: 'image', isPrimary: true },
        ];
      }
      categoryError.value = false;
    }
  }
);

function triggerFileInput() {
  if (fileInputRef.value) fileInputRef.value.click();
}

function handleFileChange(e) {
  const files = Array.from(e.target.files || []);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      mediaList.value.push({
        url: evt.target.result,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        isPrimary: mediaList.value.length === 0,
      });
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

function handleDrop(e) {
  const files = Array.from(e.dataTransfer.files || []);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      mediaList.value.push({
        url: evt.target.result,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        isPrimary: mediaList.value.length === 0,
      });
    };
    reader.readAsDataURL(file);
  });
}

function setPrimary(index) {
  mediaList.value.forEach((m, idx) => {
    m.isPrimary = idx === index;
  });
}

function removeMedia(index) {
  const wasPrimary = mediaList.value[index]?.isPrimary;
  mediaList.value.splice(index, 1);
  if (wasPrimary && mediaList.value.length > 0) {
    mediaList.value[0].isPrimary = true;
  }
}

function handleSubmit() {
  if (!formTitle.value.trim()) return;

  if (selectedCategories.value.length === 0) {
    categoryError.value = true;
    return;
  }

  const colors = formColors.value
    ? formColors.value.split(/[,،]+/).map((c) => c.trim()).filter(Boolean)
    : [];

  emit('save', {
    id: formId.value,
    title: formTitle.value.trim(),
    description: formDesc.value.trim(),
    categories: selectedCategories.value,
    colors,
    sizes: selectedSizes.value,
    media: mediaList.value,
  });
}

function close() {
  emit('close');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close();
  }
}
</script>
