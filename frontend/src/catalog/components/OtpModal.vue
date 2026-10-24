<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useCatalogAccessStore } from '../stores/access';
import { useToast } from '@/admin/stores/toast';

interface Props {
  isOpen: boolean;
  phone: string;
  token?: string;
  expiresInSeconds?: number;
}

const props = withDefaults(defineProps<Props>(), {
  expiresInSeconds: 120,
  token: '',
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'changePhone'): void;
  (e: 'verified', recipientName: string): void;
}>();

const accessStore = useCatalogAccessStore();
const toast = useToast();

const digits = ref<string[]>(['', '', '', '', '']);
const digitInputs = ref<HTMLInputElement[]>([]);
const isVerifying = ref(false);
const isResending = ref(false);
const isUnlocked = ref(false);
const errorMessage = ref('');
const timerSeconds = ref(props.expiresInSeconds);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const formattedTimer = computed(() => {
  const m = Math.floor(timerSeconds.value / 60);
  const s = timerSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const canResend = computed(() => timerSeconds.value <= 0 && !isResending.value);

function startTimer(duration: number) {
  if (countdownTimer) clearInterval(countdownTimer);
  timerSeconds.value = duration;
  countdownTimer = setInterval(() => {
    timerSeconds.value -= 1;
    if (timerSeconds.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      digits.value = ['', '', '', '', ''];
      errorMessage.value = '';
      isUnlocked.value = false;
      startTimer(props.expiresInSeconds);
      nextTick(() => {
        digitInputs.value[0]?.focus();
      });
    } else {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  },
  { immediate: true }
);

function handleInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement;
  const raw = input.value.replace(/\D/g, '').slice(-1);
  digits.value[index] = raw;
  errorMessage.value = '';

  if (raw && index < 4) {
    digitInputs.value[index + 1]?.focus();
  }

  // Auto-verify if all 5 digits are entered
  if (digits.value.every((d) => d.length === 1)) {
    handleVerify();
  }
}

function handleKeyDown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[index] && index > 0) {
    digitInputs.value[index - 1]?.focus();
  } else if (e.key === 'Enter') {
    handleVerify();
  }
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault();
  const raw = e.clipboardData?.getData('text') || '';
  const pastedDigits = raw.replace(/\D/g, '').slice(0, 5);
  for (let i = 0; i < 5; i++) {
    digits.value[i] = pastedDigits[i] || '';
  }
  if (pastedDigits.length > 0) {
    const nextIdx = Math.min(pastedDigits.length, 4);
    digitInputs.value[nextIdx]?.focus();
  }
  if (digits.value.every((d) => d.length === 1)) {
    handleVerify();
  }
}

async function handleVerify() {
  const code = digits.value.join('');
  if (code.length < 5) {
    errorMessage.value = 'لطفاً هر ۵ رقم کد تأیید را وارد فرمایید.';
    return;
  }

  isVerifying.value = true;
  errorMessage.value = '';

  try {
    const res = await accessStore.verifyOtp(props.phone, code);
    if (res.success) {
      isUnlocked.value = true;
      toast.success('احراز هویت موفقیت‌آمیز بود. در حال ورود...', 'خوش آمدید');
      setTimeout(() => {
        emit('verified', accessStore.recipientName.value);
      }, 1000);
    } else {
      errorMessage.value = res.message || 'کد تأیید نادرست است. لطفاً مجدداً بررسی فرمایید.';
      toast.error(errorMessage.value, 'خطای ورود');
    }
  } catch (err: unknown) {
    const apiErr = err as { error?: { message?: string } };
    errorMessage.value = apiErr?.error?.message || 'کد تأیید نادرست است یا مهلت آن به پایان رسیده است.';
    toast.error(errorMessage.value, 'خطای ورود');
  } finally {
    isVerifying.value = false;
  }
}

async function handleResend() {
  if (!canResend.value) return;
  isResending.value = true;
  try {
    const res = await accessStore.sendOtp(props.phone);
    if (res.success) {
      digits.value = ['', '', '', '', ''];
      errorMessage.value = '';
      startTimer(res.expiresInSeconds || 120);
      toast.info('کد تأیید جدید برای شما ارسال گردید.', 'ارسال مجدد پیامک');
      nextTick(() => {
        digitInputs.value[0]?.focus();
      });
    } else {
      toast.error(res.message || 'خطا در ارسال مجدد کد تأیید.', 'خطا');
    }
  } catch {
    toast.error('ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.', 'خطا');
  } finally {
    isResending.value = false;
  }
}

function handleClose() {
  if (isVerifying.value || isUnlocked.value) return;
  emit('close');
}

function handleChangePhone() {
  emit('changePhone');
}
</script>

<template>
  <div
    v-if="isOpen"
    class="dyf-modal-backdrop is-open"
    role="dialog"
    aria-modal="true"
    aria-labelledby="otpModalTitle"
    @click.self="handleClose"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 440px; width: 92%; padding: 2.25rem 2rem; position: relative; overflow: hidden;"
    >
      <!-- افکت بصری باز شدن قفل طلایی پس از موفقیت -->
      <transition name="fade">
        <div
          v-if="isUnlocked"
          style="position: absolute; inset: 0; background: rgba(20, 18, 16, 0.98); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20; padding: 2rem; text-align: center;"
        >
          <div
            style="width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle, rgba(212, 163, 89, 0.25) 0%, rgba(212, 163, 89, 0) 70%); border: 2px solid var(--gold-primary); display: flex; align-items: center; justify-content: center; color: var(--gold-light); margin-bottom: 1.25rem; animation: dyfScaleGlow 0.8s ease-out;"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style="font-family: var(--font-title); font-size: 1.35rem; color: var(--gold-light); margin-bottom: 0.5rem; font-weight: 800;">
            قفل کاتالوگ با موفقیت باز شد
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
            خوش آمدید. در حال انتقال به مجموعه اختصاصی شما...
          </p>
        </div>
      </transition>

      <!-- هدر مودال -->
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div
          style="width: 56px; height: 56px; margin: 0 auto 1rem; border-radius: 50%; background: rgba(212, 163, 89, 0.12); border: 1px solid var(--border-medium); display: flex; align-items: center; justify-content: center; color: var(--gold-primary);"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 id="otpModalTitle" style="font-family: var(--font-title); font-size: 1.25rem; font-weight: 800; color: var(--text-ivory); margin-bottom: 0.4rem;">
          تأیید هویت و رمز یک‌بارمصرف
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
          کد ۵ رقمی امنیتی به شماره <span style="color: var(--gold-light); font-weight: 700; direction: ltr; display: inline-block;">{{ phone }}</span> ارسال گردید.
        </p>
      </div>

      <!-- خانه‌های ۵ رقمی کد یک‌بارمصرف -->
      <div class="dyf-otp-grid" style="margin-bottom: 1.25rem;" @paste="handlePaste">
        <input
          v-for="(digit, idx) in digits"
          :key="idx"
          ref="digitInputs"
          v-model="digits[idx]"
          type="text"
          maxlength="1"
          inputmode="numeric"
          class="dyf-otp-digit"
          :class="{ 'is-filled': Boolean(digits[idx]), 'dyf-input-error': Boolean(errorMessage) }"
          autocomplete="one-time-code"
          :disabled="isVerifying || isUnlocked"
          @input="handleInput(idx, $event)"
          @keydown="handleKeyDown(idx, $event)"
        >
      </div>

      <!-- پیام خطای اعتبارسنجی -->
      <p
        v-if="errorMessage"
        style="color: var(--status-danger); font-size: 0.82rem; text-align: center; margin-top: -0.5rem; margin-bottom: 1rem; line-height: 1.5;"
      >
        {{ errorMessage }}
      </p>

      <!-- شمارنده معکوس و ارسال مجدد -->
      <div class="dyf-otp-timer-wrap" style="margin-bottom: 1.5rem;">
        <div>
          زمان اعتبار کد:
          <span class="dyf-otp-timer" :style="{ color: timerSeconds < 15 ? 'var(--status-danger)' : 'var(--gold-light)' }">
            {{ formattedTimer }}
          </span>
        </div>
        <button
          type="button"
          class="dyf-otp-resend"
          :disabled="!canResend"
          @click="handleResend"
        >
          <span v-if="isResending">در حال ارسال...</span>
          <span v-else>ارسال مجدد کد</span>
        </button>
      </div>

      <!-- دکمه‌های تایید و ویرایش شماره -->
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button
          type="button"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          :class="{ 'is-loading': isVerifying }"
          style="width: 100%; justify-content: center;"
          :disabled="isVerifying || isUnlocked"
          @click="handleVerify"
        >
          <span>تأیید و ورود به کاتالوگ</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        <button
          type="button"
          class="dyf-btn dyf-btn-outline"
          style="width: 100%; font-size: 0.84rem; justify-content: center;"
          :disabled="isVerifying || isUnlocked"
          @click="handleChangePhone"
        >
          ویرایش شماره موبایل
        </button>
      </div>

      <!-- دکمه بستن گوشه بالا -->
      <button
        type="button"
        class="dyf-modal-close"
        style="position: absolute; top: 1rem; left: 1rem;"
        aria-label="بستن"
        @click="handleClose"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes dyfScaleGlow {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
