let lenisInstance = null;

const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

export function bindLenis(lenis) {
  lenisInstance = lenis;
}

export function isMobileMenuOpen() {
  return mobileDrawer ? mobileDrawer.classList.contains('active') : false;
}

export function closeMobileMenu() {
  if (!isMobileMenuOpen()) return;
  toggleMobileMenu();
}

export function openMobileMenu() {
  if (isMobileMenuOpen()) return;
  toggleMobileMenu();
}

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
