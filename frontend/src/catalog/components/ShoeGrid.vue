<template>
  <main style="flex: 1;">
    <div
      v-if="shoes.length > 0"
      id="catShoesGrid"
      class="dyf-cat-grid"
      style="display: grid;"
    >
      <ShoeCard
        v-for="shoe in shoes"
        :key="shoe.id"
        :shoe="shoe"
        @view-dossier="$emit('view-dossier', $event)"
      />
    </div>

    <div
      v-else
      id="catEmptyState"
      class="dyf-panel-card dyf-empty-state"
      style="display: block; max-width: 600px; margin: 3rem auto;"
    >
      <svg class="dyf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="m9 9 4 4" />
        <path d="m13 9-4 4" />
      </svg>
      <h3 class="dyf-empty-title">مدلی با این مشخصات یافت نشد</h3>
      <p class="dyf-empty-desc">لطفاً عبارت جست‌وجو را تغییر داده یا از تب دسته‌بندی دیگری استفاده فرمایید.</p>
      <button
        type="button"
        id="catResetFilterBtn"
        class="dyf-btn dyf-btn-outline"
        @click="$emit('reset-filters')"
      >
        نمایش همه مدل‌های مجاز
      </button>
    </div>
  </main>
</template>

<script setup>
import ShoeCard from './ShoeCard.vue';

defineProps({
  shoes: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['view-dossier', 'reset-filters']);
</script>
