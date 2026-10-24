/**
 * DYF Admin — Reactive Toast Notification Store (FE-018)
 */

import { reactive } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

const state = reactive<{
  toasts: ToastItem[];
}>({
  toasts: [],
});

export function useToast() {
  function removeToast(id: string) {
    const idx = state.toasts.findIndex((t) => t.id === id);
    if (idx > -1) {
      state.toasts.splice(idx, 1);
    }
  }

  function addToast(toast: Omit<ToastItem, 'id'>): string {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const item: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    state.toasts.push(item);

    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, item.duration);
    }

    return id;
  }

  function success(message: string, title?: string) {
    return addToast({ type: 'success', title: title || 'عملیات موفق', message });
  }

  function error(message: string, title?: string) {
    return addToast({ type: 'error', title: title || 'خطا در عملیات', message });
  }

  function warning(message: string, title?: string) {
    return addToast({ type: 'warning', title: title || 'هشدار', message });
  }

  function info(message: string, title?: string) {
    return addToast({ type: 'info', title: title || 'اطلاعیه', message });
  }

  return {
    toasts: state.toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
