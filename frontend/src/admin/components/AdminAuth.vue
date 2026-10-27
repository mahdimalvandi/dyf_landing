<template>
  <div id="authView" class="dyf-auth-view">
    <div class="dyf-auth-card">
      <div class="dyf-auth-brand">
        <img src="/assets/images/logo.png" alt="لوگو برند DYF" class="dyf-auth-logo">
        <h1 class="dyf-auth-title">ورود به پنل مدیریت</h1>
        <p class="dyf-auth-subtitle">کاتالوگ خصوصی محصولات چرمی کارگاه DYF</p>
      </div>

      <p v-if="errorMessage" role="alert" style="color: #e8a49a; margin-bottom: 1rem;">{{ errorMessage }}</p>
      <!-- مرحله اول: ورود شماره موبایل -->
      <div id="authStepPhone" class="dyf-auth-step" :class="{ 'is-hidden': step !== 'phone' }">
        <p class="dyf-auth-note">
          جهت ورود به پنل مدیریت، شماره موبایل ثبت‌شده خود را وارد نمایید تا کد تأیید ارسال گردد.
        </p>

        <div class="dyf-form-group">
          <label for="adminPhoneInput" class="dyf-form-label dyf-form-label-required">شماره تلفن همراه مدیر</label>
          <div class="dyf-input-wrap">
            <input 
              type="tel" 
              id="adminPhoneInput" 
              v-model="phone"
              class="dyf-input" 
              placeholder="09121234567" 
              dir="ltr" 
              maxlength="11" 
              autocomplete="tel"
              @input="onPhoneInput"
              @keydown.enter="handleSendPhone"
            >
          </div>
          <p class="dyf-form-hint">شماره باید با ۰۹ آغاز شده و ۱۱ رقم باشد.</p>
        </div>

        <button type="button" id="sendOtpBtn" :disabled="busy" class="dyf-btn dyf-btn-primary dyf-btn-lg" style="width: 100%;" @click="handleSendPhone">
          <span>ارسال کد تأیید یک‌بارمصرف</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>

      <!-- مرحله دوم: ورود کد ۵ رقمی OTP -->
      <div id="authStepOtp" class="dyf-auth-step" :class="{ 'is-hidden': step !== 'otp' }">
        <p class="dyf-auth-note">
          کد تأیید ۵ رقمی به شماره <span id="otpPhoneDisplay" class="dyf-auth-phone-display">{{ phone }}</span> پیامک شد.
        </p>

        <div class="dyf-otp-grid">
          <input 
            v-for="(digit, idx) in otpDigits" 
            :key="idx"
            :id="'adminOtpDigit' + idx"
            :name="'adminOtpDigit' + idx"
            :aria-label="'رقم ' + (idx + 1) + ' کد تأیید'"
            :ref="el => digitRefs[idx] = el"
            v-model="otpDigits[idx]"
            type="text" 
            maxlength="1" 
            inputmode="numeric" 
            class="dyf-otp-digit" 
            :class="{ 'is-filled': !!otpDigits[idx] }"
            :autocomplete="idx === 0 ? 'one-time-code' : 'off'"
            @input="onDigitInput($event, idx)"
            @keydown="onDigitKeydown($event, idx)"
            @paste="onDigitPaste"
          >
        </div>

        <div class="dyf-otp-timer-wrap">
          <div>زمان اعتبار کد: <span id="otpCountdown" class="dyf-otp-timer">{{ formattedTimer }}</span></div>
          <button type="button" id="resendOtpBtn" class="dyf-otp-resend" :disabled="timeLeft > 0" @click="handleResendOtp">ارسال مجدد کد</button>
        </div>

        <button type="button" id="verifyOtpBtn" :disabled="busy" class="dyf-btn dyf-btn-primary dyf-btn-lg" style="width: 100%; margin-bottom: 0.85rem;" @click="handleVerifyOtp">
          <span>تأیید و ورود به پیشخوان</span>
        </button>

        <button type="button" id="changePhoneBtn" class="dyf-btn dyf-btn-outline" style="width: 100%; font-size: 0.82rem;" @click="changePhone">
          ویرایش شماره موبایل
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { api, setToken } from '../../shared/api.js';

