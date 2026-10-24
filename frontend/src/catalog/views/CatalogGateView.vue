<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogAccessStore } from '../stores/access';
import { useToast } from '@/admin/stores/toast';
import OtpModal from '../components/OtpModal.vue';

const router = useRouter();
const accessStore = useCatalogAccessStore();
const toast = useToast();

type GateAuthMode = 'otp' | 'passcode';

const authMode = ref<GateAuthMode>('otp');
const phone = ref('09121112233');
const phoneError = ref('');
const passcode = ref('');
const passcodeError = ref('');
const isSendingOtp = ref(false);
const isVerifyingPasscode = ref(false);
const isOtpModalOpen = ref(false);
const isUnlocked = ref(false);
const otpExpiresIn = ref(120);

onMounted(async () => {
  const resultStatus = await accessStore.initAccess();
  if (resultStatus === 'GRANTED') {
    if (accessStore.isDirect.value) {
      router.push('/grid');
    }
  } else if (resultStatus === 'EXPIRED') {
    router.push('/expired');
  }
});

function handleEnterDirect() {
  triggerUnlockAnimation(() => {
    router.push('/grid');
  });
}

function handlePhoneInput(e: Event) {
  const input = e.target as HTMLInputElement;
  const cleaned = input.value.replace(/\D/g, '').slice(0, 11);
  phone.value = cleaned;
  phoneError.value = '';
}

function handlePasscodeInput(e: Event) {
  const input = e.target as HTMLInputElement;
  passcode.value = input.value.trim();
  passcodeError.value = '';
}

async function handleSendOtp() {
  const cleanPhone = phone.value.trim();
  if (!/^09\d{9}$/.test(cleanPhone)) {
    phoneError.value = 'لطفاً شماره موبایل معتبر ۱۱ رقمی وارد نمایید (مانند 09121112233).';
    return;
  }
  phoneError.value = '';
  isSendingOtp.value = true;

  try {
    const res = await accessStore.sendOtp(cleanPhone);
    if (res.success) {
      otpExpiresIn.value = res.expiresInSeconds || 120;
      isOtpModalOpen.value = true;
      toast.success('کد تأیید به شماره شما ارسال شد.', 'ارسال پیامک');
    } else {
      phoneError.value = res.message || 'خطا در ارسال پیامک تأیید.';
      toast.error(phoneError.value, 'خطا');
    }
  } catch {
    phoneError.value = 'خطا در برقراری ارتباط با سرور.';
    toast.error(phoneError.value, 'خطا');
  } finally {
    isSendingOtp.value = false;
  }
}

async function handleVerifyPasscode() {
  const cleanPin = passcode.value.trim();
  if (!cleanPin) {
    passcodeError.value = 'لطفاً رمز عبور اختصاصی را وارد فرمایید.';
    return;
  }
  passcodeError.value = '';
  isVerifyingPasscode.value = true;

  try {
    const res = await accessStore.verifyPasscode(cleanPin);
    if (res.success) {
      toast.success('رمز عبور اختصاصی تأیید شد.', 'دسترسی مجاز');
      triggerUnlockAnimation(() => {
        router.push('/grid');
      });
    } else {
      passcodeError.value = res.message || 'رمز عبور وارد شده نادرست است.';
      toast.error(passcodeError.value, 'خطای رمز عبور');
    }
  } catch {
    passcodeError.value = 'خطا در برقراری ارتباط با سرور.';
    toast.error(passcodeError.value, 'خطا');
  } finally {
    isVerifyingPasscode.value = false;
  }
}

function handleOtpVerified() {
  isOtpModalOpen.value = false;
  triggerUnlockAnimation(() => {
    router.push('/grid');
  });
}

function triggerUnlockAnimation(callback: () => void) {
  isUnlocked.value = true;
  setTimeout(() => {
    callback();
  }, 900);
}
</script>

