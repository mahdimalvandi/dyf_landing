/**
 * DYF Landing — Scroll Animations & Motion Management
 * Coordinates Lenis Smooth Scroll, GSAP ScrollTrigger transitions,
 * section reveals, Defender visual clip paths, and header elevation.
 */

import type { MobileMenuController } from './mobileMenu';

export interface ScrollController {
  lenis: any;
  scrollTo(target: string | HTMLElement, options?: { offset?: number; duration?: number }): void;
  refresh(): void;
}

export function initScrollAnimations(menuController?: MobileMenuController): ScrollController {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Lenis Smooth Scroll Setup
  let lenis: any = null;
  const LenisConstructor = (window as any).Lenis;
  const gsap = (window as any).gsap;
  const ScrollTrigger = (window as any).ScrollTrigger;

  if (!prefersReducedMotion && typeof LenisConstructor !== 'undefined') {
    lenis = new LenisConstructor({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
    });

    if (menuController) {
      menuController.setLenis(lenis);
    }

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  } else if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 2. Header Scroll Elevation
  const siteHeader = document.querySelector<HTMLElement>('.site-header');
  if (siteHeader) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 25) {
          siteHeader.classList.add('is-scrolled');
        } else {
          siteHeader.classList.remove('is-scrolled');
        }
      },
      { passive: true }
    );
  }

  // Helper for smooth navigation
  const navigateTo = (targetSelector: string | HTMLElement) => {
    const target =
      typeof targetSelector === 'string'
        ? document.querySelector<HTMLElement>(targetSelector)
        : targetSelector;

    if (!target) return;

    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(target, {
        offset: -85,
        duration: 1.1,
      });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }

    if (menuController?.isOpen()) {
      menuController.close();
    }
  };

  // 3. Anchor Links Navigation
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e: MouseEvent) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      navigateTo(href);
    });
  });

  // 4. Catalog Line Selection Buttons
  document.querySelectorAll<HTMLElement>('.js-select-line').forEach((link) => {
    link.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      const lineVal = link.getAttribute('data-line');
      const selectEl = document.getElementById('linePreference') as HTMLSelectElement | null;
      if (selectEl && lineVal) {
        selectEl.value = lineVal;
      }
      navigateTo('#inquiry');
    });
  });

  // 5. Inquiry Action Buttons
  document
    .querySelectorAll<HTMLElement>('.js-scroll-inquiry, .hero-btn-primary')
    .forEach((btn) => {
      btn.addEventListener('click', (e: MouseEvent) => {
        const href = btn.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.getElementById(href.slice(1)) || document.getElementById('inquiry');
          if (target) {
            navigateTo(target);
          }
        }
      });
    });

  // If user prefers reduced motion or GSAP is not present, skip animations
  if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return {
      lenis,
      scrollTo: navigateTo,
      refresh: () => {},
    };
  }

  // 6. Section Fade Up Reveals
  const revealConfigs = [
    {
      trigger: '.hero-content-top',
      elements: '.hero-badge, .hero-main-title, .hero-main-desc, .hero-actions-group',
      start: 'top 90%',
    },
    {
      trigger: '.story-text-col',
      elements: '.story-badge, .story-title, .story-description, .story-point-item',
      start: 'top 85%',
      stagger: 0.08,
    },
    {
      trigger: '.craft-editorial-header',
      elements: '.craft-editorial-kicker, .craft-main-title, .craft-main-desc, .craft-curation-badge',
      start: 'top 85%',
    },
    {
      trigger: '.craft-row-formal',
      elements: '.craft-row-formal .craft-media-frame, .craft-row-formal .craft-text-col > *',
      start: 'top 80%',
      stagger: 0.08,
    },
    {
      trigger: '.craft-row-sport',
      elements: '.craft-row-sport .craft-media-frame, .craft-row-sport .craft-text-col > *',
      start: 'top 80%',
      stagger: 0.08,
    },
    {
      trigger: '.defender-showcase-header',
      elements: '.defender-showcase-kicker, .defender-showcase-title, .defender-showcase-lead',
      start: 'top 85%',
    },
    {
      trigger: '.pipeline-header',
      elements: '.pipeline-kicker, .pipeline-title, .pipeline-desc',
      start: 'top 85%',
    },
    {
      trigger: '.pipeline-timeline',
      elements: '.pipeline-node',
      start: 'top 82%',
      stagger: 0.12,
    },
    {
      trigger: '.inquiry-intro-col',
      elements: '.inquiry-meta, .inquiry-main-title, .inquiry-intro-desc, .inquiry-ledger-item',
      start: 'top 85%',
      stagger: 0.08,
    },
    {
      trigger: '.inquiry-form-sector',
      elements: '.inquiry-form-header, .inquiry-fields-grid, .inquiry-form-actions, .inquiry-privacy-note',
      start: 'top 85%',
      stagger: 0.08,
    },
    {
      trigger: '.faq-section',
      elements: '.faq-title, .faq-section details',
      start: 'top 85%',
      stagger: 0.07,
    },
  ];

  revealConfigs.forEach((cfg) => {
    const triggerEl = document.querySelector<HTMLElement>(cfg.trigger);
    if (!triggerEl) return;

    const items = triggerEl.querySelectorAll(cfg.elements);
    if (!items.length) return;

    gsap.from(items, {
      scrollTrigger: {
        trigger: triggerEl,
        start: cfg.start || 'top 85%',
        once: true,
      },
      y: 22,
      opacity: 0,
      duration: 0.68,
      ease: 'power2.out',
      stagger: cfg.stagger || 0.07,
      clearProps: 'transform,opacity',
    });
  });

  // 7. Defender Showcase Clip Reveal
  const defenderTriptych = document.querySelector<HTMLElement>('.defender-visual-triptych');
  if (defenderTriptych) {
    const masterImg = defenderTriptych.querySelector<HTMLElement>('.defender-master-img');
    const detailImgs = defenderTriptych.querySelectorAll<HTMLElement>('.defender-detail-img');
    const captions = defenderTriptych.querySelectorAll<HTMLElement>('.defender-frame-caption');

    const clipTl = gsap.timeline({
      scrollTrigger: {
        trigger: defenderTriptych,
        start: 'top 78%',
        once: true,
      },
    });

    if (masterImg) {
      clipTl.fromTo(
        masterImg,
        { clipPath: 'inset(0 0 100% 0)', scale: 1.03 },
        { clipPath: 'inset(0 0 0% 0)', scale: 1.0, duration: 0.82, ease: 'power2.out' },
        0
      );
    }

    if (detailImgs.length) {
      clipTl.fromTo(
        detailImgs,
        { clipPath: 'inset(0 0 100% 0)', scale: 1.03 },
        { clipPath: 'inset(0 0 0% 0)', scale: 1.0, duration: 0.78, ease: 'power2.out', stagger: 0.12 },
        0.14
      );
    }

    if (captions.length) {
      clipTl.fromTo(
        captions,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.1 },
        0.42
      );
    }
  }

  // 8. Story Section Sticky Scrollytelling
  const storySection = document.querySelector<HTMLElement>('.story-section');
  if (storySection && window.innerWidth >= 993) {
    const pointItems = storySection.querySelectorAll<HTMLElement>('.story-point-item');
    if (pointItems.length) {
      pointItems.forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 75%',
          end: 'bottom 45%',
          onEnter: () => item.classList.add('is-active'),
          onLeaveBack: () => item.classList.remove('is-active'),
        });
      });
    }
  }

  // Refresh ScrollTrigger on window load
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  return {
    lenis,
    scrollTo: navigateTo,
    refresh: () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    },
  };
}
