/**
 * ماژول کنترل و بهینه‌سازی مدل سه‌بعدی هیرو
 * خنثی‌سازی ترپ کیبورد و خارج‌کردن فوکوس برای جلوگیری از قفل‌شدن اسکرول صفحه
 * @module landing/modules/model-viewer
 */

export function initModelViewerControl() {
  const heroModelViewer = document.querySelector('.hero-model-viewer');
  if (!heroModelViewer) return;

  heroModelViewer.addEventListener('focus', () => {
    heroModelViewer.blur();
  });

  heroModelViewer.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      heroModelViewer.blur();
    }
  });
}
