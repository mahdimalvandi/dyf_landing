<template>
  <article
    class="dyf-cat-card"
    :data-shoe-id="shoe.id"
    title="مشاهده جزئیات مدل"
    @click="$emit('view-dossier', shoe.id)"
  >
    <div class="dyf-cat-media">
      <img :src="primaryImage" :alt="shoe.title" loading="lazy" />
      <div class="dyf-cat-code-badge">DYF-{{ shoe.id }}</div>
    </div>

    <div class="dyf-cat-body">
      <h3 class="dyf-cat-title">{{ shoe.title }}</h3>
      <div class="dyf-cat-categories">
        <span
          v-for="cat in categories"
          :key="cat"
          class="dyf-category-pill"
          style="font-size: 0.72rem; padding: 0.15rem 0.55rem; background: rgba(61, 36, 21, 0.45); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); color: var(--gold-light);"
        >
          {{ cat }}
        </span>
      </div>

      <div class="dyf-cat-specs-row">
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <span>تعداد رنگ:</span>
          <span style="color: var(--text-main); font-weight: 700;">{{ colorCount }}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <span>تعداد سایز:</span>
          <span style="color: var(--gold-light); font-weight: 700;">{{ sizeCount }}</span>
        </div>
      </div>

      <div class="dyf-cat-footer-actions">
        <button
          type="button"
          class="dyf-btn dyf-btn-primary dyf-btn-sm js-view-dossier"
          :data-shoe-id="shoe.id"
          style="width: 100%; justify-content: center;"
          @click.stop="$emit('view-dossier', shoe.id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>مشاهده جزئیات</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  shoe: {
    type: Object,
    required: true,
  },
});

defineEmits(['view-dossier']);

const primaryImage = computed(() => {
  return props.shoe.image || (props.shoe.gallery && props.shoe.gallery[0]) || '/assets/images/craft-formal.jpeg';
});

const categories = computed(() => {
  return props.shoe.categories || (props.shoe.category ? [props.shoe.category] : ['کفش چرم دست‌دوز']);
});

const colorCount = computed(() => {
  return (props.shoe.colors || []).length;
});

const sizeCount = computed(() => {
  return (props.shoe.sizes || []).length;
});
</script>
