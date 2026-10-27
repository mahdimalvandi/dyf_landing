<template>
  <div
    v-if="isOpen"
    id="modalProductPicker"
    class="dyf-modal-backdrop dyf-modal-elevated is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div class="dyf-modal-card dyf-product-picker-split-card" @click.stop>
      <!-- ۱. هدر ثابت بالای مودال -->
      <div class="dyf-picker-split-header">
        <div class="dyf-picker-split-header-info">
          <div class="dyf-picker-split-title-row">
            <h3 class="dyf-picker-split-title">انتخاب مدل‌های مجاز</h3>
            <span id="pickerTotalEligibleBadge" class="dyf-badge dyf-badge-active">
              {{ selectedShoeIds.length }} مدل انتخاب‌شده
            </span>
          </div>
          <p class="dyf-picker-split-subtitle">جست‌وجوی عنوان یا شناسه مدل و انتخاب بر اساس دسته‌بندی</p>
        </div>

        <div class="dyf-picker-split-header-search">
          <div class="dyf-toolbar-search dyf-picker-search">
            <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              id="pickerSearchInput"
              v-model="searchQuery"
              class="dyf-quick-search-input"
              placeholder="جست‌وجوی مدل..."
            >
            <button
              v-if="searchQuery"
              type="button"
              id="pickerSearchClearBtn"
              class="dyf-picker-search-clear"
              title="پاک کردن جست‌وجو"
              @click="searchQuery = ''"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">&times;</button>
        </div>
      </div>

      <!-- ۲. بدنه دو ستونه (Split View) -->
      <div class="dyf-picker-split-body">
        <!-- ستون راست: فهرست دسته‌بندی‌ها -->
        <aside class="dyf-picker-cats-sidebar">
          <div class="dyf-picker-sidebar-header">
            <span class="dyf-picker-sidebar-title">دسته‌بندی‌ها</span>
            <div class="dyf-picker-sidebar-actions">
              <button type="button" id="pickerSelectAllCatsBtn" class="dyf-picker-action-link" @click="selectAll">انتخاب همه</button>
              <span class="dyf-dot-sep">•</span>
              <button type="button" id="pickerDeselectAllCatsBtn" class="dyf-picker-action-link" @click="deselectAll">لغو همه</button>
            </div>
          </div>
          <div class="dyf-picker-cats-list" id="pickerCatsList">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="dyf-picker-cat-item"
              :class="{ 'is-active': activeCategory === cat.name && !searchQuery }"
              :data-cat-key="cat.name"
              @click="activeCategory = cat.name; searchQuery = ''"
            >
              <div class="dyf-picker-cat-item-main">
                <input
                  type="checkbox"
                  class="dyf-picker-cat-cb js-cat-cb"
                  :checked="isCategoryFullySelected(cat.name)"
                  :indeterminate="isCategoryPartiallySelected(cat.name)"
                  @click.stop="toggleCategorySelection(cat.name)"
                >
                <span class="dyf-picker-cat-label" :title="cat.name">{{ cat.name }}</span>
              </div>
              <span class="dyf-picker-cat-badge">
                {{ getSelectedCountForCategory(cat.name) }} / {{ getShoesForCategory(cat.name).length }}
              </span>
            </div>
          </div>
        </aside>

        <!-- ستون چپ: فهرست مدل‌های دسته انتخاب‌شده -->
        <main class="dyf-picker-models-panel">
          <div class="dyf-picker-models-header">
            <div class="dyf-picker-models-header-title">
              <span id="pickerActiveCategoryTitle">
                {{ searchQuery ? `نتایج جست‌وجو برای «${searchQuery}»` : `مدل‌های دسته‌بندی ${activeCategory}` }}
              </span>
            </div>
            <div class="dyf-picker-models-header-actions">
              <span id="pickerActiveCategoryCount" style="font-size: 0.78rem; color: var(--text-muted);">
                {{ displayedShoes.length }} مدل
              </span>
            </div>
          </div>

          <!-- لیست اسکرول‌شونده اختصاصی و مستقل مدل‌ها -->
          <div class="dyf-picker-models-scroll" id="pickerModelsScroll">
            <div v-if="displayedShoes.length > 0" class="dyf-picker-models-grid">
              <div
                v-for="shoe in displayedShoes"
                :key="shoe.id"
                class="dyf-picker-shoe-card"
                :class="{ 'is-selected': selectedShoeIds.includes(shoe.id) }"
                :data-shoe-id="shoe.id"
                @click="toggleShoe(shoe.id)"
              >
                <input
                  type="checkbox"
                  class="dyf-picker-shoe-cb js-shoe-cb"
                  :value="shoe.id"
                  :checked="selectedShoeIds.includes(shoe.id)"
                  @click.stop="toggleShoe(shoe.id)"
                >
                <img :src="getThumb(shoe)" :alt="shoe.title" class="dyf-picker-shoe-thumb" loading="lazy" @error="$event.target.src = '/assets/images/shoes.jpeg'">
                <div class="dyf-picker-shoe-info">
                  <span class="dyf-picker-shoe-title" :title="shoe.title">{{ shoe.title }}</span>
                  <div class="dyf-picker-shoe-meta">
                    <span class="dyf-picker-shoe-code">DYF-{{ shoe.id }}</span>
                    <span v-if="searchQuery && (shoe.categories || [])[0]" class="dyf-picker-shoe-cat-tag">({{ shoe.categories[0] }})</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else style="text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.85rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <h4 style="font-family: var(--font-title); font-size: 1.05rem; color: var(--text-ivory); margin-bottom: 0.35rem;">هیچ مدلی یافت نشد</h4>
              <p style="font-size: 0.82rem;">{{ searchQuery ? 'با این عبارت مدلی پیدا نشد.' : 'در این دسته‌بندی مدلی ثبت نشده است.' }}</p>
            </div>
          </div>
        </main>
      </div>

      <!-- ۳. پاورقی ثابت پایین مودال -->
      <div class="dyf-picker-split-footer">
        <div class="dyf-picker-footer-summary" id="pickerRulesSummary">
          مجموعاً <strong style="color: var(--gold-light);">{{ selectedShoeIds.length }}</strong> مدل از {{ publishedShoes.length }} مدل کاتالوگ مجاز شناخته شده‌اند.
        </div>
        <div class="dyf-picker-footer-actions">
          <button type="button" class="dyf-btn dyf-btn-outline" @click="close">انصراف</button>
          <button type="button" id="pickerConfirmBtn" class="dyf-btn dyf-btn-primary" @click="handleConfirm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>تأیید انتخاب‌ها</span>
          </button>
        </div>
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
  initialShoeIds: {
    type: Array,
    default: () => [],
  },
  shoes: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'confirm']);

