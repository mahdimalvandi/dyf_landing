import { ref } from 'vue';

const toasts = ref([]);
let toastIdCounter = 0;

export function useToast() {
  function showToast({ type = 'info', title = '', message = '', duration = 4000 }) {
    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches))) {
      return;
    }

    const id = ++toastIdCounter;
    const toast = {
      id,
      type,
      title,
      message,
      isHiding: false,
    };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }

  function dismissToast(id) {
    const target = toasts.value.find((t) => t.id === id);
    if (!target) return;
    target.isHiding = true;
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 250);
  }

  return {
    toasts,
    showToast,
    dismissToast,
  };
}
