/**
 * ماژول مدیریت منوی کشویی موبایل و هماهنگی با اسکرولر نرم
 * @module landing/modules/mobile-menu
 */

let lenisInstance = null;

const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

/**
 * اتصال آبجکت Lenis جهت توقف و ادامه اسکرول در زمان باز/بسته بودن منو
 * @param {object} lenis 
 */
export function bindLenis(lenis) {
  lenisInstance = lenis;
}

/**
 * بررسی وضعیت باز بودن منو
 * @returns {boolean}
 */
export function isMobileMenuOpen() {
  return mobileDrawer ? mobileDrawer.classList.contains('active') : false;
}

/**
 * بستن منوی کشویی موبایل
 */
export function closeMobileMenu() {
  if (!isMobileMenuOpen()) return;
  toggleMobileMenu();
}

/**
 * باز کردن منوی کشویی موبایل
 */
export function openMobileMenu() {
  if (isMobileMenuOpen()) return;
  toggleMobileMenu();
}

/**
 * تغییر وضعیت باز/بسته بودن منوی کشویی
 */
export function toggleMobileMenu() {
  if (!hamburgerBtn || !mobileDrawer || !mobileOverlay) return;

  const isOpen = hamburgerBtn.classList.toggle('active');
  mobileDrawer.classList.toggle('active');
  mobileOverlay.classList.toggle('active');
  document.body.style.overflow = isOpen ? 'hidden' : '';

  if (lenisInstance) {
    if (isOpen) {
      lenisInstance.stop();
    } else {
      lenisInstance.start();
    }
  }
}

/**
 * مقداردهی اولیه رویدادهای منوی همبرگری موبایل
 */
export function initMobileMenu() {
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', toggleMobileMenu);
  }

  if (mobileLinks && mobileLinks.length) {
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (isMobileMenuOpen()) {
          toggleMobileMenu();
        }
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobileMenuOpen()) {
      toggleMobileMenu();
    }
  });
}
