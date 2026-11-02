let lenisInstance = null;
let previousOverflow = '';
let previousFocus = null;

const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

export function bindLenis(lenis) { lenisInstance = lenis; }
export function isMobileMenuOpen() { return mobileDrawer?.classList.contains('active') || false; }

function setMenuOpen(open, restoreFocus = true) {
  if (!hamburgerBtn || !mobileDrawer || !mobileOverlay || open === isMobileMenuOpen()) return;
  if (open) {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
  }
  hamburgerBtn.classList.toggle('active', open);
  hamburgerBtn.setAttribute('aria-expanded', String(open));
  hamburgerBtn.setAttribute('aria-label', open ? 'بستن منوی موبایل' : 'منوی موبایل');
  mobileDrawer.classList.toggle('active', open);
  mobileDrawer.inert = !open;
  mobileOverlay.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : previousOverflow;
  if (open) {
    lenisInstance?.stop();
    mobileDrawer.querySelector('a')?.focus({ preventScroll: true });
  } else {
    lenisInstance?.start();
    if (restoreFocus) previousFocus?.focus({ preventScroll: true });
  }
}

export function closeMobileMenu() { setMenuOpen(false); }
export function openMobileMenu() { setMenuOpen(true); }
export function toggleMobileMenu() { setMenuOpen(!isMobileMenuOpen()); }

export function initMobileMenu() {
  hamburgerBtn?.addEventListener('click', toggleMobileMenu);
  mobileOverlay?.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach((link) => link.addEventListener('click', () => setMenuOpen(false, false)));
  window.matchMedia('(min-width: 921px)').addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false, false);
  });
  document.addEventListener('keydown', (event) => {
    if (!isMobileMenuOpen()) return;
    if (event.key === 'Escape') { closeMobileMenu(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [hamburgerBtn, ...mobileDrawer.querySelectorAll('a[href], button:not([disabled])')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    } else if (!focusable.includes(document.activeElement)) {
      event.preventDefault(); first.focus();
    }
  });
}
