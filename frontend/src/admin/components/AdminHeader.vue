<template>
  <!-- هدر بالای پنل -->
  <header class="dyf-admin-header">
    <div class="dyf-header-right">
      <!-- دکمه همبرگری موبایل -->
      <button
        type="button"
        id="hamburgerToggle"
        class="dyf-hamburger-toggle"
        aria-label="باز کردن منو"
        @click="$emit('toggle-sidebar')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>

      <!-- مسیر موقعیت کاربر (Breadcrumbs) -->
      <nav class="dyf-breadcrumbs" aria-label="مسیر جاری">
        <a href="#dashboard" class="dyf-breadcrumb-root" @click.prevent="$emit('navigate', '#dashboard')">پنل مدیریت DYF</a>
        <span class="dyf-breadcrumb-sep">/</span>
        <span id="dyfBreadcrumbActive" class="dyf-breadcrumb-active">{{ currentTitle }}</span>
      </nav>
    </div>

    <div class="dyf-header-left">
      <!-- دکمه رفتن به سایت عمومی لندینگ -->
      <a href="/index.html" target="_blank" class="dyf-icon-btn dyf-header-landing-btn" title="مشاهده وب‌سایت عمومی DYF">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>

      <!-- دکمه اقدام سریع ایجاد لینک -->
      <a
        href="#access-links"
        class="dyf-btn dyf-btn-primary dyf-btn-sm dyf-header-create-link-btn"
        title="ایجاد لینک اختصاصی جدید"
        @click.prevent="$emit('open-create-link')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        <span class="dyf-header-btn-text">ایجاد لینک اختصاصی</span>
      </a>
    </div>
  </header>
</template>

<script setup>
defineProps({
  currentTitle: {
    type: String,
    default: 'داشبورد',
  },
});

defineEmits(['toggle-sidebar', 'navigate', 'open-create-link']);
</script>
