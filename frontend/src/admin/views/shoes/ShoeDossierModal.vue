<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ShoeDetailResponse } from '@/shared/api/types';

const props = defineProps<{
  show: boolean;
  shoe: ShoeDetailResponse | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', shoe: ShoeDetailResponse): void;
}>();

const activeImage = ref<string>('');

const currentImage = computed(() => {
  if (activeImage.value) return activeImage.value;
  return props.shoe?.coverImage || '/assets/images/craft-formal.jpeg';
});
</script>

<template>
  <div v-if="show && shoe" class="dyf-modal-backdrop is-open" @click.self="emit('close')">
    <div class="dyf-modal-card" style="max-width: 960px; width: 95%; max-height: 90vh; overflow-y: auto;">
      <!-- هدر شناسنامه -->
      <div class="dyf-modal-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <span class="dyf-code-tag" style="font-size: 0.95rem; padding: 0.25rem 0.65rem;">
            #{{ shoe.modelID || shoe.ID }}
          </span>
          <h3 class="dyf-modal-title" style="margin: 0;">{{ shoe.title }}</h3>
        </div>
        <button type="button" class="dyf-modal-close" @click="emit('close')">&times;</button>
      </div>

      <!-- محتوای دو ستونه شناسنامه فنی -->
      <div style="padding: 1.5rem; display: grid; grid-template-columns: 1fr 1.1fr; gap: 2rem;">
        <!-- ستون راست: تصاویر و گالری -->
        <div>
          <div
            style="border-radius: var(--r-md); overflow: hidden; border: 1px solid var(--border-subtle); background: #000; position: relative;"
          >
            <img
              :src="currentImage"
              :alt="shoe.title"
              style="width: 100%; height: 320px; object-fit: cover; display: block;"
            />
            <span
              v-if="shoe.model3dURL"
              class="dyf-badge dyf-badge-info"
              style="position: absolute; top: 12px; right: 12px;"
            >
              مدل سه‌بعدی 3D
            </span>
          </div>

          <!-- ریزعکس‌های گالری -->
          <div
            v-if="shoe.media && shoe.media.length > 1"
            style="display: flex; gap: 0.5rem; margin-top: 0.85rem; overflow-x: auto; padding-bottom: 4px;"
          >
            <img
              v-for="m in shoe.media"
              :key="m.ID || m.mediaURL"
              :src="m.mediaURL"
              alt="عکس مدل"
              style="width: 64px; height: 64px; object-fit: cover; border-radius: var(--r-sm); cursor: pointer; border: 2px solid;"
              :style="currentImage === m.mediaURL ? 'border-color: var(--gold-primary);' : 'border-color: transparent;'"
              @click="activeImage = m.mediaURL"
            />
          </div>
        </div>

        <!-- ستون چپ: مشخصات فنی و متریال -->
        <div>
          <!-- دسته‌بندی‌ها -->
          <div style="display: flex; flex-wrap: wrap; gap: 0.45rem; margin-bottom: 1.25rem;">
            <span v-for="c in shoe.categories" :key="c.ID" class="dyf-badge dyf-badge-cat">
              {{ c.title }}
            </span>
            <span class="dyf-badge dyf-badge-active">آماده تولید و عرضه عمده</span>
          </div>

          <!-- توضیحات متریال -->
          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.88rem; color: var(--gold-light); margin-bottom: 0.4rem;">
              مشخصات متریال و ساختار چرم
            </h4>
            <p style="font-size: 0.88rem; color: var(--text-ivory); line-height: 1.7;">
              {{ shoe.description || 'رویه چرم طبیعی گاوی درجه یک با پرداخت دست‌ساز، آستر تنفس‌پذیر تمام‌چرم و زیره مقاوم با طراحی ارگونومیک اختصاصی کارگاه تبریز.' }}
            </p>
          </div>

          <!-- رنگ‌ها -->
          <div style="margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.88rem; color: var(--gold-light); margin-bottom: 0.4rem;">
              رنگ‌های قابل سفارش
            </h4>
            <div style="font-size: 0.88rem; color: var(--text-ivory);">
              {{ shoe.colors && shoe.colors.length ? shoe.colors.join('، ') : 'مشکی، عسلی، قهوه‌ای' }}
            </div>
          </div>

          <!-- سایزبندی -->
          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.88rem; color: var(--gold-light); margin-bottom: 0.4rem;">
              قالب و سایزبندی
            </h4>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <span
                v-for="sz in (shoe.sizes || ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'])"
                :key="sz"
                class="dyf-size-box"
                style="background: rgba(36, 30, 25, 0.7); color: var(--gold-primary); border-color: var(--border-subtle);"
              >
                {{ sz }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- فوتر -->
      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" @click="emit('close')">بستن</button>
        <button
          type="button"
          class="dyf-btn dyf-btn-primary"
          @click="emit('edit', shoe); emit('close')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
          <span>ویرایش این مدل</span>
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
