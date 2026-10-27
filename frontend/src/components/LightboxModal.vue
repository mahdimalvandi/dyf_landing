<template>
  <div
    v-if="isOpen"
    id="modalShoeLightbox"
    class="dyf-modal-backdrop dyf-lightbox-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <button
      type="button"
      class="dyf-lightbox-close"
      aria-label="بستن تصویر"
      @click="close"
    >
      &times;
    </button>

    <div class="dyf-lightbox-toolbar" @click.stop>
      <button
        type="button"
        class="dyf-lightbox-tool-btn"
        id="lightboxZoomInBtn"
        title="بزرگنمایی (+)"
        aria-label="بزرگنمایی"
        @click="zoom(0.4)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        type="button"
        class="dyf-lightbox-tool-btn"
        id="lightboxZoomOutBtn"
        title="کوچک‌نمایی (-)"
        aria-label="کوچک‌نمایی"
        @click="zoom(-0.4)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        type="button"
        class="dyf-lightbox-tool-btn"
        id="lightboxZoomResetBtn"
        title="بازنشانی اندازه (100%)"
        aria-label="بازنشانی"
        @click="reset"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>

    <div class="dyf-lightbox-wrap" id="lightboxWrap" @click.stop>
      <div
        class="dyf-lightbox-viewport"
        id="lightboxViewport"
        @wheel.prevent="handleWheel"
      >
        <img
          ref="imgRef"
          :src="src"
          :alt="caption || 'تصویر بزرگنمایی مدل کفش'"
          class="dyf-lightbox-img"
          :class="{ 'is-zoomed': scale > 1, 'is-dragging': isDragging }"
          :style="imgTransformStyle"
          @click="handleImageClick"
          @mousedown="handleMouseDown"
          @touchstart="handleTouchStart"
        />
      </div>
      <div id="lightboxCaption" class="dyf-lightbox-caption">{{ caption }}</div>
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
  src: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

const scale = ref(1);
const panX = ref(0);
const panY = ref(0);
const isDragging = ref(false);
const wasDragged = ref(false);

const imgRef = ref(null);

let dragStartX = 0;
let dragStartY = 0;
let startPanX = 0;
let startPanY = 0;

let touchStartX = 0;
let touchStartY = 0;
let initialPinchDistance = null;
let initialScale = 1;

const imgTransformStyle = computed(() => {
  if (scale.value > 1) {
    return {
      transform: `translate(${panX.value}px, ${panY.value}px) scale(${scale.value})`,
      cursor: isDragging.value ? 'grabbing' : 'grab',
    };
  }
  return {
    cursor: 'zoom-in',
  };
});

function close() {
  reset();
  emit('close');
}

function reset() {
  scale.value = 1;
  panX.value = 0;
  panY.value = 0;
  isDragging.value = false;
  wasDragged.value = false;
}

function zoom(delta) {
  const newScale = Math.min(3.5, Math.max(1, Math.round((scale.value + delta) * 100) / 100));
  scale.value = newScale;
  if (scale.value === 1) {
    panX.value = 0;
    panY.value = 0;
  }
}

function zoomToPoint(clientX, clientY, targetScale = 2.4) {
  if (!imgRef.value) {
    scale.value = targetScale;
    return;
  }

  const rect = imgRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const clickOffsetX = clientX - centerX;
  const clickOffsetY = clientY - centerY;

  const newPanX = -clickOffsetX * (targetScale - 0.7);
  const newPanY = -clickOffsetY * (targetScale - 0.7);

  const maxPanX = Math.max(0, (rect.width * targetScale - rect.width) / 2 + 100);
  const maxPanY = Math.max(0, (rect.height * targetScale - rect.height) / 2 + 100);

  panX.value = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
  panY.value = Math.max(-maxPanY, Math.min(maxPanY, newPanY));
  scale.value = targetScale;
}

function handleImageClick(e) {
  if (wasDragged.value) {
    wasDragged.value = false;
    return;
  }

  if (scale.value > 1.05) {
    reset();
  } else {
    zoomToPoint(e.clientX, e.clientY, 2.4);
  }
}

function handleWheel(e) {
  const delta = e.deltaY < 0 ? 0.35 : -0.35;
  const oldScale = scale.value;
  const newScale = Math.min(3.5, Math.max(1, Math.round((oldScale + delta) * 100) / 100));
  if (newScale === oldScale) return;

  if (newScale === 1) {
    reset();
    return;
  }

  if (imgRef.value) {
    const rect = imgRef.value.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clickX = e.clientX - centerX;
    const clickY = e.clientY - centerY;

    const ratio = newScale / oldScale;
    panX.value = panX.value - clickX * (ratio - 1) * 0.5;
    panY.value = panY.value - clickY * (ratio - 1) * 0.5;

    const maxPanX = Math.max(0, (rect.width * newScale - rect.width) / 2 + 100);
    const maxPanY = Math.max(0, (rect.height * newScale - rect.height) / 2 + 100);
    panX.value = Math.max(-maxPanX, Math.min(maxPanX, panX.value));
    panY.value = Math.max(-maxPanY, Math.min(maxPanY, panY.value));
  }

  scale.value = newScale;
}

function handleMouseDown(e) {
  if (e.button !== 0) return;
  wasDragged.value = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  startPanX = panX.value;
  startPanY = panY.value;

  if (scale.value > 1) {
    isDragging.value = true;
  }

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(e) {
  const deltaX = e.clientX - dragStartX;
  const deltaY = e.clientY - dragStartY;

  if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
    wasDragged.value = true;
  }

  if (isDragging.value && scale.value > 1) {
    panX.value = startPanX + deltaX;
    panY.value = startPanY + deltaY;
  }
}

function handleMouseUp() {
  isDragging.value = false;
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
}

function handleTouchStart(e) {
  wasDragged.value = false;
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    startPanX = panX.value;
    startPanY = panY.value;
    if (scale.value > 1) {
      isDragging.value = true;
    }
  } else if (e.touches.length === 2) {
    isDragging.value = false;
    initialPinchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    initialScale = scale.value;
  }

  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd);
}

function handleTouchMove(e) {
  if (e.touches.length === 1) {
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      wasDragged.value = true;
    }
    if (isDragging.value && scale.value > 1) {
      e.preventDefault();
      panX.value = startPanX + deltaX;
      panY.value = startPanY + deltaY;
    }
  } else if (e.touches.length === 2 && initialPinchDistance) {
    e.preventDefault();
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const ratio = dist / initialPinchDistance;
    scale.value = Math.min(3.5, Math.max(1, Math.round(initialScale * ratio * 100) / 100));
  }
}

function handleTouchEnd(e) {
  if (e.touches.length === 0) {
    isDragging.value = false;
    initialPinchDistance = null;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close();
  }
}

function handleKeyDown(e) {
  if (!props.isOpen) return;
  if (e.key === 'Escape') {
    close();
  } else if (e.key === '+' || e.key === '=') {
    zoom(0.4);
  } else if (e.key === '-' || e.key === '_') {
    zoom(-0.4);
  } else if (e.key === '0') {
    reset();
  }
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      reset();
      document.body.style.overflow = '';
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  handleMouseUp();
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleTouchEnd);
  document.body.style.overflow = '';
});
</script>
