import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== 'undefined') {
  window.Lenis = Lenis;
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
}

export function initScrollAnimations({ onNavClick } = {}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lenis = null;
  if (!prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 25) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  const internalAnchors = document.querySelectorAll('a[href^="#"]');
  internalAnchors.forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, {
            offset: -85,
            duration: 1.1,
          });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }

        if (typeof onNavClick === 'function') {
          onNavClick();
        }
      }
    });
  });

  const lineLinks = document.querySelectorAll('.js-select-line');
  lineLinks.forEach((link) => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const lineVal = this.getAttribute('data-line');
      const selectEl = document.getElementById('linePreference');
      if (selectEl && lineVal) {
        selectEl.value = lineVal;
      }

      const inquiryTarget = document.getElementById('inquiry');
      if (inquiryTarget) {
        if (lenis) {
          lenis.scrollTo(inquiryTarget, { offset: -85, duration: 1.1 });
        } else {
          inquiryTarget.scrollIntoView({ behavior: 'smooth' });
        }
      }

      if (typeof onNavClick === 'function') {
        onNavClick();
      }
    });
  });

  const inquiryButtons = document.querySelectorAll('.js-scroll-inquiry, .hero-btn-primary');
  inquiryButtons.forEach((btn) => {
    btn.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const inquiryTarget = document.getElementById(href.slice(1)) || document.getElementById('inquiry');
        if (inquiryTarget) {
          if (lenis) {
            lenis.scrollTo(inquiryTarget, { offset: -85, duration: 1.1 });
          } else {
            inquiryTarget.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }

      if (typeof onNavClick === 'function') {
        onNavClick();
      }
    });
  });

  if (prefersReducedMotion) {
    return { lenis };
  }

  const revealConfigs = [
    {
      trigger: '.hero-content-top',
      elements: '.hero-badge, .hero-main-title, .hero-main-desc, .hero-actions-group',
      start: 'top 90%',
    },
    {
      trigger: '.story-text-col',
      elements: '.story-title, .story-description',
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
    const triggerEl = document.querySelector(cfg.trigger);
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

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  const defenderTriptych = document.querySelector('.defender-visual-triptych');
  if (defenderTriptych) {
    const masterImg = defenderTriptych.querySelector('.defender-master-img');
    const detailImgs = defenderTriptych.querySelectorAll('.defender-detail-img');
    const captions = defenderTriptych.querySelectorAll('.defender-frame-caption');

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

  return { lenis };
}
