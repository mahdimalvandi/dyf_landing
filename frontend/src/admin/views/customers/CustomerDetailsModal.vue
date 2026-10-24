<script setup lang="ts">
import { computed } from 'vue';
import type { CustomerResponse } from '@/shared/api/types';

const props = defineProps<{
  show: boolean;
  customer: CustomerResponse | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', customer: CustomerResponse): void;
  (e: 'issueLink', customer: CustomerResponse): void;
}>();

const initials = computed(() => {
  if (!props.customer) return 'DYF';
  const f = props.customer.firstNameFa ? props.customer.firstNameFa[0] : '';
  const l = props.customer.lastNameFa ? props.customer.lastNameFa[0] : '';
  return `${f} ${l}`.trim() || 'DYF';
});
</script>

<template>
  <div v-if="show && customer" class="dyf-modal-backdrop is-open" @click.self="emit('close')">
    <div class="dyf-modal-card" style="max-width: 680px; display: flex; flex-direction: column;">
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title">پروفایل و پرونده همکاری مشتری</h3>
        </div>
        <button type="button" class="dyf-modal-close" @click="emit('close')">&times;</button>
      </div>

      <div style="padding: 1.5rem; overflow-y: auto;">
        <!-- کارت هویت مشتری -->
        <div
          style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-md); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem;"
        >
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div
              style="width: 54px; height: 54px; border-radius: 50%; background: rgba(216, 178, 100, 0.15); border: 2px solid var(--gold-primary); color: var(--gold-primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;"
            >
              {{ initials }}
            </div>
            <div>
              <div style="font-family: var(--font-title); font-size: 1.15rem; font-weight: 800; color: var(--text-ivory);">
                {{ customer.firstNameFa }} {{ customer.lastNameFa }}
              </div>
              <div style="font-size: 0.82rem; color: var(--gold-light); margin-top: 0.2rem;">
                {{ customer.storeName || 'مشتری مستقیم' }}
              </div>
            </div>
          </div>

          <div style="text-align: left;">
            <div style="font-family: monospace; font-size: 0.95rem; font-weight: 700; color: var(--gold-light); direction: ltr;">
              {{ customer.phoneNumber }}
            </div>
            <span
              class="dyf-badge"
              :class="customer.isActive ? 'dyf-badge-active' : 'dyf-badge-expired'"
              style="margin-top: 0.35rem;"
            >
              {{ customer.isActive ? 'حساب فعال' : 'حساب غیرفعال' }}
            </span>
          </div>
        </div>

        <!-- اطلاعات تفصیلی و یادداشت‌ها -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div v-if="customer.notes" style="background: rgba(36, 30, 25, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); padding: 1rem;">
            <div style="font-size: 0.78rem; color: var(--gold-primary); margin-bottom: 0.35rem; font-weight: 700;">
              یادداشت‌های داخلی کارگاه:
            </div>
            <p style="font-size: 0.85rem; color: var(--text-ivory); line-height: 1.6;">
              {{ customer.notes }}
            </p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;">
            <div style="background: rgba(36, 30, 25, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); padding: 0.85rem;">
              <span style="color: var(--text-muted);">شناسه سیستمی:</span>
              <strong style="color: var(--text-ivory); margin-right: 0.5rem;">CUST-{{ customer.ID }}</strong>
            </div>
            <div style="background: rgba(36, 30, 25, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); padding: 0.85rem;">
              <span style="color: var(--text-muted);">دسترسی پیامکی:</span>
              <strong style="color: #4cd964; margin-right: 0.5rem;">مجاز و متصل</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="dyf-modal-footer" style="display: flex; justify-content: space-between;">
        <button type="button" class="dyf-btn dyf-btn-outline" @click="emit('close')">بستن</button>
        <div style="display: flex; gap: 0.5rem;">
          <button
            type="button"
            class="dyf-btn dyf-btn-outline"
            @click="emit('edit', customer); emit('close')"
          >
            ویرایش اطلاعات
          </button>
          <button
            type="button"
            class="dyf-btn dyf-btn-primary"
            @click="emit('issueLink', customer); emit('close')"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>صدور لینک دسترسی کاتالوگ</span>
          </button>
        </div>
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