const emit = defineEmits(['login-success']);

const step = ref('phone');
const phone = ref('');
const errorMessage = ref('');
const busy = ref(false);
let expiresInSeconds = 120;
const otpDigits = ref(['', '', '', '', '']);
const digitRefs = ref([]);
const timeLeft = ref(60);
let timerInterval = null;

const toEnglishDigits = (str) => {
  if (!str) return '';
  return str.replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
    .replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
};

const formattedTimer = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
});

const onPhoneInput = (e) => {
  phone.value = toEnglishDigits(e.target.value).replace(/\D/g, '');
};

const handleSendPhone = async () => {
  if (busy.value) return;
  errorMessage.value = '';
  const cleanPhone = toEnglishDigits(phone.value).replace(/\D/g, '');
  if (!cleanPhone || !cleanPhone.match(/^09\d{9}$/)) {
    alert('شماره تلفن همراه معتبر نیست. لطفاً یک شماره ۱۱ رقمی با فرمت ۰۹ وارد فرمایید.');
    return;
  }
  busy.value = true;
  try {
  const result = await api('/auth/admin/otp/send', { method: 'POST', auth: false, body: { phoneNumber: cleanPhone } });
  expiresInSeconds = result.expiresInSeconds;
  phone.value = cleanPhone;
  otpDigits.value = ['', '', '', '', ''];
  step.value = 'otp';
  startTimer();
  nextTick(() => {
    if (digitRefs.value[0]) {
      digitRefs.value[0].focus();
    }
  });
  } catch (error) {
    errorMessage.value = error.message;
    if (error.status === 429) {
      phone.value = cleanPhone;
      step.value = 'otp';
      startTimer();
    }
  }
  finally { busy.value = false; }
};

const changePhone = () => {
  step.value = 'phone';
  stopTimer();
  otpDigits.value = ['', '', '', '', ''];
};

const startTimer = () => {
  stopTimer();
  timeLeft.value = expiresInSeconds;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      stopTimer();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const handleResendOtp = () => {
  if (timeLeft.value > 0) return;
  handleSendPhone();
};

const onDigitInput = (e, idx) => {
  const raw = toEnglishDigits(e.target.value).replace(/\D/g, '');
  otpDigits.value[idx] = raw ? raw.slice(-1) : '';
  if (otpDigits.value[idx] && idx < 4) {
    nextTick(() => {
      if (digitRefs.value[idx + 1]) digitRefs.value[idx + 1].focus();
    });
  }
};

const onDigitKeydown = (e, idx) => {
  if (e.key === 'Backspace' && !otpDigits.value[idx] && idx > 0) {
    if (digitRefs.value[idx - 1]) digitRefs.value[idx - 1].focus();
  } else if (e.key === 'Enter') {
    handleVerifyOtp();
  }
};

const onDigitPaste = (e) => {
  e.preventDefault();
  const raw = (e.clipboardData || window.clipboardData).getData('text').trim();
  const pasteData = toEnglishDigits(raw).replace(/\D/g, '');
  if (pasteData.length >= 5) {
    pasteData.slice(0, 5).split('').forEach((char, i) => {
      otpDigits.value[i] = char;
    });
    if (digitRefs.value[4]) digitRefs.value[4].focus();
  }
};

const handleVerifyOtp = async () => {
  if (busy.value) return;
  errorMessage.value = '';
  const code = otpDigits.value.join('');
  if (code.length < 5) {
    alert('لطفاً تمام ۵ رقم کد یک‌بارمصرف را وارد نمایید.');
    return;
  }
  busy.value = true;
  try {
    const result = await api('/auth/admin/otp/verify', { method: 'POST', auth: false, body: { phoneNumber: phone.value, code } });
    setToken(result.token);
    stopTimer();
    emit('login-success');
  } catch (error) { errorMessage.value = error.message; }
  finally { busy.value = false; }
};

onUnmounted(() => {
  stopTimer();
});
</script>
