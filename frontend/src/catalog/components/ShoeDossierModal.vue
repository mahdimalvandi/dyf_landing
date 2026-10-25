<template>
  <div
    v-if="isOpen && shoe"
    id="modalShoeDossier"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card dyf-cat-dossier-modal"
      style="max-width: 960px; width: 95%; max-height: 92vh; display: flex; flex-direction: column;"
      @click.stop
    >
      <div class="dyf-modal-header">
        <h3 class="dyf-modal-title" id="dossierModalTitle">
          شناسنامه مدل کفش (DYF-{{ shoe.id }})
        </h3>
        <button
          type="button"
          class="dyf-modal-close"
          aria-label="بستن"
          @click="close"
        >
          &times;
        </button>
      </div>

      <div class="dyf-modal-body" style="flex: 1; overflow-y: auto; padding: 0;">
        <div class="dyf-cat-dossier-layout">
          <!-- تصویر اصلی و گالری -->
          <div>
            <div
              id="dossierMainImageWrap"
              style="position: relative; border-radius: var(--r-md); overflow: hidden; border: 1px solid var(--border-medium); background: #0f0d0b; margin-bottom: 0.75rem; aspect-ratio: 4/3; cursor: zoom-in;"
              title="برای بزرگنمایی و مشاهده تمام‌صفحه کلیک کنید"
              @click="handleOpenLightbox"
            >
              <img
                id="dossierMainImage"
                :src="selectedImage"
                :alt="shoe.title"
                style="width: 100%; height: 100%; object-fit: cover;"
              />
              <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(14, 12, 10, 0.8); backdrop-filter: blur(4px); padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.74rem; color: var(--gold-light); display: flex; align-items: center; gap: 0.35rem; border: 1px solid var(--border-subtle); pointer-events: none;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M11 8v6" />
                  <path d="M8 11h6" />
                </svg>
                <span>مشاهده تمام‌صفحه</span>
              </div>
            </div>

            <div
              id="dossierThumbnailsWrap"
              style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem;"
            >
              <div
                v-for="(src, index) in gallery"
                :key="index"
                class="dyf-thumb-item"
                :class="{ 'is-active': selectedImage === src }"
                :style="{
                  width: '58px',
                  height: '58px',
                  borderRadius: 'var(--r-sm)',
                  overflow: 'hidden',
                  border: selectedImage === src ? '2px solid var(--gold-primary)' : '2px solid var(--border-subtle)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }"
                @click="selectedImage = src"
              >
                <img :src="src" alt="ریزتصویر" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            </div>
          </div>

          <!-- مشخصات فنی و شناسنامه کارگاهی -->
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <h2
                id="dossierShoeTitle"
                style="font-family: var(--font-title); font-size: 1.3rem; font-weight: 800; color: var(--text-ivory); margin-bottom: 0.35rem;"
              >
                {{ shoe.title }}
              </h2>
              <div id="dossierCategoryPill" style="margin-top: 0.35rem;">
                <span class="dyf-badge dyf-badge-active">{{ categoryText }}</span>
              </div>
            </div>

            <div>
              <span style="color: var(--text-dim); font-size: 0.78rem;">توضیحات و مشخصات:</span>
              <p
                id="dossierShoeDesc"
                style="font-size: 0.88rem; color: var(--text-main); line-height: 1.7; margin-top: 0.35rem; margin-bottom: 0;"
              >
                {{ shoe.description || 'تولید دست‌دوز با کیفیت صادراتی و متریال درجه یک طبیعی.' }}
              </p>
            </div>

            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.84rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-dim);">رنگ‌های موجود:</span>
                <span id="dossierColors" style="font-weight: 700; color: var(--gold-light);">{{ formattedColors }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
                <span style="color: var(--text-dim);">سایزبندی:</span>
                <span id="dossierSizes" style="font-family: var(--font-title); direction: ltr; font-weight: 700; color: var(--text-ivory);">{{ formattedSizes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

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

const emit = defineEmits(['close', 'open-lightbox']);

const selectedImage = ref('');

const gallery = computed(() => {
  if (!props.shoe) return [];
  const primary = props.shoe.image || (props.shoe.gallery && props.shoe.gallery[0]) || '/assets/images/craft-formal.jpeg';
  if (props.shoe.gallery && props.shoe.gallery.length) {
    return props.shoe.gallery;
  }
  return [primary, '/assets/images/shoes.jpeg'];
});

const categoryText = computed(() => {
  if (!props.shoe) return '';
  return props.shoe.category || (props.shoe.categories && props.shoe.categories[0]) || 'چرم طبیعی کارگاه';
});

const formattedColors = computed(() => {
  if (!props.shoe) return '';
  const colors = props.shoe.colors || [{ name: 'مشکی' }, { name: 'قهوه‌ای' }];
  return colors.map((c) => (typeof c === 'string' ? c : c.name)).join('، ');
});

const formattedSizes = computed(() => {
  if (!props.shoe) return '';
  const sizes = props.shoe.sizes || ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'];
  return sizes.join('، ');
});

watch(
  () => props.shoe,
  (newShoe) => {
    if (newShoe) {
      selectedImage.value =
        newShoe.image || (newShoe.gallery && newShoe.gallery[0]) || '/assets/images/craft-formal.jpeg';
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

function close() {
  emit('close');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close();
  }
}

function handleOpenLightbox() {
  if (!props.shoe) return;
  emit('open-lightbox', {
    url: selectedImage.value,
    caption: `${props.shoe.title} (DYF-${props.shoe.id})`,
  });
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>
