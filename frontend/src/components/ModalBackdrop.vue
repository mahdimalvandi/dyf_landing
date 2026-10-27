<template>
  <div
    v-if="isOpen"
    :id="id"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      :class="cardClass"
      :style="cardStyle"
      @click.stop
    >
      <div v-if="showHeader" class="dyf-modal-header">
        <h3 class="dyf-modal-title">{{ title }}</h3>
        <button
          type="button"
          class="dyf-modal-close"
          aria-label="بستن"
          @click="close"
        >
          &times;
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  cardClass: {
    type: [String, Object, Array],
    default: '',
  },
  cardStyle: {
    type: [String, Object],
    default: '',
  },
});

const emit = defineEmits(['close']);

function close() {
  emit('close');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close();
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>
