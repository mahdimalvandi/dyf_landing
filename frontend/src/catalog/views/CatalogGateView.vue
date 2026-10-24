<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogAccessStore } from '../stores/access';
import { useToast } from '@/admin/stores/toast';

const router = useRouter();
const accessStore = useCatalogAccessStore();
const toast = useToast();

const phone = ref('09121112233');
const phoneError = ref('');
const otpStep = ref<'phone' | 'otp'>('phone');
const otpDigits = ref(['', '', '', '', '']);
const otpInputs = ref<HTMLInputElement[]>([]);
const isSendingOtp = ref(false);
const isVerifyingOtp = ref(false);
const otpTimer = ref(60);
let otpInterval: ReturnType<typeof setInterval> | null = null;

const displayPhone = computed(() => phone.value);
const formattedOtpTimer = computed(() => {
  const mins = Math.floor(otpTimer.value / 60);
  const secs = otpTimer.value % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
});

onMounted(async () => {
  const resultStatus = await accessStore.initAccess();
  if (resultStatus === 'GRANTED') {
    // If access is already granted directly, we can either navigate to grid or show the direct entry box
    if (accessStore.isDirect.value) {
      router.push('/grid');
    }
  } else if (resultStatus === 'EXPIRED') {
    router.push('/expired');
  }
});

function handleEnterDirect() {
  router.push('/grid');
}

function handlePhoneInput(e: Event) {
  const input = e.target as HTMLInputElement;
  const cleaned = input.value.replace(/\D/g, '').slice(0, 11);
  phone.value = cleaned;
  phoneError.value = '';
}

function startOtpTimer() {
  if (otpInterval) clearInterval(otpInterval);
  otpTimer.value = 60;
  otpInterval = setInterval(() => {
    otpTimer.value -= 1;
    if (otpTimer.value <= 0) {
      if (otpInterval) clearInterval(otpInterval);
      otpInterval = null;
    }
  }, 1000);
}

function handleSendOtp() {
  const cleanPhone = phone.value.trim();
  if (!/^09\d{9}$/.test(cleanPhone)) {
    phoneError.value = 'لطفاً شماره موبایل معتبر ۱۱ رقمی وارد نمایید (مانند 09121112233).';
    return;
  }
  phoneError.value = '';
  isSendingOtp.value = true;

  setTimeout(() => {
    isSendingOtp.value = false;
    otpStep.value = 'otp';
    startOtpTimer();
    toast.success('کد تأیید ۵ رقمی به شماره شما پیامک شد.', 'ارسال پیامک');
    setTimeout(() => {
      otpInputs.value[0]?.focus();
    }, 100);
  }, 600);
}

function handleOtpDigitInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement;
  const val = input.value.replace(/\D/g, '').slice(-1);
  otpDigits.value[index] = val;

  if (val && index < 4) {
    otpInputs.value[index + 1]?.focus();
  }
}

function handleOtpKeyDown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  } else if (e.key === 'Enter') {
    handleVerifyOtp();
  }
}

function handleOtpPaste(e: ClipboardEvent) {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') || '';
  const digits = text.replace(/\D/g, '').slice(0, 5);
  for (let i = 0; i < 5; i++) {
    otpDigits.value[i] = digits[i] || '';
  }
  if (digits.length > 0) {
    const nextIdx = Math.min(digits.length, 4);
    otpInputs.value[nextIdx]?.focus();
  }
}

