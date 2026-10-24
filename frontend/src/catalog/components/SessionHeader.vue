<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogAccessStore } from '../stores/access';

const router = useRouter();
const accessStore = useCatalogAccessStore();

const isWarning = computed(() => {
  return accessStore.remainingSeconds.value > 0 && accessStore.remainingSeconds.value <= 300;
});

function handleLogout() {
  accessStore.logout();
  router.push('/gate');
}
</script>

<template>
  <!-- نوار چسبان ناوبری آتلیه مطابق ۱۰۰٪ کاتالوگ legacy -->
  <header class="dyf-cat-navbar">
    <div class="dyf-cat-nav-main">
      <div class="dyf-cat-brand-bar">
        <a href="catalog.html" class="dyf-cat-brand-link">
          <img src="/assets/images/logo.png" alt="DYF" class="dyf-cat-logo">
          <span class="dyf-cat-brand-title">کاتالوگ خصوصی DYF</span>
        </a>
      </div>

      <div class="dyf-cat-nav-actions">
        <!-- تایمر شمارش معکوس نشست -->
        <div
          id="catSessionTimerPill"
          class="dyf-cat-timer-pill"
          :class="{ 'is-warning': isWarning }"
          :style="{ display: accessStore.remainingSeconds.value > 0 ? 'inline-flex' : 'none' }"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span><strong id="catCountdownDisplay">{{ accessStore.formattedTimer.value }}</strong></span>
        </div>

        <!-- دکمه خروج (مخصوص موبایل در ردیف بالا) -->
        <button
          id="catLogoutBtnMobile"
          type="button"
          class="dyf-btn dyf-btn-outline dyf-btn-sm dyf-cat-logout-btn dyf-cat-logout-mobile"
          title="خروج از حساب کاتالوگ"
          @click="handleLogout"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>خروج</span>
        </button>
      </div>
    </div>

    <!-- نوار مشخصات همکار (نام مشتری و دکمه خروج در دسکتاپ) -->
    <div class="dyf-cat-user-strip">
      <div class="dyf-cat-user-info">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-primary); flex-shrink: 0;">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span id="catRecipientGreetingName" class="dyf-cat-recipient-name">
          {{ accessStore.recipientName.value || 'همکار گرامی' }}
        </span>
      </div>

      <!-- دکمه خروج در دسکتاپ -->
      <button
        id="catLogoutBtnDesktop"
        type="button"
        class="dyf-btn dyf-btn-outline dyf-btn-sm dyf-cat-logout-btn dyf-cat-logout-desktop"
        title="خروج از حساب کاتالوگ"
        @click="handleLogout"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>خروج</span>
      </button>
    </div>
  </header>
</template>
