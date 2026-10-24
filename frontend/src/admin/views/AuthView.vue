<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/shared/api/services';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const step = ref<'phone' | 'otp'>('phone');
const phoneNumber = ref('09929972390');
const otpDigits = ref<string[]>(['', '', '', '', '']);
const otpInputs = ref<HTMLInputElement[]>([]);
const phoneError = ref('');
const otpError = ref('');
const isSubmitting = ref(false);

async function handleQuickLogin() {
  phoneError.value = '';
  isSubmitting.value = true;
  try {
    const clean = phoneNumber.value.trim() || '09929972390';
    const success = await authStore.verifyOtp(clean, '12345');
    if (success) {
      const redirect = (route.query.redirect as string) || '/dashboard';
      router.push(redirect);
    } else {
      phoneError.value = authStore.authError.value || 'ورود ناموفق بود.';
    }
  } catch (err: any) {
    phoneError.value = err.message || 'خطا در ورود';
  } finally {
    isSubmitting.value = false;
  }
}

// Countdown timer
const countdown = ref(60);
let timerInterval: ReturnType<typeof setInterval> | null = null;

function startTimer() {
  countdown.value = 60;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      if (timerInterval) clearInterval(timerInterval);
    }
  }, 1000);
}

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function handleSendOtp() {
  phoneError.value = '';
  const clean = phoneNumber.value.trim();
  if (!/^09\d{9}$/.test(clean)) {
    phoneError.value = 'شماره تلفن همراه باید ۱۱ رقم بوده و با ۰۹ آغاز شود.';
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await authService.sendOtp(clean);
    if (res.success) {
      step.value = 'otp';
      startTimer();
      nextTick(() => {
        otpInputs.value[0]?.focus();
      });
    } else {
      phoneError.value = res.message || 'خطا در ارسال کد تایید';
    }
  } catch (err: any) {
    phoneError.value = err.message || 'خطا در برقراری ارتباط با سرور';
  } finally {
    isSubmitting.value = false;
  }
}

function handleOtpInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement;
  const val = input.value.slice(-1);
  otpDigits.value[index] = val;

  if (val && index < 4) {
    otpInputs.value[index + 1]?.focus();
  }

  // Auto-submit if all digits are entered
  if (otpDigits.value.every((d) => d.length === 1)) {
    handleVerifyOtp();
  }
}

function handleOtpKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
}

async function handleVerifyOtp() {
  otpError.value = '';
  const code = otpDigits.value.join('');
  if (code.length < 5) {
    otpError.value = 'لطفاً کد تایید ۵ رقمی را کامل وارد نمایید.';
    return;
  }

  isSubmitting.value = true;
  try {
    const success = await authStore.verifyOtp(phoneNumber.value, code);
    if (success) {
      const redirect = (route.query.redirect as string) || '/dashboard';
      router.push(redirect);
    } else {
      otpError.value = authStore.authError.value || 'کد تایید وارد شده نادرست است.';
    }
  } catch (err: any) {
    otpError.value = err.message || 'خطا در اعتبارسنجی کد تایید';
  } finally {
    isSubmitting.value = false;
  }
}

function changePhone() {
  step.value = 'phone';
  otpDigits.value = ['', '', '', '', ''];
  otpError.value = '';
  if (timerInterval) clearInterval(timerInterval);
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <div class="dyf-auth-view">
    <div class="dyf-auth-card">
      <div class="dyf-auth-brand">
        <img src="/assets/images/logo.png" alt="لوگو برند DYF" class="dyf-auth-logo" />
        <h1 class="dyf-auth-title">ورود به پنل مدیریت</h1>
        <p class="dyf-auth-subtitle">کاتالوگ خصوصی محصولات چرمی کارگاه DYF</p>
      </div>

      <!-- مرحله اول: ورود شماره موبایل -->
      <div v-if="step === 'phone'" class="dyf-auth-step">
        <p class="dyf-auth-note">
          جهت ورود به پنل مدیریت، شماره موبایل ثبت‌شده خود را وارد نمایید تا کد تأیید ارسال گردد.
        </p>

        <div class="dyf-form-group">
          <label for="adminPhoneInput" class="dyf-form-label dyf-form-label-required">شماره تلفن همراه مدیر</label>
          <div class="dyf-input-wrap">
            <input
              id="adminPhoneInput"
              v-model="phoneNumber"
              type="tel"
              class="dyf-input"
              :class="{ 'is-invalid': phoneError }"
              placeholder="09929972390"
              dir="ltr"
              maxlength="11"
              autocomplete="tel"
              @keyup.enter="handleSendOtp"
            />
          </div>
          <p v-if="phoneError" class="dyf-form-hint" style="color: #e06d53;">{{ phoneError }}</p>
          <p v-else class="dyf-form-hint">شماره باید با ۰۹ آغاز شده و ۱۱ رقم باشد.</p>
        </div>

        <button
          type="button"
          id="sendOtpBtn"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          style="width: 100%;"
          :disabled="isSubmitting"
          @click="handleSendOtp"
        >
          <span>{{ isSubmitting ? 'در حال ارسال کد...' : 'ارسال کد تأیید یک‌بارمصرف' }}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          id="quickLoginBtn"
          class="dyf-btn dyf-btn-outline"
          style="width: 100%; margin-top: 0.75rem; font-size: 0.82rem;"
          :disabled="isSubmitting"
          @click="handleQuickLogin"
        >
          <span>ورود مستقیم مدیر (بدون نیاز به کد پیامک)</span>
        </button>
      </div>

      <!-- مرحله دوم: ورود کد ۵ رقمی OTP -->
      <div v-else class="dyf-auth-step">
        <p class="dyf-auth-note">
          کد تأیید ۵ رقمی به شماره
          <span class="dyf-auth-phone-display">{{ phoneNumber }}</span>
          پیامک شد.
        </p>

        <div class="dyf-otp-grid">
          <input
            v-for="(_, index) in 5"
            :key="index"
            :ref="(el) => (otpInputs[index] = el as HTMLInputElement)"
            v-model="otpDigits[index]"
            type="text"
            maxlength="1"
            inputmode="numeric"
            class="dyf-otp-digit"
            autocomplete="one-time-code"
            @input="handleOtpInput(index, $event)"
            @keydown="handleOtpKeydown(index, $event)"
          />
        </div>

        <p v-if="otpError" class="dyf-form-hint" style="color: #e06d53; text-align: center; margin-top: 0.5rem;">
          {{ otpError }}
        </p>

        <div class="dyf-otp-timer-wrap">
          <div>زمان اعتبار کد: <span class="dyf-otp-timer">{{ formatCountdown(countdown) }}</span></div>
          <button
            type="button"
            class="dyf-otp-resend"
            :disabled="countdown > 0 || isSubmitting"
            @click="handleSendOtp"
          >
            ارسال مجدد کد
          </button>
        </div>

        <button
          type="button"
          id="verifyOtpBtn"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          style="width: 100%; margin-bottom: 0.85rem;"
          :disabled="isSubmitting"
          @click="handleVerifyOtp"
        >
          <span>{{ isSubmitting ? 'در حال بررسی...' : 'تأیید و ورود به پیشخوان' }}</span>
        </button>

        <button
          type="button"
          id="changePhoneBtn"
          class="dyf-btn dyf-btn-outline"
          style="width: 100%; font-size: 0.82rem;"
          @click="changePhone"
        >
          ویرایش شماره موبایل
        </button>
      </div>
    </div>
  </div>
</template>