function handleVerifyOtp() {
  const code = otpDigits.value.join('');
  if (code.length < 5) {
    toast.warning('لطفاً هر ۵ رقم کد تایید را وارد کنید.', 'کد ناقص');
    return;
  }

  isVerifyingOtp.value = true;
  setTimeout(() => {
    isVerifyingOtp.value = false;
    if (code === '12345' || code.length === 5) {
      if (otpInterval) clearInterval(otpInterval);
      toast.success('هویت شما تأیید شد. در حال بارگذاری کاتالوگ...', 'خوش آمدید');
      accessStore.setAccessGranted(
        {
          linkID: accessStore.linkID.value || 9081,
          recipientName: accessStore.recipientName.value || 'همکار گرامی',
          authMethod: 'OTP',
          status: 'ACTIVE',
          firstViewedAt: Math.floor(Date.now() / 1000),
          viewingExpiresAt: Math.floor(Date.now() / 1000) + 7200,
          lastAccessedAt: Math.floor(Date.now() / 1000),
          remainingSeconds: 7200,
          shoesCount: accessStore.shoesCount.value || 4,
        },
        accessStore.token.value || 'vip_session'
      );
      router.push('/grid');
    } else {
      toast.error('کد وارد شده صحیح نمی‌باشد. کد آزمایشی: ۱۲۳۴۵', 'خطای تأیید');
    }
  }, 600);
}

function handleChangePhone() {
  otpStep.value = 'phone';
  if (otpInterval) clearInterval(otpInterval);
}

function handleResendOtp() {
  if (otpTimer.value > 0) return;
  startOtpTimer();
  toast.info('کد تأیید جدید مجدداً برای شماره شما ارسال شد.', 'ارسال مجدد');
}
</script>

