<template>
  <div
    v-if="isOpen"
    class="dyf-modal-backdrop is-open"
    style="z-index: 1050;"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 440px; border: 1px solid var(--border-medium);"
      @click.stop
    >
      <div class="dyf-modal-header" style="border-bottom: none; padding-bottom: 0.5rem;">
        <h3 class="dyf-modal-title" style="font-size: 1.1rem; color: var(--text-ivory);">
          {{ title }}
        </h3>
        <button
          type="button"
          class="dyf-modal-close"
          aria-label="بستن"
          @click="handleCancel"
        >
          &times;
        </button>
      </div>

      <div class="dyf-modal-body" style="padding: 1rem 1.5rem 1.5rem; color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">
        {{ message }}
      </div>

      <div class="dyf-modal-footer" style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button
          type="button"
          class="dyf-btn dyf-btn-outline"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="dyf-btn"
          :class="isDanger ? 'dyf-btn-danger' : 'dyf-btn-primary'"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'تأیید عملیات',
  },
  message: {
    type: String,
    default: 'آیا برای انجام این عملیات اطمینان دارید؟',
  },
  confirmText: {
    type: String,
    default: 'تأیید',
  },
  cancelText: {
    type: String,
    default: 'انصراف',
  },
  isDanger: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['confirm', 'cancel']);

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    handleCancel();
  }
}
</script>
