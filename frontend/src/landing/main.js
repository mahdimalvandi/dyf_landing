/**
 * ماژول اصلی و ورودی اسکریپت‌های صفحه فرود برند DYF
 * سازمان‌دهی و هماهنگ‌سازی ماژول‌های مستقل لندینگ
 * @module landing/main
 */

import '../styles/style.css';
import { initMobileMenu, closeMobileMenu, bindLenis } from './modules/mobile-menu.js';
import { initSpecularHighlight } from './modules/specular.js';
import { initInquiryForm } from './modules/inquiry-form.js';
import { initModelViewerControl } from './modules/model-viewer.js';
import { initScrollAnimations } from './modules/scroll-animations.js';

/**
 * بوت‌استرپ و راه‌اندازی تمام ماژول‌های صفحه فرود
 */
function bootstrapLanding() {
  // ۱. راه‌اندازی کنترلر منوی موبایل
  initMobileMenu();

  // ۲. راه‌اندازی تعاملات نور و اشاره‌گر روی دکمه‌ها
  initSpecularHighlight();

  // ۳. راه‌اندازی فرم استعلام B2B
  initInquiryForm();

  // ۴. مدیریت فوکوس و کیبورد مدل ۳ بعدی
  initModelViewerControl();

  // ۵. راه‌اندازی اسکرول نرم و انیمیشن‌های ScrollTrigger
  const { lenis } = initScrollAnimations({
    onNavClick: () => {
      closeMobileMenu();
    },
  });

  // پیوند اسکرولر نرم به منوی موبایل جهت توقف اسکرول هنگام باز بودن کشو
  if (lenis) {
    bindLenis(lenis);
  }
}

// اطمینان از آماده بودن DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapLanding);
} else {
  bootstrapLanding();
}
