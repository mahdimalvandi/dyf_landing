<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCatalogAccessStore } from '../stores/access';

const router = useRouter();
const accessStore = useCatalogAccessStore();

function handleLogout() {
  accessStore.logout();
  router.push('/gate');
}
</script>

<template>
  <div style="min-height: 100vh; display: flex; flex-direction: column;">
    <!-- نوار ناوبری کاتالوگ VIP -->
    <header class="dyf-cat-navbar">
      <div class="dyf-cat-nav-main">
        <div class="dyf-cat-brand-bar">
          <router-link to="/grid" class="dyf-cat-brand-link">
            <img src="/assets/images/logo.png" alt="DYF" class="dyf-cat-logo">
            <span class="dyf-cat-brand-title">کاتالوگ خصوصی DYF</span>
          </router-link>
        </div>

        <div class="dyf-cat-nav-actions">
          <!-- تایمر شمارش معکوس نشست -->
          <div
            v-if="accessStore.remainingSeconds.value > 0"
            class="dyf-cat-timer-pill"
            :class="{ 'is-warning': accessStore.remainingSeconds.value < 300 }"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span><strong>{{ accessStore.formattedTimer.value }}</strong></span>
          </div>

          <!-- دکمه خروج موبایل -->
          <button
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

      <!-- مشخصات همکار در دسکتاپ -->
      <div class="dyf-cat-user-strip">
        <div class="dyf-cat-user-info">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-primary); flex-shrink: 0;">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span class="dyf-cat-recipient-name">{{ accessStore.recipientName.value || 'همکار گرامی' }}</span>
        </div>
        <button
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

    <!-- ناحیه اصلی کاتالوگ -->
    <main style="flex: 1; padding: 2rem 1.5rem; max-width: 1400px; margin: 0 auto; width: 100%;">
      <div style="text-align: center; padding: 3rem 1rem;">
        <h2 style="font-family: var(--font-title); font-size: 1.5rem; color: var(--gold-light); margin-bottom: 0.5rem;">
          کلکسیون اختصاصی محصولات DYF
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 600px; margin: 0 auto;">
          خوش آمدید. مدل‌های کفش مجاز بر اساس پیوند دسترسی شما در حال آماده‌سازی برای نمایش می‌باشد.
        </p>
      </div>
    </main>

    <!-- فوتر آتلیه -->
    <footer style="background: rgba(15, 13, 11, 0.95); border-top: 1px solid var(--border-subtle); padding: 2rem 1.5rem; text-align: center; font-size: 0.8rem; color: var(--text-dim);">
      <p style="margin-bottom: 0.5rem; color: var(--gold-light); font-weight: 700;">
        تولیدی کفش چرم طبیعی DYF (Defender Your Foot)
      </p>
      <p style="margin: 0;">
        کلیه حقوق معنوی طرح‌ها و مدل‌های انحصاری این کاتالوگ محفوظ و مختص همکاران مجاز می‌باشد.
      </p>
    </footer>
  </div>
</template>
