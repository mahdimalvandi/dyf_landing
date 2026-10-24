/**
 * Unit Tests for Toast & Confirm Store (FE-018)
 */

import { useToast } from '../stores/toast';
import { useConfirm } from '../stores/confirm';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runToastConfirmTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      throw new Error(message);
    }
  };

  const test = async (name: string, fn: () => void | Promise<void>) => {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ name, passed: false, error: errorMsg });
    }
  };

  // Test 1: useToast add & remove
  await test('useToast adds items and allows manual removal', () => {
    const toast = useToast();
    const id = toast.success('مدل با موفقیت ذخیره شد.', 'تأیید');
    assert(toast.toasts.length > 0, 'Toasts array must not be empty');
    const item = toast.toasts.find((t) => t.id === id);
    assert(item !== undefined, 'Created toast must exist');
    assert(item?.type === 'success', 'Type must be success');

    toast.removeToast(id);
    assert(!toast.toasts.some((t) => t.id === id), 'Toast must be removed');
  });

  // Test 2: useConfirm resolve true
  await test('useConfirm resolves true when handleConfirm is invoked', async () => {
    const { confirm, handleConfirm, state } = useConfirm();

    const promise = confirm({
      title: 'تأیید حذف',
      message: 'آیا اطمینان دارید؟',
    });

    assert(state.isOpen === true, 'Dialog must be open');
    handleConfirm();

    const res = await promise;
    assert(res === true, 'Must resolve to true');
    assert(state.isOpen === false, 'Dialog must close after confirm');
  });

  // Test 3: useConfirm resolve false on cancel
  await test('useConfirm resolves false when handleCancel is invoked', async () => {
    const { confirm, handleCancel, state } = useConfirm();

    const promise = confirm({
      title: 'انصراف',
      message: 'پیام تست',
    });

    handleCancel();
    const res = await promise;
    assert(res === false, 'Must resolve to false');
  });

  return results;
}
