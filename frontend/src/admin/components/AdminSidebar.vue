<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = defineProps<{
  isOpen: boolean;
  counts?: {
    shoes?: number;
    categories?: number;
    customers?: number;
    links?: number;
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const authStore = useAuthStore();

const adminDisplayName = computed(() => {
  const user = authStore.adminUser.value;
  if (user && user.firstName) {
    return `${user.firstName} ${user.lastName || ''}`.trim();
  }
  return 'مهدی مالوندی';
});

async function handleLogout() {
  await authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <!-- لایه تاریک پشت سایدبار در موبایل -->
  <div
    class="dyf-sidebar-overlay"
    :class="{ 'is-active': isOpen }"
    aria-hidden="true"
    @click="emit('close')"
  ></div>

  <!-- سایدبار ناوبری راست‌چین -->
  <aside class="dyf-admin-sidebar" :class="{ 'is-open': isOpen }">
    <!-- هدر سایدبار -->
    <div class="dyf-sidebar-header">
      <div style="display: flex; align-items: center; gap: 0.85rem;">
        <img src="/assets/images/logo.png" alt="لوگو برند DYF" class="dyf-sidebar-logo" />
        <div>
          <div class="dyf-sidebar-brand-name">DYF</div>
          <div class="dyf-sidebar-badge">مدیریت کاتالوگ</div>
        </div>
      </div>
    </div>

    <!-- منوی ناوبری -->
    <nav class="dyf-sidebar-nav" aria-label="منوی اصلی پنل">
      <div class="dyf-nav-section-label">پیشخوان و نظارت</div>

      <router-link
        to="/dashboard"
        class="dyf-nav-item"
        active-class="is-active"
        @click="emit('close')"
      >
        <div class="dyf-nav-left">
          <svg class="dyf-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          <span>داشبورد</span>
        </div>
      </router-link>

      <div class="dyf-nav-section-label">محصولات و دسته‌ها</div>

      <router-link
        to="/shoes"
        class="dyf-nav-item"
        active-class="is-active"
        @click="emit('close')"
      >
        <div class="dyf-nav-left">
          <svg class="dyf-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 18h16" />
            <path d="M4 14l3-6 4 2 5-4 4 8H4z" />
          </svg>
          <span>مدل‌های کفش</span>
        </div>
        <span v-if="counts?.shoes !== undefined" class="dyf-nav-counter">{{ counts.shoes }}</span>
      </router-link>

      <router-link
        to="/categories"
        class="dyf-nav-item"
        active-class="is-active"
        @click="emit('close')"
      >
        <div class="dyf-nav-left">
          <svg class="dyf-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>دسته‌بندی‌ها</span>
        </div>
        <span v-if="counts?.categories !== undefined" class="dyf-nav-counter">{{ counts.categories }}</span>
      </router-link>

      <div class="dyf-nav-section-label">دسترسی و مشتریان</div>

      <router-link
        to="/customers"
        class="dyf-nav-item"
        active-class="is-active"
        @click="emit('close')"
      >
        <div class="dyf-nav-left">
          <svg class="dyf-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>مشتریان و بنکداران</span>
        </div>
        <span v-if="counts?.customers !== undefined" class="dyf-nav-counter">{{ counts.customers }}</span>
      </router-link>

      <router-link
        to="/access-links"
        class="dyf-nav-item"
        active-class="is-active"
        @click="emit('close')"
      >
        <div class="dyf-nav-left">
          <svg class="dyf-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>لینک‌های اختصاصی</span>
        </div>
        <span v-if="counts?.links !== undefined" class="dyf-nav-counter">{{ counts.links }}</span>
      </router-link>

      <div class="dyf-nav-section-label">مشاهده کاتالوگ</div>

      <a
        href="catalog.html"
        target="_blank"
        class="dyf-nav-item"
        style="color: var(--gold-light);"
        rel="noopener noreferrer"
      >
        <div class="dyf-nav-left">
          <svg class="dyf-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
          <span>کاتالوگ مشتری (زنده)</span>
        </div>
        <span class="dyf-badge dyf-badge-published" style="font-size: 0.65rem;">B2B</span>
      </a>
    </nav>

    <!-- پروفایل و دکمه خروج در پایین سایدبار -->
    <div class="dyf-sidebar-footer">
      <div class="dyf-admin-name" style="font-weight: 700; color: var(--text-ivory); font-size: 0.92rem;">
        {{ adminDisplayName }}
      </div>
      <button
        type="button"
        class="dyf-btn dyf-btn-outline dyf-btn-sm js-admin-logout"
        title="خروج از حساب"
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
  </aside>
</template>
