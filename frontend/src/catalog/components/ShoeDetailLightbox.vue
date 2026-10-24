<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { ShoeItemResponse } from '@/shared/api/types';

export interface ShoeDisplayItem {
  id: number;
  title: string;
  category?: string;
  categories?: string[];
  description?: string;
  image?: string;
  coverImage?: string;
  gallery?: string[];
  images?: string[];
  colors?: Array<string | { name: string; hex?: string }>;
  sizes?: Array<number | string>;
  model3d?: string;
}

const props = defineProps<{
  shoe: ShoeDisplayItem | ShoeItemResponse | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Selected media state
const activeImageIndex = ref(0);
const activeViewMode = ref<'photo' | '3d'>('photo');

// Lightbox full-screen zoom state
const isLightboxOpen = ref(false);
const zoomScale = ref(1);
const panX = ref(0);
const panY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const wasDragged = ref(false);

const normalizedShoe = computed(() => {
  if (!props.shoe) return null;
  const s = props.shoe as any;
  const id = s.ID || s.id || 0;
  const title = s.title || '';
  const desc = s.description || 'تولید دست‌دوز با کیفیت صادراتی و متریال درجه یک طبیعی کارگاه DYF.';

  let rawCats: string[] = [];
  if (Array.isArray(s.categories)) {
    rawCats = s.categories.map((c: any) => (typeof c === 'string' ? c : c.title || ''));
  } else if (s.category) {
    rawCats = [s.category];
  } else {
    rawCats = ['لاین چرم لوکس دست‌دوز'];
  }

  const primary = s.coverImage || s.image || (s.images && s.images[0]) || (s.gallery && s.gallery[0]) || '/assets/images/craft-formal.jpeg';
  const gallery: string[] = s.images?.length
    ? s.images
    : s.gallery?.length
    ? s.gallery
    : [primary, '/assets/images/shoes.jpeg'];

  const colors: Array<{ name: string; hex?: string }> = (s.colors || ['مشکی واکس‌خورده', 'قهوه‌ای شکلاتی']).map((c: any) =>
    typeof c === 'string' ? { name: c, hex: '#2b231d' } : c
  );

  const sizes: string[] = (s.sizes || [40, 41, 42, 43, 44]).map((sz: any) => String(sz));

  return {
    id,
    title,
    description: desc,
    categories: rawCats,
    primaryImage: primary,
    gallery,
    colors,
    sizes,
    model3d: s.model3d || '/assets/models/emblem_3d.glb',
  };
});

const currentDisplayImage = computed(() => {
  if (!normalizedShoe.value) return '/assets/images/craft-formal.jpeg';
  const list = normalizedShoe.value.gallery;
  return list[activeImageIndex.value] || normalizedShoe.value.primaryImage;
});

const activeColorIndex = ref(0);

watch(
  () => props.shoe,
  () => {
    activeImageIndex.value = 0;
    activeViewMode.value = 'photo';
    activeColorIndex.value = 0;
    closeLightbox();
  }
);

function handleClose() {
  closeLightbox();
  emit('close');
}

function handleSelectThumbnail(idx: number) {
  activeImageIndex.value = idx;
  activeViewMode.value = 'photo';
}

function handleSelectColor(idx: number) {
  activeColorIndex.value = idx;
}

// Lightbox Controls
function openLightbox() {
  zoomScale.value = 1;
  panX.value = 0;
  panY.value = 0;
  isDragging.value = false;
  isLightboxOpen.value = true;
}

function closeLightbox() {
  isLightboxOpen.value = false;
  zoomScale.value = 1;
  panX.value = 0;
  panY.value = 0;
}

function handleZoom(delta: number) {
  const next = Math.min(3.5, Math.max(1, Math.round((zoomScale.value + delta) * 100) / 100));
  zoomScale.value = next;
  if (next === 1) {
    panX.value = 0;
    panY.value = 0;
  }
}

function handleResetZoom() {
  zoomScale.value = 1;
  panX.value = 0;
  panY.value = 0;
}

function handleImageClick() {
  if (wasDragged.value) {
    wasDragged.value = false;
    return;
  }
  if (zoomScale.value > 1.05) {
    handleResetZoom();
  } else {
    zoomScale.value = 2;
  }
}

function handleWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.35 : -0.35;
  handleZoom(delta);
}

