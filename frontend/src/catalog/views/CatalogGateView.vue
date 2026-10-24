<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogAccessStore } from '../stores/access';
import { useToast } from '@/admin/stores/toast';

const router = useRouter();
const accessStore = useCatalogAccessStore();
const toast = useToast();

const phone = ref('09121112233');
const step = ref<'phone' | 'otp'>('phone');
const otpDigits = ref<string[]>(['', '', '', '', '']);
const otpInputs = ref<HTMLInputElement[]>([]);
const isSending = ref(false);
const isVerifying = ref(false);
const timer = ref(60);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const phoneLabel = computed(() => {
  if (accessStore.recipientName.value && accessStore.status.value === 'REQUIRES_OTP') {
    return `شماره تلفن همراه همکار (${accessStore.recipientName.value})`;
  }
  return 'شماره تلفن همراه';
});

const formattedTimer = computed(() => {
  const m = Math.floor(timer.value / 60);
  const s = timer.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

onMounted(async () => {
  const resultStatus = await accessStore.initAccess();
  if (resultStatus === 'GRANTED' && accessStore.isDirect.value) {
    // Kept at gate to let them click the direct entry button if desired, or navigate
  } else if (resultStatus === 'EXPIRED') {
    router.push('/expired');
  }
});

function handleDirectEnter() {
  router.push('/grid');
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timer.value = 60;
  timerInterval = setInterval(() => {
    timer.value -= 1;
    if (timer.value <= 0) {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
}

async function handleSendPhone() {
  const cleanPhone = phone.value.trim().replace(/\D/g, '');
  phone.value = cleanPhone;

  if (!/^09\d{9}$/.test(cleanPhone)) {
    toast.error('لطفاً یک شماره موبایل معتبر ۱۱ رقمی (مثال: 09121112233) وارد کنید.', 'شماره نامعتبر');
    return;
  }

  isSending.value = true;
  try {
    const res = await accessStore.sendOtp(cleanPhone);
    if (res.success) {
      step.value = 'otp';
      startTimer();
      toast.success('کد ۵ رقمی تأیید برای شماره شما ارسال شد.', 'کد تأیید ارسال شد');
      nextTick(() => {
        otpInputs.value[0]?.focus();
      });
    } else {
      toast.error(res.message || 'خطا در ارسال کد تأیید', 'خطا');
    }
  } catch {
    toast.error('ارتباط با سرور برقرار نشد.', 'خطا');
  } finally {
    isSending.value = false;
  }
}

function handleDigitInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement;
  const val = input.value.replace(/\D/g, '').slice(-1);
  otpDigits.value[index] = val;

  if (val && index < 4) {
    otpInputs.value[index + 1]?.focus();
  }

  if (otpDigits.value.every((d) => d.length === 1)) {
    handleVerify();
  }
}

function handleDigitKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  } else if (e.key === 'Enter') {
    handleVerify();
  }
}

async function handleVerify() {
  const code = otpDigits.value.join('');
  if (code.length < 5) {
    toast.warning('لطفاً هر ۵ رقم کد تأیید را وارد کنید.', 'کد ناقص است');
    return;
  }

  isVerifying.value = true;
  try {
    const res = await accessStore.verifyOtp(phone.value, code);
    if (res.success) {
      if (timerInterval) clearInterval(timerInterval);
      toast.success('خوش آمدید! در حال انتقال به کاتالوگ خصوصی DYF...', 'احراز هویت موفق');
      setTimeout(() => {
        router.push('/grid');
      }, 500);
    } else {
      toast.error(res.message || 'کد واردشده نامعتبر است.', 'کد تأیید نادرست است');
    }
  } catch {
    toast.error('کد تأیید نامعتبر است یا منقضی شده است.', 'خطای تأیید');
  } finally {
    isVerifying.value = false;
  }
}

function handleResend() {
  if (timer.value > 0) return;
  startTimer();
  toast.info('کد ۵ رقمی تأیید مجدداً به شماره شما ارسال شد.', 'ارسال مجدد کد');
}
</script>

<template>
  <!-- ======================================================================
       ۱. نمای ورود و احراز هویت خریدار (#catLoginView)
       مطابق ۱۰۰٪ ساختار کاتالوگ اصلی و دیزاین سیستم آتلیه DYF
       ====================================================================== -->
  <div id="catLoginView" class="dyf-auth-view">
    <div class="dyf-auth-card">
      <div class="dyf-auth-brand">
        <img src="/assets/images/logo.png" alt="لوگو برند DYF" class="dyf-auth-logo">
        <h1 id="catLoginHeaderTitle" class="dyf-auth-title">ورود به کاتالوگ خصوصی DYF</h1>
        <p id="catLoginHeaderSub" class="dyf-auth-subtitle" style="display: none;"></p>
      </div>

      <!-- وضعیت لودینگ اولیه بررسی توکن -->
      <div v-if="accessStore.isLoading.value" style="padding: 2rem 1rem; text-align: center;">
        <div class="dyf-spinner" style="margin: 0 auto 1rem; width: 36px; height: 36px; border-width: 3px;"></div>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">در حال بررسی اعتبار لینک دسترسی...</p>
      </div>

      <!-- کارت خطا برای لینک‌های باطل‌شده / منقضی / نامعتبر -->
      <div
        v-else-if="accessStore.hasError.value"
        id="catTokenErrorBox"
        style="background: rgba(224, 86, 74, 0.12); border: 1px solid rgba(224, 86, 74, 0.35); border-radius: var(--r-md); padding: 1.25rem; margin-bottom: 1.5rem; text-align: right;"
      >
        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--status-danger); font-weight: 800; font-size: 0.95rem; margin-bottom: 0.35rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span id="catTokenErrorTitle">{{ accessStore.errorTitle.value || 'لینک دسترسی نامعتبر است' }}</span>
        </div>
        <p id="catTokenErrorDesc" style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
          {{ accessStore.errorMessage.value || 'این لینک منقضی شده یا توسط مدیریت کارگاه غیرفعال گردیده است.' }}
        </p>
        <div style="margin-top: 1rem; text-align: center;">
          <a href="catalog.html" class="dyf-btn dyf-btn-outline dyf-btn-sm">ورود مستقیم همکاران با شماره همراه</a>
        </div>
      </div>

      <!-- بخش ۱: ارسال پیامک تأیید -->
      <div
        v-else-if="!accessStore.isDirect.value && step === 'phone'"
        id="catLoginPhoneWrap"
      >
        <p class="dyf-auth-note">
          جهت ورود به کاتالوگ، شماره موبایل ثبت‌شده خود را وارد نمایید تا کد تأیید ارسال گردد.
        </p>

        <div class="dyf-form-group">
          <label id="catPhoneInputLabel" for="catPhoneInput" class="dyf-form-label dyf-form-label-required">
            {{ phoneLabel }}
          </label>
          <div class="dyf-input-wrap">
            <input
              id="catPhoneInput"
              v-model="phone"
              type="tel"
              class="dyf-input"
              placeholder="09121112233"
              dir="ltr"
              maxlength="11"
              autocomplete="tel"
              @keydown.enter="handleSendPhone"
            >
          </div>
          <p id="catPhoneHintText" class="dyf-form-hint">شماره باید با ۰۹ آغاز شده و ۱۱ رقم باشد.</p>
        </div>

        <button
          id="catSendOtpBtn"
          type="button"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          :class="{ 'is-loading': isSending }"
          style="width: 100%;"
          :disabled="isSending"
          @click="handleSendPhone"
        >
          <span>ارسال کد تأیید یک‌بارمصرف</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>

      <!-- بخش ۲: ورود کد ۵ رقمی پیامک‌شده -->
      <div
        v-else-if="!accessStore.isDirect.value && step === 'otp'"
        id="catLoginOtpWrap"
      >
        <p class="dyf-auth-note">
          کد تأیید ۵ رقمی به شماره <span id="catOtpPhoneDisplay" class="dyf-auth-phone-display">{{ phone }}</span> پیامک شد.
        </p>

        <div class="dyf-otp-grid">
          <input
            v-for="(_d, idx) in 5"
            :key="idx"
            :ref="(el) => (otpInputs[idx] = el as HTMLInputElement)"
            v-model="otpDigits[idx]"
            type="text"
            maxlength="1"
            inputmode="numeric"
            class="dyf-otp-digit"
            :class="{ 'is-filled': Boolean(otpDigits[idx]) }"
            autocomplete="one-time-code"
            @input="handleDigitInput(idx, $event)"
            @keydown="handleDigitKeydown(idx, $event)"
          >
        </div>

        <div class="dyf-otp-timer-wrap">
          <div>زمان اعتبار کد: <span id="catOtpCountdown" class="dyf-otp-timer">{{ formattedTimer }}</span></div>
          <button
            id="catResendOtpBtn"
            type="button"
            class="dyf-otp-resend"
            :disabled="timer > 0"
            @click="handleResend"
          >
            ارسال مجدد کد
          </button>
        </div>

        <button
          id="catVerifyOtpBtn"
          type="button"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          :class="{ 'is-loading': isVerifying }"
          style="width: 100%; margin-bottom: 0.85rem;"
          :disabled="isVerifying"
          @click="handleVerify"
        >
          <span>تأیید و ورود به کاتالوگ</span>
        </button>

        <button
          id="catChangePhoneBtn"
          type="button"
          class="dyf-btn dyf-btn-outline"
          style="width: 100%; font-size: 0.82rem;"
          @click="step = 'phone'"
        >
          ویرایش شماره موبایل
        </button>
      </div>

      <!-- دکمه ورود فوری برای لینک مستقیم بدون رمز -->
      <div
        v-else-if="accessStore.isDirect.value && accessStore.isAuthenticated.value"
        id="catDirectLinkEntryBox"
        style="padding-top: 0.5rem;"
      >
        <div style="background: rgba(76, 217, 100, 0.1); border: 1px solid rgba(76, 217, 100, 0.3); border-radius: var(--r-md); padding: 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #4cd964; line-height: 1.6; text-align: right;">
          🛡️ <strong>دسترسی مجاز مستقیم:</strong> شما از طریق لینک اختصاصی معتبر وارد شده‌اید و نیازی به وارد کردن شماره تلفن یا رمز پیامکی ندارید.
        </div>
        <button
          id="catDirectEnterBtn"
          type="button"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          style="width: 100%; justify-content: center;"
          @click="handleDirectEnter"
        >
          <span>ورود مستقیم به کاتالوگ</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>
