<template>
  <div id="catLoginView" class="dyf-auth-view">
    <div class="dyf-auth-card">
      <div class="dyf-auth-brand">
        <img src="/assets/images/logo.png" alt="لوگو برند DYF" class="dyf-auth-logo" />
        <h1 class="dyf-auth-title" id="catLoginHeaderTitle">ورود به کاتالوگ خصوصی DYF</h1>
        <p v-if="headerSubtitle" class="dyf-auth-subtitle" id="catLoginHeaderSub">
          {{ headerSubtitle }}
        </p>
      </div>

      <!-- کارت خطا برای لینک‌های باطل‌شده / منقضی / نامعتبر -->
      <div
        v-if="tokenError"
        id="catTokenErrorBox"
        style="display: block; background: rgba(224, 86, 74, 0.12); border: 1px solid rgba(224, 86, 74, 0.35); border-radius: var(--r-md); padding: 1.25rem; margin-bottom: 1.5rem; text-align: right;"
      >
        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--status-danger); font-weight: 800; font-size: 0.95rem; margin-bottom: 0.35rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12.01" y1="16" x2="12.01" y2="16" />
          </svg>
          <span id="catTokenErrorTitle">{{ tokenError.title }}</span>
        </div>
        <p id="catTokenErrorDesc" style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
          {{ tokenError.desc }}
        </p>
        <div style="margin-top: 1rem; text-align: center;">
          <a href="/catalog" class="dyf-btn dyf-btn-outline dyf-btn-sm">
            ورود مستقیم همکاران با شماره همراه
          </a>
        </div>
      </div>

      <!-- مرحله اول: ورود شماره موبایل -->
      <div
        v-if="!tokenError && currentStep === 'phone' && !pendingDirectLink"
        id="authStepPhone"
        class="dyf-auth-step"
      >
        <p class="dyf-auth-note">
          جهت ورود به کاتالوگ، شماره موبایل ثبت‌شده خود را وارد نمایید تا کد تأیید ارسال گردد.
        </p>

        <div class="dyf-form-group">
          <label for="catPhoneInput" class="dyf-form-label dyf-form-label-required" id="catPhoneInputLabel">
            {{ phoneInputLabel }}
          </label>
          <div class="dyf-input-wrap">
            <input
              id="catPhoneInput"
              v-model="phoneInput"
              type="tel"
              class="dyf-input"
              :class="{ 'dyf-input-error': phoneInputError }"
              placeholder="09121112233"
              dir="ltr"
              maxlength="11"
              autocomplete="tel"
              @input="handlePhoneInput"
              @keydown.enter="handleSendPhone"
            />
          </div>
          <p class="dyf-form-hint" id="catPhoneHintText">شماره باید با ۰۹ آغاز شده و ۱۱ رقم باشد.</p>
        </div>

        <button
          type="button"
          id="catSendOtpBtn"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          :class="{ 'is-loading': isSendingOtp }"
          style="width: 100%;"
          @click="handleSendPhone"
        >
          <span>ارسال کد تأیید یک‌بارمصرف</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      <!-- مرحله دوم: ورود کد ۵ رقمی OTP -->
      <div
        v-if="!tokenError && currentStep === 'otp' && !pendingDirectLink"
        id="authStepOtp"
        class="dyf-auth-step"
      >
        <p class="dyf-auth-note">
          کد تأیید ۵ رقمی به شماره
          <span id="catOtpPhoneDisplay" class="dyf-auth-phone-display">{{ verifiedPhone }}</span>
          پیامک شد.
        </p>

        <OtpInput
          ref="otpInputComponentRef"
          v-model="otpCode"
          :has-error="otpError"
          @submit="handleVerifyOtp"
        />

        <div class="dyf-otp-timer-wrap">
          <div>
            زمان اعتبار کد:
            <span id="catOtpCountdown" class="dyf-otp-timer">{{ formattedOtpCountdown }}</span>
          </div>
          <button
            type="button"
            id="catResendOtpBtn"
            class="dyf-otp-resend"
            :disabled="otpTimeLeft > 0"
            @click="handleResendOtp"
          >
            {{ otpTimeLeft > 0 ? 'ارسال مجدد کد' : 'ارسال مجدد کد تأیید' }}
          </button>
        </div>

        <button
          type="button"
          id="catVerifyOtpBtn"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          :class="{ 'is-loading': isVerifyingOtp }"
          style="width: 100%; margin-bottom: 0.85rem;"
          @click="handleVerifyOtp"
        >
          <span>تأیید و ورود به کاتالوگ</span>
        </button>

        <button
          type="button"
          id="catChangePhoneBtn"
          class="dyf-btn dyf-btn-outline"
          style="width: 100%; font-size: 0.82rem;"
          @click="handleChangePhone"
        >
          ویرایش شماره موبایل
        </button>
      </div>

      <!-- دکمه ورود فوری برای لینک مستقیم بدون رمز -->
      <div
        v-if="!tokenError && pendingDirectLink"
        id="catDirectLinkEntryBox"
        style="display: block; padding-top: 0.5rem;"
      >
        <div style="background: rgba(76, 217, 100, 0.1); border: 1px solid rgba(76, 217, 100, 0.3); border-radius: var(--r-md); padding: 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #4cd964; line-height: 1.6; text-align: right;">
          🛡️ <strong>دسترسی مجاز مستقیم:</strong> شما از طریق لینک اختصاصی معتبر وارد شده‌اید و نیازی به وارد کردن شماره تلفن یا رمز پیامکی ندارید.
        </div>
        <button
          type="button"
          id="catDirectEnterBtn"
          class="dyf-btn dyf-btn-primary dyf-btn-lg"
          style="width: 100%; justify-content: center;"
          @click="handleDirectEnter"
        >
          <span>ورود مستقیم به کاتالوگ</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import OtpInput from '../../components/OtpInput.vue';