function handleMouseDown(e: MouseEvent) {
  if (zoomScale.value <= 1) return;
  isDragging.value = true;
  wasDragged.value = false;
  dragStartX.value = e.clientX - panX.value;
  dragStartY.value = e.clientY - panY.value;
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const newX = e.clientX - dragStartX.value;
  const newY = e.clientY - dragStartY.value;
  if (Math.abs(newX - panX.value) > 3 || Math.abs(newY - panY.value) > 3) {
    wasDragged.value = true;
  }
  panX.value = newX;
  panY.value = newY;
}

function handleMouseUp() {
  isDragging.value = false;
}

// Touch controls for lightbox
function handleTouchStart(e: TouchEvent) {
  if (zoomScale.value <= 1 || e.touches.length !== 1) return;
  isDragging.value = true;
  wasDragged.value = false;
  dragStartX.value = e.touches[0].clientX - panX.value;
  dragStartY.value = e.touches[0].clientY - panY.value;
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || e.touches.length !== 1) return;
  const newX = e.touches[0].clientX - dragStartX.value;
  const newY = e.touches[0].clientY - dragStartY.value;
  if (Math.abs(newX - panX.value) > 3 || Math.abs(newY - panY.value) > 3) {
    wasDragged.value = true;
  }
  panX.value = newX;
  panY.value = newY;
}

function handleTouchEnd() {
  isDragging.value = false;
}

