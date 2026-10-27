<template>
  <div
    v-if="isOpen"
    id="modalPermittedShoesViewer"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card dyf-permitted-viewer-card"
      style="max-width: 920px; max-height: 88vh; display: flex; flex-direction: column;"
      @click.stop
    >
      <div
        class="dyf-modal-header"
        style="flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; gap: 1rem;"
      >
        <div>
          <h3 class="dyf-modal-title" id="permittedViewerTitle">مدل‌های مجاز جهت مشاهده</h3>
          <p style="font-size: 0.78rem; color: var(--gold-light); margin-top: 0.2rem;" id="permittedViewerSubtitle">
            {{ targetTitle }} • {{ filteredShoes.length }} مدل کفش مجاز و فعال
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <input
            v-model="searchQuery"
            type="text"
            id="permittedViewerSearch"
            class="dyf-input"
            placeholder="جست‌وجوی مدل..."
            style="font-size: 0.8rem; padding: 0.35rem 0.75rem; width: 180px;"
          >
          <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">&times;</button>
        </div>
      </div>

      <div
        class="dyf-modal-body"
        id="permittedViewerBody"
        style="padding: 1.25rem; overflow-y: auto; flex: 1;"
      >
        <div v-if="filteredShoes.length > 0" class="dyf-permitted-grid">
          <div
            v-for="shoe in filteredShoes"
            :key="shoe.id"
            class="dyf-permitted-card"
            :data-shoe-id="shoe.id"
            style="cursor: pointer;"
            title="مشاهده شناسنامه و جزئیات مدل"
            @click="$emit('open-dossier', shoe.id)"
          >
            <div
              class="dyf-permitted-thumb-wrap js-permitted-zoom"
              :title="'کلیک برای بزرگنمایی تصویر: ' + shoe.title"
              @click.stop="$emit('open-lightbox', getThumb(shoe), shoe.title)"
            >
              <img
                :src="getThumb(shoe)"
                :alt="shoe.title"
                class="dyf-permitted-thumb"
                loading="lazy"
                @error="$event.target.src = '/assets/images/shoes.jpeg'"
              >
            </div>
            <div class="dyf-permitted-info">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                <span class="dyf-badge dyf-badge-active" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">
                  DYF-{{ shoe.id }}
                </span>
                <span v-if="shoe.wholesalePrice" style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700;">
                  {{ Number(shoe.wholesalePrice).toLocaleString('fa-IR') }} تومان
                </span>
              </div>
              <h4 class="dyf-permitted-title" :title="shoe.title">{{ shoe.title }}</h4>
              <div class="dyf-permitted-meta">
                <span>دسته‌بندی:</span>
                <span style="color: var(--text-light); font-weight: 600;">
                  {{ (shoe.categories || []).join('، ') || shoe.category || 'بدون دسته‌بندی' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else style="text-align: center; padding: 3.5rem 1.5rem; color: var(--text-muted);">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.85rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h4 style="font-family: var(--font-title); font-size: 1.05rem; color: var(--text-ivory); margin-bottom: 0.35rem;">هیچ مدلی یافت نشد</h4>
          <p style="font-size: 0.82rem;">با این مشخصات مدلی در لیست محصولات مجاز وجود ندارد.</p>
        </div>
      </div>

      <div
        class="dyf-modal-footer"
        style="flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;"
      >
        <button
          type="button"
          id="permittedViewerBackToDetailsBtn"
          class="dyf-btn dyf-btn-outline"
          @click="$emit('back-to-details')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          <span>بازگشت به مشخصات لینک</span>
        </button>

        <button
          type="button"
          id="permittedViewerEditBtn"
          class="dyf-btn dyf-btn-primary"
          @click="$emit('edit-permitted')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          <span>ویرایش مدل‌های مجاز</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { normalizeImageUrl } from '../../shared/utils/format.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  targetTitle: {
    type: String,
    default: '',
  },
  permittedShoeIds: {
    type: Array,
    default: () => [],
  },
  allShoes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'edit-permitted', 'open-lightbox', 'open-dossier', 'back-to-details']);

const searchQuery = ref('');

function getThumb(shoe) {
  const url = shoe.media?.find((m) => m.isPrimary)?.url || shoe.media?.[0]?.url || shoe.image;
  return normalizeImageUrl(url);
}

const filteredShoes = computed(() => {
  let list = props.allShoes;
  if (props.permittedShoeIds && props.permittedShoeIds.length > 0) {
    const idSet = new Set(props.permittedShoeIds);
    list = list.filter((s) => idSet.has(s.id));
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    return list.filter((s) =>
      (s.title || '').toLowerCase().includes(q) ||
      String(s.id).includes(q) ||
      (s.categories || []).some((c) => c.toLowerCase().includes(q))
    );
  }
  return list;
});

function close() {
  emit('close');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) close();
}
</script>
