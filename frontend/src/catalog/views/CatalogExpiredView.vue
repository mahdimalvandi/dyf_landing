<script setup lang="ts">
import { useCatalogAccessStore } from '../stores/access';

const accessStore = useCatalogAccessStore();

function handleRetry() {
  accessStore.clearSession();
  window.location.href = 'catalog.html';
}
</script>

<template>
  <div id="catExpiredView" class="dyf-cat-lock-screen">
    <div class="dyf-cat-lock-box">
      <div class="dyf-cat-lock-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2 id="catExpiredTitle" style="font-family: var(--font-title); font-size: 1.35rem; font-weight: 900; color: var(--text-ivory); margin-bottom: 0.5rem;">
        {{ accessStore.errorTitle.value || 'زمان مشاهده کاتالوگ به پایان رسید' }}
      </h2>

      <p id="catExpiredDesc" style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.65; margin-bottom: 1.75rem;">
        {{ accessStore.errorMessage.value || 'مدت زمان مجاز برای نشست شما منقضی گردید. جهت تمدید مهلت دسترسی یا استعلام پیش‌فاکتور با مدیریت کارگاه DYF ارتباط برقرار نمایید.' }}
      </p>

      <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
        <button type="button" class="dyf-btn dyf-btn-primary" @click="handleRetry">
          <span>ورود مجدد به سامانه</span>
        </button>
        <a href="index.html" class="dyf-btn dyf-btn-outline">
          <span>بازگشت به سایت اصلی</span>
        </a>
      </div>
    </div>
  </div>
</template>
