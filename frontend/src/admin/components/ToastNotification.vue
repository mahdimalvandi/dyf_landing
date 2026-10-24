<script setup lang="ts">
import { useToast, type ToastType } from '../stores/toast';

const { toasts, removeToast } = useToast();

function getToastClass(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'dyf-toast-success';
    case 'error':
      return 'dyf-toast-error';
    case 'warning':
      return 'dyf-toast-warning';
    case 'info':
    default:
      return 'dyf-toast-info';
  }
}
</script>

<template>
  <teleport to="#dyfToastContainer">
    <transition-group name="toast-anim" tag="div" class="dyf-toast-group">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="dyf-toast"
        :class="getToastClass(toast.type)"
        role="alert"
      >
        <!-- آیکون وضعیت -->
        <svg
          v-if="toast.type === 'success'"
          class="dyf-toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>

        <svg
          v-else-if="toast.type === 'error'"
          class="dyf-toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" x2="9" y1="9" y2="15" />
          <line x1="9" x2="15" y1="9" y2="15" />
        </svg>

        <svg
          v-else-if="toast.type === 'warning'"
          class="dyf-toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" x2="12" y1="9" y2="13" />
          <line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>

        <svg
          v-else
          class="dyf-toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="16" y2="12" />
          <line x1="12" x2="12.01" y1="8" y2="8" />
        </svg>

        <!-- محتوای پیام -->
        <div class="dyf-toast-content">
          <div v-if="toast.title" class="dyf-toast-title">{{ toast.title }}</div>
          <div class="dyf-toast-message">{{ toast.message }}</div>
        </div>

        <!-- دکمه بستن -->
        <button
          type="button"
          class="dyf-toast-close"
          aria-label="بستن اعلان"
          @click="removeToast(toast.id)"
        >
          &times;
        </button>
      </div>
    </transition-group>
  </teleport>
</template>

<style scoped>
.toast-anim-enter-active,
.toast-anim-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-anim-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}

.toast-anim-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
</style>