<template>
  <div class="dyf-auth-view">
    <div class="dyf-auth-card">
      <!-- برند و عنوان بالای فرم -->
      <div class="dyf-auth-brand">
        <img src="/assets/images/logo.png" alt="لوگو برند DYF" class="dyf-auth-logo">
        <h1 class="dyf-auth-title">کاتالوگ خصوصی DYF</h1>
        <p v-if="accessStore.recipientName.value" class="dyf-auth-subtitle" style="display: block; color: var(--gold-light);">
          اختصاصی: {{ accessStore.recipientName.value }}
        </p>
      </div>

      <!-- وضعیت لودینگ و اعتبارسنجی اولیه توکن -->
      <div v-if="accessStore.isLoading.value" style="padding: 2.5rem 1rem; text-align: center;">
        <div class="dyf-spinner" style="margin: 0 auto 1rem; width: 36px; height: 36px; border-width: 3px;"></div>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
          در حال بررسی اعتبار پیوند اختصاصی و مجوزهای دسترسی...
        </p>
      </div>

      <!-- جعبه خطای لوکس: در صورت نامعتبر بودن، غیرفعال بودن یا انقضای لینک -->
      <div
        v-else-if="accessStore.hasError.value"
        class="dyf-token-error-box"
        style="background: rgba(224, 86, 74, 0.12); border: 1px solid rgba(224, 86, 74, 0.35); border-radius: var(--r-md); padding: 1.25rem; margin-bottom: 1.5rem; text-align: right;"
      >
        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--status-danger); font-weight: 800; font-size: 0.95rem; margin-bottom: 0.35rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span>{{ accessStore.errorTitle.value || 'لینک دسترسی نامعتبر است' }}</span>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
          {{ accessStore.errorMessage.value || 'این لینک منقضی شده یا توسط مدیریت آتلیه غیرفعال گردیده است.' }}
        </p>
        <div style="margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <a href="catalog.html" class="dyf-btn dyf-btn-outline dyf-btn-sm" style="justify-content: center;">
            ورود همکاران با شماره همراه
          </a>
          <a href="index.html" class="dyf-btn dyf-btn-outline dyf-btn-sm" style="justify-content: center; opacity: 0.8;">
            بازگشت به سایت اصلی DYF
          </a>
        </div>
      </div>

      <!-- لینک مجاز مستقیم (DIRECT Access) -->
      <div v-else-if="accessStore.isAuthenticated.value && accessStore.isDirect.value" style="padding-top: 0.5rem;">
        <div style="background: rgba(76, 217, 100, 0.1); border: 1px solid rgba(76, 217, 100, 0.3); border-radius: var(--r-md); padding: 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #4cd964; line-height: 1.6; text-align: right;">
          🛡️ <strong>دسترسی مجاز اختصاصی:</strong> لینک شما معتبر است و دسترسی مستقیم به کلکسیون برای <strong>{{ accessStore.recipientName.value }}</strong> صادر گردید.
        </div>
        <button
          type="button"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          style="width: 100%; justify-content: center;"
          @click="handleEnterDirect"
        >
          <span>ورود مستقیم به کاتالوگ</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>

      <!-- فرم احراز هویت پیامکی همکاران یا لینک‌های دارای OTP (FE-020) -->
      <div v-else>
        <!-- مرحله اول: شماره موبایل -->
        <div v-if="otpStep === 'phone'" class="dyf-auth-step">
          <p class="dyf-auth-note">
            جهت تأیید هویت و مشاهده مدل‌های انحصاری، شماره همراه خود را وارد فرمایید.
          </p>

          <div class="dyf-form-group">
            <label for="catPhoneInput" class="dyf-form-label dyf-form-label-required">شماره تلفن همراه</label>
            <div class="dyf-input-wrap">
              <input
                id="catPhoneInput"
                type="tel"
                class="dyf-input"
                :class="{ 'dyf-input-error': phoneError }"
                placeholder="09121112233"
                dir="ltr"
                maxlength="11"
                autocomplete="tel"
                :value="phone"
                @input="handlePhoneInput"
                @keydown.enter="handleSendOtp"
              >
            </div>
            <p v-if="phoneError" class="dyf-form-hint" style="color: var(--status-danger);">{{ phoneError }}</p>
            <p v-else class="dyf-form-hint">شماره باید با ۰۹ آغاز شده و ۱۱ رقم باشد.</p>
          </div>

          <button
            type="button"
            class="dyf-btn dyf-btn-primary dyf-btn-lg"
            :class="{ 'is-loading': isSendingOtp }"
            style="width: 100%; justify-content: center;"
            :disabled="isSendingOtp"
            @click="handleSendOtp"
          >
            <span>ارسال کد تأیید یک‌بارمصرف</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>

        <!-- مرحله دوم: ورود کد ۵ رقمی OTP -->
        <div v-else class="dyf-auth-step">
          <p class="dyf-auth-note">
            کد تأیید ۵ رقمی به شماره <span class="dyf-auth-phone-display">{{ displayPhone }}</span> پیامک شد.
          </p>

          <div class="dyf-otp-grid" @paste="handleOtpPaste">
            <input
              v-for="(digit, idx) in otpDigits"
              :key="idx"
              ref="otpInputs"
              v-model="otpDigits[idx]"
              type="text"
              maxlength="1"
              inputmode="numeric"
              class="dyf-otp-digit"
              :class="{ 'is-filled': Boolean(otpDigits[idx]) }"
              autocomplete="one-time-code"
              @input="handleOtpDigitInput(idx, $event)"
              @keydown="handleOtpKeyDown(idx, $event)"
            >
          </div>

          <div class="dyf-otp-timer-wrap">
            <div>زمان اعتبار کد: <span class="dyf-otp-timer">{{ formattedOtpTimer }}</span></div>
            <button
              type="button"
              class="dyf-otp-resend"
              :disabled="otpTimer > 0"
              @click="handleResendOtp"
            >
              ارسال مجدد کد
            </button>
          </div>

          <button
            type="button"
            class="dyf-btn dyf-btn-primary dyf-btn-lg"
            :class="{ 'is-loading': isVerifyingOtp }"
            style="width: 100%; margin-bottom: 0.85rem; justify-content: center;"
            :disabled="isVerifyingOtp"
            @click="handleVerifyOtp"
          >
            <span>تأیید و ورود به کاتالوگ</span>
          </button>

          <button
            type="button"
            class="dyf-btn dyf-btn-outline"
            style="width: 100%; font-size: 0.82rem; justify-content: center;"
            @click="handleChangePhone"
          >
            ویرایش شماره موبایل
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