const selectedShoeIds = ref([]);
const activeCategory = ref('');
const searchQuery = ref('');

const publishedShoes = computed(() => {
  return props.shoes.filter((s) => s.status === 'published' || !s.status);
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedShoeIds.value = [...(props.initialShoeIds || [])];
      searchQuery.value = '';
      if (props.categories.length > 0) {
        activeCategory.value = props.categories[0].name;
      }
    }
  }
);

function getThumb(shoe) {
  const url = shoe.media?.find((m) => m.isPrimary)?.url || shoe.media?.[0]?.url || shoe.image;
  return normalizeImageUrl(url);
}

function getShoesForCategory(catName) {
  const cleanCat = catName.replace(/^لاین\s+/, '').trim();
  return publishedShoes.value.filter((s) => {
    if (s.categories && s.categories.length) {
      return s.categories.some((c) => c.replace(/^لاین\s+/, '').trim() === cleanCat);
    }
    return (s.category || '').replace(/^لاین\s+/, '').trim() === cleanCat;
  });
}

function getSelectedCountForCategory(catName) {
  const catShoes = getShoesForCategory(catName);
  return catShoes.filter((s) => selectedShoeIds.value.includes(s.id)).length;
}

const displayedShoes = computed(() => {
  let list = publishedShoes.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    return list.filter((s) =>
      (s.title || '').toLowerCase().includes(q) ||
      String(s.id).includes(q) ||
      (s.categories || []).some((c) => c.toLowerCase().includes(q))
    );
  }

  if (activeCategory.value) {
    return getShoesForCategory(activeCategory.value);
  }
  return list;
});

function isCategoryFullySelected(catName) {
  const catShoes = getShoesForCategory(catName);
  if (catShoes.length === 0) return false;
  return catShoes.every((s) => selectedShoeIds.value.includes(s.id));
}

function isCategoryPartiallySelected(catName) {
  const catShoes = getShoesForCategory(catName);
  if (catShoes.length === 0) return false;
  const count = catShoes.filter((s) => selectedShoeIds.value.includes(s.id)).length;
  return count > 0 && count < catShoes.length;
}

function toggleCategorySelection(catName) {
  const catShoes = getShoesForCategory(catName);
  const isFully = isCategoryFullySelected(catName);
  if (isFully) {
    const toRemove = new Set(catShoes.map((s) => s.id));
    selectedShoeIds.value = selectedShoeIds.value.filter((id) => !toRemove.has(id));
  } else {
    const set = new Set(selectedShoeIds.value);
    catShoes.forEach((s) => set.add(s.id));
    selectedShoeIds.value = Array.from(set);
  }
}

function selectAll() {
  selectedShoeIds.value = publishedShoes.value.map((s) => s.id);
}

function deselectAll() {
  selectedShoeIds.value = [];
}

function toggleShoe(id) {
  const index = selectedShoeIds.value.indexOf(id);
  if (index > -1) {
    selectedShoeIds.value.splice(index, 1);
  } else {
    selectedShoeIds.value.push(id);
  }
}

function handleConfirm() {
  emit('confirm', [...selectedShoeIds.value]);
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
