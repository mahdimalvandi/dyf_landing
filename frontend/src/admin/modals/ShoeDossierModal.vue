<template>
  <div
    v-if="isOpen && shoe"
    id="modalShoeDossier"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 960px; width: 95%; max-height: 90vh; overflow-y: auto;"
      @click.stop
    >
      <div class="dyf-modal-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <h3 class="dyf-modal-title" id="dossierTitle">
            {{ shoe.title }} (DYF-{{ shoe.id }})
          </h3>
        </div>
        <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">&times;</button>
      </div>

      <div class="dyf-modal-body" id="dossierBody">
        <div class="dyf-dossier-grid" style="display: grid; grid-template-columns: 380px 1fr; gap: 2rem; margin-bottom: 1.5rem;">
          <!-- ستون تصاویر و گالری -->
          <div>
            <div
              style="position: relative; width: 100%; aspect-ratio: 1; border-radius: var(--r-md); overflow: hidden; background: #0e0c0a; border: 1px solid var(--border-medium); margin-bottom: 0.75rem; cursor: zoom-in;"
              title="برای بزرگنمایی و مشاهده تمام‌صفحه کلیک کنید"
              @click="openLightbox"
            >
              <img
                id="dossierMasterImg"
                :src="activeImageUrl"
                :alt="shoe.title"
                style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"
                @error="onImgError"
              >
              <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(14, 12, 10, 0.8); backdrop-filter: blur(4px); padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.74rem; color: var(--gold-light); display: flex; align-items: center; gap: 0.35rem; border: 1px solid var(--border-subtle); pointer-events: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                <span>مشاهده تمام‌صفحه</span>
              </div>
            </div>

            <!-- تصاویر بندانگشتی گالری -->
            <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.4rem;">
              <img
                v-for="(m, idx) in mediaItems"
                :key="idx"
                :src="m.url"
                :alt="'عکس ' + (idx + 1)"
                :style="{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                  borderRadius: 'var(--r-sm)',
                  border: isSelectedMedia(m.url) ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }"
                :title="'مشاهده تصویر ' + (idx + 1)"
                @click="selectedImageUrl = m.url"
                @error="onImgError"
              >
            </div>
          </div>

          <!-- ستون اطلاعات و مشخصات فنی -->
          <div style="display: flex; flex-direction: column; gap: 0.95rem; font-size: 0.88rem;">
            <div>
              <span style="color: var(--text-dim); font-size: 0.78rem;">دسته‌بندی‌ها:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.25rem;">
                <span
                  v-for="c in (shoe.categories || [shoe.category]).filter(Boolean)"
                  :key="c"
                  class="dyf-category-pill"
                >
                  {{ c }}
                </span>
              </div>
            </div>

            <div>
              <span style="color: var(--text-dim); font-size: 0.78rem;">توضیحات:</span>
              <p style="color: var(--text-main); line-height: 1.7; margin-top: 0.25rem;">
                {{ shoe.description || 'توضیحات تکمیلی برای این مدل ثبت نشده است.' }}
              </p>
            </div>

            <div class="dyf-dossier-specs-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
              <div>
                <span style="color: var(--text-dim); font-size: 0.78rem;">رنگ‌های موجود:</span>
                <div style="font-weight: 700; color: var(--gold-light); margin-top: 0.2rem;">
                  {{ (shoe.colors || []).join('، ') || 'مشخص نشده' }}
                </div>
              </div>
              <div>
                <span style="color: var(--text-dim); font-size: 0.78rem;">سایزبندی سری:</span>
                <div style="font-weight: 700; color: var(--text-ivory); margin-top: 0.2rem;">
                  {{ (shoe.sizes || []).join('، ') || 'مشخص نشده' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dyf-modal-footer">
        <button
          type="button"
          id="dossierEditBtn"
          class="dyf-btn dyf-btn-primary"
          @click="handleEdit"
        >
          <span>ویرایش</span>
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
});

const emit = defineEmits(['close', 'edit', 'open-lightbox']);

const selectedImageUrl = ref(null);

const mediaItems = computed(() => {
  if (!props.shoe) return [];
  if (Array.isArray(props.shoe.media) && props.shoe.media.length > 0) {
    return props.shoe.media.map((m) => ({
      ...m,
      url: normalizeImageUrl(m.url),
    }));
  }
  if (Array.isArray(props.shoe.gallery) && props.shoe.gallery.length > 0) {
    return props.shoe.gallery.map((url, i) => ({
      url: normalizeImageUrl(url),
      type: 'image',
      isPrimary: i === 0,
    }));
  }
  const fallbackUrl = normalizeImageUrl(props.shoe.image);
  return [{ url: fallbackUrl, type: 'image', isPrimary: true }];
});

const defaultMediaUrl = computed(() => {
  const primary = mediaItems.value.find((m) => m.isPrimary);
  return primary ? primary.url : mediaItems.value[0]?.url || '/assets/images/shoes.jpeg';
});

const activeImageUrl = computed(() => {
  return selectedImageUrl.value || defaultMediaUrl.value;
});

function isSelectedMedia(url) {
  return activeImageUrl.value === url;
}

watch(
  () => props.shoe,
  () => {
    selectedImageUrl.value = null;
  }
);

function onImgError(e) {
  e.target.src = '/assets/images/shoes.jpeg';
}

function openLightbox() {
  if (props.shoe) {
    emit('open-lightbox', activeImageUrl.value, props.shoe.title);
  }
}

function handleEdit() {
  if (props.shoe) {
    emit('edit', props.shoe);
  }
}

function close() {
  emit('close');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) close();
}
</script>
