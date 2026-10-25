<template>
  <header class="dyf-cat-navbar">
    <div class="dyf-cat-nav-main">
      <div class="dyf-cat-brand-bar">
        <a href="/catalog" class="dyf-cat-brand-link">
          <img src="/assets/images/logo.png" alt="DYF" class="dyf-cat-logo" />
          <span class="dyf-cat-brand-title">کاتالوگ خصوصی DYF</span>
        </a>
      </div>

      <div class="dyf-cat-nav-actions">
        <div
          id="catSessionTimerPill"
          class="dyf-cat-timer-pill"
          :class="{ 'is-warning': isWarning && !isUnlimited }"
          style="display: inline-flex;"
        >
          <template v-if="isUnlimited">
            <span>دسترسی نامحدود</span>
          </template>
          <template v-else>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span><strong id="catCountdownDisplay">{{ formattedTime }}</strong></span>
          </template>
        </div>

        <button
          type="button"
          id="catLogoutBtnMobile"
          class="dyf-btn dyf-btn-outline dyf-btn-sm dyf-cat-logout-btn dyf-cat-logout-mobile"
          title="خروج از حساب کاتالوگ"
          @click="$emit('logout')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          <span>خروج</span>
        </button>
      </div>
    </div>

    <div class="dyf-cat-user-strip">
      <div class="dyf-cat-user-info">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-primary); flex-shrink: 0;">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span id="catRecipientGreetingName" class="dyf-cat-recipient-name">{{ cleanRecipientName }}</span>
      </div>

      <button
        type="button"
        id="catLogoutBtnDesktop"
        class="dyf-btn dyf-btn-outline dyf-btn-sm dyf-cat-logout-btn dyf-cat-logout-desktop"
        title="خروج از حساب کاتالوگ"
        @click="$emit('logout')"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
        <span>خروج</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  session: {
    type: Object,
    default: null,
  },
  formattedTime: {
    type: String,
    default: '۱۵:۰۰',
  },
  isWarning: {
    type: Boolean,
    default: false,
  },
  isUnlimited: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['logout']);

const cleanRecipientName = computed(() => {
  const raw = props.session?.recipientFa || 'همکار گرامی';
  return raw.replace(/\(.*?\)/g, '').trim() || 'همکار گرامی';
});
</script>
