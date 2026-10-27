<template>
  <div class="dyf-auth-view">
    <div class="dyf-auth-card">
      <div class="dyf-auth-brand">
        <img src="/assets/images/logo.png" alt="لوگو برند DYF" class="dyf-auth-logo">
        <h1 class="dyf-auth-title">ورود به کاتالوگ خصوصی DYF</h1>
      </div>
      <p v-if="error" role="alert" class="dyf-auth-note">{{ error }}</p>
      <template v-else-if="token">
        <p class="dyf-auth-note">برای بررسی اعتبار لینک و مشاهده مدل‌های مجاز وارد شوید.</p>
        <button class="dyf-btn dyf-btn-primary" style="width: 100%" @click="enter">ورود به کاتالوگ</button>
      </template>
      <p v-else class="dyf-auth-note">برای مشاهده محصولات، لینک اختصاصی خود را از مدیریت کارگاه دریافت کنید. ورود با شماره همراه هنوز فعال نشده است.</p>
      <a v-if="error" href="/catalog" class="dyf-btn dyf-btn-outline">بازگشت</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
defineProps({ links: Array, customers: Array });
const emit = defineEmits(['login-direct', 'login-customer', 'login-otp-link']);
const token = new URLSearchParams(window.location.search).get('token') || window.location.pathname.match(/^\/catalog\/([^/]+)\/?$/)?.[1];
const error = ref('');
function enter() { emit('login-direct', { token }); }
</script>
