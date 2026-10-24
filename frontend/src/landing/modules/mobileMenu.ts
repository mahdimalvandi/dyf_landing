/**
 * DYF Landing — Mobile Navigation Drawer Module
 * Handles drawer toggle, backdrop overlay, body scroll lock,
 * keyboard accessibility (Esc), and smooth synchronization with Lenis.
 */

export interface MobileMenuController {
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
  setLenis(lenis: any): void;
}

export function initMobileMenu(initialLenis: any = null): MobileMenuController {
  let lenisInstance = initialLenis;

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll<HTMLElement>('.mobile-nav-link');

  const updateState = (open: boolean) => {
    if (!hamburgerBtn || !mobileDrawer || !mobileOverlay) return;

    if (open) {
      hamburgerBtn.classList.add('active');
      mobileDrawer.classList.add('active');
      mobileOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (lenisInstance && typeof lenisInstance.stop === 'function') {
        lenisInstance.stop();
      }
    } else {
      hamburgerBtn.classList.remove('active');
      mobileDrawer.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
      if (lenisInstance && typeof lenisInstance.start === 'function') {
        lenisInstance.start();
      }
    }
  };

  const isOpen = (): boolean => {
    return Boolean(mobileDrawer && mobileDrawer.classList.contains('active'));
  };

  const open = () => updateState(true);
  const close = () => updateState(false);
  const toggle = () => updateState(!isOpen());

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggle();
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen()) {
        close();
      }
    });
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen()) {
      close();
    }
  });

  return {
    open,
    close,
    toggle,
    isOpen,
    setLenis: (lenis: any) => {
      lenisInstance = lenis;
    },
  };
}
