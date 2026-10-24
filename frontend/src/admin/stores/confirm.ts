/**
 * DYF Admin — Reactive Confirm Dialog Store (FE-018)
 */

import { reactive } from 'vue';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve?: (value: boolean) => void;
}

const state = reactive<ConfirmState>({
  isOpen: false,
  options: {
    title: 'تأیید عملیات',
    message: '',
  },
});

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    state.options = {
      confirmText: 'تأیید و ادامه',
      cancelText: 'انصراف',
      isDestructive: false,
      ...options,
    };
    state.isOpen = true;

    return new Promise((resolve) => {
      state.resolve = resolve;
    });
  }

  function handleConfirm() {
    state.isOpen = false;
    if (state.resolve) state.resolve(true);
  }

  function handleCancel() {
    state.isOpen = false;
    if (state.resolve) state.resolve(false);
  }

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
