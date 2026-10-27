<template>
  <div class="dyf-auth-view">
    <div class="dyf-auth-card">
      <div class="dyf-auth-brand">
        <img src="/assets/images/logo.png" alt="لوگو برند DYF" class="dyf-auth-logo">
        <h1 class="dyf-auth-title">ورود به کاتالوگ خصوصی DYF</h1>
      </div>
      <p v-if="error" role="alert" class="dyf-auth-note">{{ error }}</p>
      <template v-if="token">
        <p class="dyf-auth-note">برای بررسی اعتبار لینک و مشاهده مدل‌های مجاز وارد شوید.</p>
        <button class="dyf-btn dyf-btn-primary" style="width: 100%" @click="enter">ورود به کاتالوگ</button>
      </template>
      <form v-else @submit.prevent="step === 'phone' ? sendCode() : verifyCode()">
        <p class="dyf-auth-note">{{ step === 'phone' ? 'شماره همراه ثبت‌شده خود را وارد کنید تا کد تأیید دریافت کنید.' : `کد تأیید ارسال‌شده به ${phone} را وارد کنید.` }}</p>
        <div v-if="step === 'phone'" class="dyf-form-group">
          <label for="customerPhone" class="dyf-form-label">شماره همراه مشتری</label>
          <input id="customerPhone" v-model="phone" type="tel" dir="ltr" maxlength="11" autocomplete="tel" class="dyf-input" placeholder="09xxxxxxxxx" :disabled="busy">
        </div>
        <template v-else>
          <OtpInput ref="otpInput" v-model="code" :has-error="!!error" @submit="verifyCode" />
          <div class="dyf-otp-timer-wrap">
            <span>اعتبار کد: {{ Math.floor(remaining / 60) }}:{{ String(remaining % 60).padStart(2, '0') }}</span>
            <button type="button" class="dyf-otp-resend" :disabled="busy || remaining > 0" @click="sendCode">ارسال مجدد</button>
          </div>
        </template>
        <button type="submit" :disabled="busy" class="dyf-btn dyf-btn-primary" style="width: 100%">{{ busy ? 'در حال بررسی…' : step === 'phone' ? 'دریافت کد تأیید' : 'تأیید و ورود به کاتالوگ' }}</button>
        <button v-if="step === 'otp'" type="button" class="dyf-btn dyf-btn-outline" style="width:100%; margin-top: .75rem" :disabled="busy" @click="step = 'phone'; error = ''; code = ''">ویرایش شماره همراه</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue';
import OtpInput from '../../components/OtpInput.vue';
import { api } from '../../shared/api.js';
import { formatPhoneNumberForApi } from '../../shared/utils/format.js';
defineProps({ links: Array, customers: Array });
const emit = defineEmits(['login-direct', 'login-customer', 'login-otp-link']);
const token = new URLSearchParams(window.location.search).get('token') || window.location.pathname.match(/^\/catalog\/([^/]+)\/?$/)?.[1];
const error = ref('');
const phone = ref(''), code = ref(''), step = ref('phone'), busy = ref(false), remaining = ref(0), otpInput = ref(null);
let timer;
function startCountdown(seconds) {
  clearInterval(timer);
  const expiresAt = Date.now() + seconds * 1000;
  remaining.value = seconds;
  timer = setInterval(() => {
    remaining.value = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    if (!remaining.value) clearInterval(timer);
  }, 1000);
}
async function sendCode() {
  if (busy.value) return;
  phone.value = formatPhoneNumberForApi(phone.value);
  error.value = '';
  if (!/^09\d{9}$/.test(phone.value)) { error.value = 'شماره همراه معتبر ۱۱ رقمی وارد کنید.'; return; }
  busy.value = true;
  try {
    const result = await api('/auth/customer/otp/send', { method: 'POST', auth: false, body: { phoneNumber: phone.value } });
    step.value = 'otp'; code.value = ''; startCountdown(result.expiresInSeconds);
    await nextTick(); otpInput.value?.focusFirst();
  } catch (issue) {
    error.value = issue.message;
    if (issue.status === 429) { step.value = 'otp'; startCountdown(120); }
  } finally { busy.value = false; }
}
async function verifyCode() {
  if (busy.value) return;
  error.value = '';
  if (code.value.length !== 5) { error.value = 'هر ۵ رقم کد تأیید را وارد کنید.'; return; }
  busy.value = true;
  try {
    const result = await api('/auth/customer/otp/verify', { method: 'POST', auth: false, body: { phoneNumber: phone.value, code: code.value } });
    clearInterval(timer);
    emit('login-direct', { token: result.token });
  } catch (issue) { error.value = issue.message; }
  finally { busy.value = false; }
}
onUnmounted(() => clearInterval(timer));
function enter() { emit('login-direct', { token }); }
</script>
