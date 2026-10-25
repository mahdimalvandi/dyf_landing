<template>
  <div id="dyfToastContainer" class="dyf-toast-container" aria-live="polite">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['dyf-toast', `dyf-toast-${toast.type}`, { 'is-hiding': toast.isHiding }]"
    >
      <svg
        v-if="toast.type === 'success'"
        class="dyf-toast-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="20 6 9 17 4 12" />
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
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12.01" y1="16" x2="12.01" y2="16" />
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
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>

      <div class="dyf-toast-content">
        <div class="dyf-toast-title">{{ toast.title }}</div>
        <div class="dyf-toast-message">{{ toast.message }}</div>
      </div>

      <button
        class="dyf-toast-close"
        type="button"
        aria-label="بستن"
        @click="dismissToast(toast.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast.js';

const { toasts, dismissToast } = useToast();
</script>