// WhatsApp CTA Link
const whatsappOrderLink = computed(() => {
  if (!normalizedShoe.value) return '#';
  const text = encodeURIComponent(
    `با سلام و درود، درخواست ثبت سفارش / استعلام تیراژ مدل «${normalizedShoe.value.title}» با کد DYF-${normalizedShoe.value.id} از کاتالوگ اختصاصی را دارم.`
  );
  return `https://wa.me/989121234567?text=${text}`;
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (isLightboxOpen.value) {
      closeLightbox();
    } else if (props.isOpen) {
      handleClose();
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <!-- ======================================================================
       ۴. مودال پرونده تخصصی محصول برای خریدار (#modalShoeDossier)
       مطابق ۱۰۰٪ ساختار legacy کاتالوگ DYF
       ====================================================================== -->
  <div
    id="modalShoeDossier"
    class="dyf-modal-backdrop"
    :class="{ 'is-open': isOpen }"
    :aria-hidden="!isOpen"
    @click.self="handleClose"
  >
    <div
      v-if="normalizedShoe"
      class="dyf-modal-card dyf-cat-dossier-modal"
      style="max-width: 960px; width: 95%; max-height: 92vh; display: flex; flex-direction: column;"
    >
      <div class="dyf-modal-header">
        <h3 id="dossierModalTitle" class="dyf-modal-title">
          شناسنامه مدل کفش (DYF-{{ normalizedShoe.id }})
        </h3>
        <button
          type="button"
          class="dyf-modal-close"
          data-close
          aria-label="بستن پنجره"
          @click="handleClose"
        >
          &times;
        </button>
      </div>

      <div class="dyf-modal-body" style="flex: 1; overflow-y: auto; padding: 0;">
        <div class="dyf-cat-dossier-layout">
          <!-- تصویر اصلی و گالری / مشاهده‌گر ۳بعدی -->
          <div>
            <!-- تب انتخاب نما: عکس یا ۳بعدی -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.65rem;">
              <button
                type="button"
                class="dyf-btn dyf-btn-sm"
                :class="activeViewMode === 'photo' ? 'dyf-btn-primary' : 'dyf-btn-outline'"
                style="flex: 1; justify-content: center; font-size: 0.78rem;"
                @click="activeViewMode = 'photo'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <span>گالری تصاویر</span>
              </button>
              <button
                type="button"
                class="dyf-btn dyf-btn-sm"
                :class="activeViewMode === '3d' ? 'dyf-btn-primary' : 'dyf-btn-outline'"
                style="flex: 1; justify-content: center; font-size: 0.78rem;"
                @click="activeViewMode = '3d'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                <span>مشاهده‌گر ۳۶۰° سه‌بعدی</span>
              </button>
            </div>

            <!-- حالت نمایش عکس اصلی -->
            <div
              v-show="activeViewMode === 'photo'"
              id="dossierMainImageWrap"
              style="position: relative; border-radius: var(--r-md); overflow: hidden; border: 1px solid var(--border-medium); background: #0f0d0b; margin-bottom: 0.75rem; aspect-ratio: 4/3; cursor: zoom-in;"
              title="برای بزرگنمایی و مشاهده تمام‌صفحه کلیک کنید"
              @click="openLightbox"
            >
              <img
                id="dossierMainImage"
                :src="currentDisplayImage"
                :alt="normalizedShoe.title"
                style="width: 100%; height: 100%; object-fit: cover;"
              >
              <div
                style="position: absolute; bottom: 10px; left: 10px; background: rgba(14, 12, 10, 0.8); backdrop-filter: blur(4px); padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.74rem; color: var(--gold-light); display: flex; align-items: center; gap: 0.35rem; border: 1px solid var(--border-subtle); pointer-events: none;"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M11 8v6" />
                  <path d="M8 11h6" />
                </svg>
                <span>مشاهده تمام‌صفحه</span>
              </div>
            </div>

            <!-- حالت نمایش مدل ۳بعدی -->
            <div
              v-show="activeViewMode === '3d'"
              style="position: relative; border-radius: var(--r-md); overflow: hidden; border: 1px solid var(--gold-primary); background: #0f0d0b; margin-bottom: 0.75rem; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center;"
            >
              <model-viewer
                :src="normalizedShoe.model3d"
                poster="/assets/images/logo.png"
                :alt="`مدل سه‌بعدی ${normalizedShoe.title}`"
                camera-controls
                auto-rotate
                auto-rotate-delay="300"
                rotation-per-second="25deg"
                interaction-prompt="auto"
                shadow-intensity="1.2"
                shadow-softness="0.9"
                exposure="1.15"
                environment-image="neutral"
                style="width: 100%; height: 100%; background: #0f0d0b;"
              >
              </model-viewer>
              <div
                style="position: absolute; top: 10px; right: 10px; background: rgba(14, 12, 10, 0.75); backdrop-filter: blur(4px); padding: 0.25rem 0.55rem; border-radius: var(--r-sm); font-size: 0.72rem; color: var(--gold-light); border: 1px solid var(--border-subtle); pointer-events: none;"
              >
                🔄 قابلیت چرخش ۳۶۰ درجه با لمس و ماوس
              </div>
            </div>

            <!-- ریزتصاویر گالری -->
            <div
              id="dossierThumbnailsWrap"
              style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem;"
            >
              <div
                v-for="(imgSrc, idx) in normalizedShoe.gallery"
                :key="idx"
                class="dyf-thumb-item"
                :class="{ 'is-active': activeImageIndex === idx && activeViewMode === 'photo' }"
                :style="{
                  width: '58px',
                  height: '58px',
                  borderRadius: 'var(--r-sm)',
                  overflow: 'hidden',
                  border: activeImageIndex === idx && activeViewMode === 'photo' ? '2px solid var(--gold-primary)' : '2px solid var(--border-subtle)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }"
                :data-src="imgSrc"
                @click="handleSelectThumbnail(idx)"
              >
                <img :src="imgSrc" alt="ریزتصویر" style="width: 100%; height: 100%; object-fit: cover;">
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
                {{ normalizedShoe.title }}
              </h2>
              <div id="dossierCategoryPill" style="margin-top: 0.35rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
                <span
                  v-for="cat in normalizedShoe.categories"
                  :key="cat"
                  class="dyf-badge dyf-badge-active"
                >
                  {{ cat }}
                </span>
              </div>
            </div>

            <div>
              <span style="color: var(--text-dim); font-size: 0.78rem;">توضیحات و مشخصات:</span>
              <p
                id="dossierShoeDesc"
                style="font-size: 0.88rem; color: var(--text-main); line-height: 1.7; margin-top: 0.35rem; margin-bottom: 0;"
              >
                {{ normalizedShoe.description }}
              </p>
            </div>

            <!-- جدول جزئیات کارگاهی -->
            <div
              style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.84rem;"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-dim);">رنگ‌های موجود:</span>
                <span id="dossierColors" style="font-weight: 700; color: var(--gold-light);">
                  {{ normalizedShoe.colors.map(c => c.name).join('، ') }}
                </span>
              </div>

              <!-- انتخاب‌گر زنده رنگ‌ها -->
              <div style="display: flex; gap: 0.45rem; margin-top: 0.2rem; flex-wrap: wrap;">
                <button
                  v-for="(col, cIdx) in normalizedShoe.colors"
                  :key="cIdx"
                  type="button"
                  style="border: 1px solid; border-radius: var(--r-sm); padding: 0.25rem 0.65rem; font-size: 0.74rem; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.35rem;"
                  :style="{
                    borderColor: activeColorIndex === cIdx ? 'var(--gold-primary)' : 'var(--border-subtle)',
                    background: activeColorIndex === cIdx ? 'rgba(61, 36, 21, 0.7)' : 'rgba(20, 18, 16, 0.4)',
                    color: activeColorIndex === cIdx ? 'var(--gold-light)' : 'var(--text-muted)',
                  }"
                  @click="handleSelectColor(cIdx)"
                >
                  <span
                    style="width: 10px; height: 10px; border-radius: 50%; display: inline-block; border: 1px solid rgba(255,255,255,0.2);"
                    :style="{ background: col.hex || 'var(--gold-primary)' }"
                  ></span>
                  <span>{{ col.name }}</span>
                </button>
              </div>

              <div
                style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;"
              >
                <span style="color: var(--text-dim);">سایزبندی کارگاه:</span>
                <span
                  id="dossierSizes"
                  style="font-family: var(--font-title); direction: ltr; font-weight: 700; color: var(--text-ivory);"
                >
                  {{ normalizedShoe.sizes.join('، ') }}
                </span>
              </div>
            </div>

            <!-- دکمه اقدام اختصاصی (CTA) برای استعلام تیراژ و ارتباط واتس‌اپ همکاران -->
            <div style="margin-top: auto; padding-top: 1rem;">
              <a
                :href="whatsappOrderLink"
                target="_blank"
                rel="noopener noreferrer"
                class="dyf-btn dyf-btn-primary dyf-btn-lg"
                style="width: 100%; justify-content: center; gap: 0.6rem; text-decoration: none;"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>استعلام تیراژ و سفارش اختصاصی در واتس‌اپ</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ======================================================================
       مودال لایت‌باکس بزرگنمایی تصویر کفش در کاتالوگ (#modalShoeLightbox)
       مطابق ۱۰۰٪ ساختار legacy کاتالوگ DYF
       ====================================================================== -->
  <div
    id="modalShoeLightbox"
    class="dyf-modal-backdrop dyf-lightbox-backdrop"
    :class="{ 'is-open': isLightboxOpen }"
    :aria-hidden="!isLightboxOpen"
    @click.self="closeLightbox"
  >
    <button
      type="button"
      class="dyf-lightbox-close"
      data-close
      aria-label="بستن تصویر"
      @click="closeLightbox"
    >
      &times;
    </button>

    <div class="dyf-lightbox-toolbar">
      <button
        id="lightboxZoomInBtn"
        type="button"
        class="dyf-lightbox-tool-btn"
        title="بزرگنمایی (+)"
        aria-label="بزرگنمایی"
        @click.stop="handleZoom(0.4)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        id="lightboxZoomOutBtn"
        type="button"
        class="dyf-lightbox-tool-btn"
        title="کوچک‌نمایی (-)"
        aria-label="کوچک‌نمایی"
        @click.stop="handleZoom(-0.4)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        id="lightboxZoomResetBtn"
        type="button"
        class="dyf-lightbox-tool-btn"
        title="بازنشانی اندازه (100%)"
        aria-label="بازنشانی"
        @click.stop="handleResetZoom"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>

    <div id="lightboxWrap" class="dyf-lightbox-wrap">
      <div id="lightboxViewport" class="dyf-lightbox-viewport">
        <img
          id="lightboxImg"
          :src="currentDisplayImage"
          alt="تصویر بزرگنمایی مدل کفش"
          class="dyf-lightbox-img"
          :class="{ 'is-zoomed': zoomScale > 1, 'is-dragging': isDragging }"
          :style="{
            transform: zoomScale > 1 ? `translate(${panX}px, ${panY}px) scale(${zoomScale})` : '',
            cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }"
          @click="handleImageClick"
          @wheel="handleWheel"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
      </div>
      <div id="lightboxCaption" class="dyf-lightbox-caption">
        {{ normalizedShoe ? `${normalizedShoe.title} (DYF-${normalizedShoe.id})` : '' }}
      </div>
    </div>
  </div>
</template>
