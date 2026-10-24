<script setup lang="ts">
import { useConfirm } from '../stores/confirm';

const { state, handleConfirm, handleCancel } = useConfirm();
</script>

<template>
  <div v-if="state.isOpen" class="dyf-modal-backdrop is-open" @click.self="handleCancel">
    <div class="dyf-modal-card" style="max-width: 440px; text-align: center; padding: 1.75rem;">
      <!-- آیکون هشدار یا تأیید -->
      <div
        style="width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;"
        :style="
          state.options.isDestructive
            ? 'background: rgba(224, 109, 83, 0.15); border: 2px solid #e06d53; color: #e06d53;'
            : 'background: rgba(216, 178, 100, 0.15); border: 2px solid var(--gold-primary); color: var(--gold-primary);'
        "
      >
        <svg
          v-if="state.options.isDestructive"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <svg
          v-else
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3 style="font-family: var(--font-title); font-size: 1.15rem; font-weight: 800; color: var(--text-ivory); margin-bottom: 0.5rem;">
        {{ state.options.title }}
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem;">
        {{ state.options.message }}
      </p>

      <div style="display: flex; gap: 0.75rem; justify-content: center;">
        <button
          type="button"
          class="dyf-btn dyf-btn-outline"
          style="flex: 1;"
          @click="handleCancel"
        >
          {{ state.options.cancelText || 'انصراف' }}
        </button>
        <button
          type="button"
          class="dyf-btn"
          :class="state.options.isDestructive ? 'dyf-btn-outline' : 'dyf-btn-primary'"
          :style="state.options.isDestructive ? 'flex: 1; background: #e06d53; color: #fff; border-color: #e06d53;' : 'flex: 1;'"
          @click="handleConfirm"
        >
          {{ state.options.confirmText || 'تأیید' }}
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