import { toEnglishDigits } from '../../shared/utils/format.js';
import { useToast } from '../../composables/useToast.js';

const props = defineProps({
  links: {
    type: Array,
    default: () => [],
  },
  customers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['login-direct', 'login-customer', 'login-otp-link']);

const { showToast } = useToast();

const currentStep = ref('phone');
const headerSubtitle = ref('');
const tokenError = ref(null);
const pendingDirectLink = ref(null);
const pendingOtpLink = ref(null);
const authenticatedCustomer = ref(null);

const phoneInput = ref('09121112233');
const phoneInputLabel = ref('شماره تلفن همراه');
const phoneInputError = ref(false);
const isSendingOtp = ref(false);

const verifiedPhone = ref('');
const otpCode = ref('');
const otpError = ref(false);
const isVerifyingOtp = ref(false);
const otpTimeLeft = ref(60);
const otpInterval = ref(null);
const testCode = '12345';
const otpInputComponentRef = ref(null);

const formattedOtpCountdown = computed(() => {
  const mins = Math.floor(otpTimeLeft.value / 60);
  const secs = otpTimeLeft.value % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
});

function handlePhoneInput() {
  phoneInput.value = toEnglishDigits(phoneInput.value).replace(/\D/g, '');
  if (phoneInputError.value) {
    phoneInputError.value = false;
  }
}

function startOtpTimer() {
  stopOtpTimer();
  otpTimeLeft.value = 60;
  otpInterval.value = setInterval(() => {
    otpTimeLeft.value -= 1;
    if (otpTimeLeft.value <= 0) {
      stopOtpTimer();
    }
  }, 1000);
}

function stopOtpTimer() {
  if (otpInterval.value) {
    clearInterval(otpInterval.value);
    otpInterval.value = null;
  }
}

function handleResendOtp() {
  startOtpTimer();
  showToast({
    type: 'info',
    title: 'ارسال مجدد کد',
    message: 'کد ۵ رقمی تأیید مجدداً به شماره شما ارسال شد.',
  });
}

function handleChangePhone() {
  currentStep.value = 'phone';
  stopOtpTimer();
}

function handleSendPhone() {
  const phone = toEnglishDigits(phoneInput.value.trim()).replace(/\D/g, '');
  phoneInput.value = phone;

  const phoneRegex = /^09[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    phoneInputError.value = true;
    showToast({
      type: 'error',
      title: 'شماره نامعتبر',
      message: 'لطفاً یک شماره موبایل معتبر ۱۱ رقمی (مثال: 09121112233) وارد کنید.',
    });
    return;
  }

  phoneInputError.value = false;

  if (pendingOtpLink.value) {
    if (pendingOtpLink.value.phone && pendingOtpLink.value.phone !== phone) {
      showToast({
        type: 'error',
        title: 'شماره تلفن غیرمجاز',
        message: 'شماره واردشده با شماره مجاز تعریف‌شده برای این لینک اختصاصی مطابقت ندارد.',
      });
      return;
    }
    verifiedPhone.value = phone;
  } else {
    let customer = props.customers.find((c) => c.phone === phone);
    if (!customer) {
      customer = {
        id: 101,
        code: 'CUST-101',
        nameFa: 'همکار گرامی',
        nameEn: 'Valued Partner',
        phone: phone,
        status: 'active',
        directAccess: {
          enabled: true,
          categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز', 'لاین اسپرت و کژوال'],
          addModels: [],
          excludeModels: [],
          duration: 'unlimited',
          deadline: 'none',
        },
      };
    }

    if (customer.status !== 'active') {
      showToast({
        type: 'error',
        title: 'حساب مسدود است',
        message: 'حساب کاربری شما موقتاً غیرفعال شده است. لطفاً با دفتر کارگاه تماس حاصل فرمایید.',
      });
      return;
    }

    authenticatedCustomer.value = customer;
    verifiedPhone.value = phone;
  }

  isSendingOtp.value = true;

  setTimeout(() => {
    isSendingOtp.value = false;
    currentStep.value = 'otp';
    otpCode.value = '';
    otpError.value = false;
    startOtpTimer();
    nextTick(() => {
      otpInputComponentRef.value?.focusFirst();
    });

    showToast({
      type: 'success',
      title: 'کد تأیید ارسال شد',
      message: 'کد ۵ رقمی تأیید برای شماره شما ارسال شد.',
      duration: 3500,
    });
  }, 500);
}

function handleVerifyOtp() {
  const code = toEnglishDigits(otpCode.value).replace(/\D/g, '').trim();

  if (code.length < 5) {
    showToast({
      type: 'warning',
      title: 'کد ناقص است',
      message: 'لطفاً هر ۵ رقم کد تأیید را وارد کنید.',
    });
    return;
  }

  isVerifyingOtp.value = true;

  setTimeout(() => {
    isVerifyingOtp.value = false;

    if (code === testCode) {
      stopOtpTimer();
      showToast({
        type: 'success',
        title: 'احراز هویت موفق',
        message: 'خوش آمدید! در حال انتقال به کاتالوگ خصوصی DYF...',
        duration: 2000,
      });

      setTimeout(() => {
        if (pendingOtpLink.value) {
          emit('login-otp-link', pendingOtpLink.value);
        } else if (authenticatedCustomer.value) {
          emit('login-customer', authenticatedCustomer.value);
        }
      }, 400);
    } else {
      otpError.value = true;
      showToast({
        type: 'error',
        title: 'کد تأیید نادرست است',
        message: `کد واردشده نامعتبر است. کد صحیح آزمایشی: ${testCode}`,
      });

      setTimeout(() => {
        otpError.value = false;
      }, 1500);
    }
  }, 500);
}

function handleDirectEnter() {
  if (pendingDirectLink.value) {
    emit('login-direct', pendingDirectLink.value);
  }
}

function handleRouting() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    currentStep.value = 'phone';
    return;
  }

  const link = props.links.find((l) => l.token === token || l.id === token);
  if (!link) {
    tokenError.value = {
      title: 'لینک اختصاصی نامعتبر است',
      desc: 'توکن درج‌شده در نشانی وب یافت نشد یا تغییر یافته است. لطفاً لینک صحیح را مجدداً وارد فرمایید.',
    };
    return;
  }

  if (link.status === 'expired' || link.status === 'deactivated') {
    const desc =
      link.reason ||
      (link.status === 'expired'
        ? 'مهلت آغازین ورود برای این لینک به پایان رسیده است.'
        : 'این لینک توسط مدیریت کارگاه غیرفعال شده است.');
    tokenError.value = {
      title: 'اعتبار لینک به پایان رسیده است',
      desc,
    };
    return;
  }

  if (link.authType === 'direct') {
    pendingDirectLink.value = link;
  } else {
    pendingOtpLink.value = link;
    phoneInputLabel.value = `شماره تلفن همراه همکار (${link.recipientFa})`;
    if (link.phone) {
      phoneInput.value = link.phone;
    }
    currentStep.value = 'phone';
  }
}

watch(
  () => props.links,
  (newLinks) => {
    if (newLinks && newLinks.length > 0) {
      handleRouting();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.links && props.links.length > 0) {
    handleRouting();
  }
});

onUnmounted(() => {
  stopOtpTimer();
});
</script>
