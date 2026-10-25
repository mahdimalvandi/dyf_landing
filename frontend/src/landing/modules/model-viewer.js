/**
 * ماژول کنترل و بهینه‌سازی مدل سه‌بعدی هیرو
 * خنثی‌سازی ترپ کیبورد، مدیریت لودینگ، خطای بارگذاری و نمایش تصویر جایگزین (2D Fallback)
 * @module landing/modules/model-viewer
 */

export function initModelViewerControl() {
  const heroModelViewer = document.querySelector('.hero-model-viewer');
  if (!heroModelViewer) return;

  const wrapper = heroModelViewer.closest('.hero-3d-wrapper');

  // خنثی‌سازی فوکوس ناخواسته و قفل اسکرول کیبورد در تگ مدل
  heroModelViewer.addEventListener('focus', () => {
    heroModelViewer.blur();
  });

  heroModelViewer.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      heroModelViewer.blur();
    }
  });

  // مدیریت رویداد خطا در بارگذاری فایل سه‌بعدی یا عدم پشتیبانی WebGL
  heroModelViewer.addEventListener('error', (event) => {
    console.warn('ModelViewer: WebGL / 3D model load issue, fallback active.', event);
    if (wrapper) {
      wrapper.classList.add('has-model-error');
    }
  });

  // رویداد اتمام موفق بارگذاری
  heroModelViewer.addEventListener('load', () => {
    if (wrapper) {
      wrapper.classList.add('is-model-loaded');
    }
  });
}
