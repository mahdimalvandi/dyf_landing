<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineEmits<{
  (e: 'toggleSidebar'): void;
}>();

const route = useRoute();

const activeBreadcrumb = computed(() => {
  return (route.meta.breadcrumb as string) || (route.meta.title as string) || 'داشبورد';
});
</script>

<template>
  <header class="dyf-admin-header">
    <div class="dyf-header-right">
      <!-- دکمه همبرگری موبایل -->
      <button
        type="button"
        id="hamburgerToggle"
        class="dyf-hamburger-toggle"
        aria-label="باز کردن منو"
        @click="$emit('toggleSidebar')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      <!-- مسیر موقعیت کاربر (Breadcrumbs) -->
      <nav class="dyf-breadcrumbs" aria-label="مسیر جاری">
        <router-link to="/dashboard" class="dyf-breadcrumb-root">پنل مدیریت DYF</router-link>
        <span class="dyf-breadcrumb-sep">/</span>
        <span id="dyfBreadcrumbActive" class="dyf-breadcrumb-active">{{ activeBreadcrumb }}</span>
      </nav>
    </div>

    <div class="dyf-header-left">
      <!-- دکمه رفتن به سایت عمومی لندینگ -->
      <a
        href="index.html"
        target="_blank"
        class="dyf-icon-btn dyf-header-landing-btn"
        title="مشاهده وب‌سایت عمومی DYF"
        rel="noopener noreferrer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>

      <!-- دکمه اقدام سریع ایجاد لینک -->
      <router-link
        to="/access-links?action=create"
        class="dyf-btn dyf-btn-primary dyf-btn-sm dyf-header-create-link-btn"
        title="ایجاد لینک اختصاصی جدید"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        <span class="dyf-header-btn-text">ایجاد لینک اختصاصی</span>
      </router-link>
    </div>
  </header>
</template>