<template>
  <div class="dyf-auth-view" style="position: relative;">
    <!-- افکت بصری باشکوه باز شدن قفل کاتالوگ -->
    <transition name="dyf-unlock">
      <div
        v-if="isUnlocked"
        class="dyf-unlock-overlay"
        style="position: fixed; inset: 0; background: radial-gradient(circle at center, rgba(30, 24, 20, 0.98) 0%, rgba(12, 10, 9, 0.99) 100%); z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem;"
      >
        <div
          class="dyf-unlock-crest"
          style="width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle, rgba(212, 163, 89, 0.3) 0%, rgba(212, 163, 89, 0.05) 70%); border: 2.5px solid var(--gold-primary); display: flex; align-items: center; justify-content: center; color: var(--gold-light); margin-bottom: 1.5rem; box-shadow: 0 0 35px var(--gold-glow); animation: dyfPulseCrest 1s infinite alternate;"
        >
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style="font-family: var(--font-title); font-size: 1.6rem; font-weight: 900; color: var(--gold-light); margin-bottom: 0.6rem;">
          دسترسی VIP با موفقیت تایید شد
        </h2>
        <p style="font-size: 0.95rem; color: var(--text-ivory); margin: 0; line-height: 1.7; max-width: 480px;">
          خوش آمدید <strong v-if="accessStore.recipientName.value" style="color: var(--gold-light);">{{ accessStore.recipientName.value }}</strong>. در حال انتقال به آتلیه انحصاری کفش DYF...
        </p>
      </div>
    </transition>

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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" x2="19" y1="12" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <!-- درگاه ورود VIP با قابلیت انتخاب احراز هویت پیامکی یا Passcode (FE-020) -->
      <div v-else>
        <!-- سوئیچر روش ورود (OTP vs VIP Passcode) -->
        <div style="display: flex; background: rgba(0, 0, 0, 0.25); border-radius: var(--r-md); padding: 0.25rem; margin-bottom: 1.5rem; border: 1px solid var(--border-subtle);">
          <button
            type="button"
            class="dyf-btn dyf-btn-sm"
            :style="{
              flex: 1,
              justifyContent: 'center',
              background: authMode === 'otp' ? 'var(--gold-primary)' : 'transparent',
              color: authMode === 'otp' ? '#0c0a09' : 'var(--text-muted)',
              fontWeight: authMode === 'otp' ? '800' : '500',
              border: 'none',
              borderRadius: 'var(--r-sm)',
            }"
            @click="authMode = 'otp'"
          >
            تأیید هویت پیامکی
          </button>
          <button
            type="button"
            class="dyf-btn dyf-btn-sm"
            :style="{
              flex: 1,
              justifyContent: 'center',
              background: authMode === 'passcode' ? 'var(--gold-primary)' : 'transparent',
              color: authMode === 'passcode' ? '#0c0a09' : 'var(--text-muted)',
              fontWeight: authMode === 'passcode' ? '800' : '500',
              border: 'none',
              borderRadius: 'var(--r-sm)',
            }"
            @click="authMode = 'passcode'"
          >
            رمز عبور اختصاصی (PIN)
          </button>
        </div>

        <!-- حالت الف: ورود با پیامک تأیید مشتری (BE-GAP-02) -->
        <div v-if="authMode === 'otp'" class="dyf-auth-step">
          <p class="dyf-auth-note">
            جهت احراز هویت و بازگشایی کاتالوگ VIP، شماره موبایل ثبت‌شده خود را وارد فرمایید.
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
            <span>ارسال کد تأیید پیامکی</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>

        <!-- حالت ب: ورود با رمز عبور اختصاصی (VIP Passcode) -->
        <div v-else class="dyf-auth-step">
          <p class="dyf-auth-note">
            رمز عبور اختصاصی اعلام‌شده از سوی کارشناس فروش برند DYF را وارد نمایید.
          </p>

          <div class="dyf-form-group">
            <label for="catPasscodeInput" class="dyf-form-label dyf-form-label-required">رمز عبور / PIN امنیتی</label>
            <div class="dyf-input-wrap">
              <input
                id="catPasscodeInput"
                type="password"
                class="dyf-input"
                :class="{ 'dyf-input-error': passcodeError }"
                placeholder="••••"
                dir="ltr"
                maxlength="16"
                autocomplete="current-password"
                :value="passcode"
                @input="handlePasscodeInput"
                @keydown.enter="handleVerifyPasscode"
              >
            </div>
            <p v-if="passcodeError" class="dyf-form-hint" style="color: var(--status-danger);">{{ passcodeError }}</p>
            <p v-else class="dyf-form-hint">رمز آزمایشی پیش‌فرض: 1234 یا 12345</p>
          </div>

          <button
            type="button"
            class="dyf-btn dyf-btn-primary dyf-btn-lg"
            :class="{ 'is-loading': isVerifyingPasscode }"
            style="width: 100%; justify-content: center;"
            :disabled="isVerifyingPasscode"
            @click="handleVerifyPasscode"
          >
            <span>تأیید رمز عبور و باز کردن قفل</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- مودال مستقل OTP -->
    <OtpModal
      :is-open="isOtpModalOpen"
      :phone="phone"
      :expires-in-seconds="otpExpiresIn"
      :token="accessStore.token.value"
      @close="isOtpModalOpen = false"
      @change-phone="isOtpModalOpen = false"
      @verified="handleOtpVerified"
    />
  </div>
</template>

<style scoped>
@keyframes dyfPulseCrest {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 20px var(--gold-glow);
  }
  100% {
    transform: scale(1.05);
    box-shadow: 0 0 45px var(--gold-glow);
  }
}

.dyf-unlock-enter-active,
.dyf-unlock-leave-active {
  transition: opacity 0.4s ease;
}

.dyf-unlock-enter-from,
.dyf-unlock-leave-to {
  opacity: 0;
}
</style>
