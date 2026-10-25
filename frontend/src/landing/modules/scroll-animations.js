/**
 * ماژول اسکرول نرم (Lenis) و انیمیشن‌های ظهور و تعاملات مبتنی بر اسکرول (GSAP ScrollTrigger)
 * @module landing/modules/scroll-animations
 */

/**
 * پیکربندی و راه‌اندازی اسکرول روان و انیمیشن‌های صفحه
 * @param {object} [options]
 * @param {() => void} [options.onNavClick] کال‌بک در زمان کلیک روی ناوبری جهت بستن منوی موبایل
 * @returns {{ lenis: object|null }} شیء اسکرولر جهت هماهنگی با سایر ماژول‌ها
 */
export function initScrollAnimations({ onNavClick } = {}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ۱. راه‌اندازی Lenis Smooth Scroll
  let lenis = null;
  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
    });

    // پیوند رویدادهای اسکرول Lenis با GSAP ScrollTrigger
    if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.registerPlugin(window.ScrollTrigger);
      lenis.on('scroll', window.ScrollTrigger.update);

      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  } else if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  // ۲. تغییر ظاهر هدر با اسکرول
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

  // ۳. مدیریت ناوبری لینک‌های داخلی با اسکرول نرم
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

  // ۴. انتخاب هوشمند لاین کاتالوگ و اسکرول به فرم استعلام
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

  // ۵. دکمه‌های اقدام به استعلام
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

  // اگر کاهش انیمیشن فعال باشد یا GSAP بارگذاری نشده باشد، سایر انیمیشن‌ها را لغو می‌کنیم
  if (prefersReducedMotion || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    return { lenis };
  }

  // ۶. ظاهر شدن نرم بخش‌ها هنگام اسکرول — Fade Up Reveal با ScrollTrigger
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
    const triggerEl = document.querySelector(cfg.trigger);
    if (!triggerEl) return;

    const items = triggerEl.querySelectorAll(cfg.elements);
    if (!items.length) return;

    window.gsap.from(items, {
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

  // بازنشانی موقعیت‌های ScrollTrigger پس از لود کامل صفحه و استایل‌ها
  window.addEventListener('load', () => {
    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.refresh();
    }
  });

  // ۷. نمایان‌شدن تصویری — Clip Reveal در سکشن Defender
  const defenderTriptych = document.querySelector('.defender-visual-triptych');
  if (defenderTriptych) {
    const masterImg = defenderTriptych.querySelector('.defender-master-img');
    const detailImgs = defenderTriptych.querySelectorAll('.defender-detail-img');
    const captions = defenderTriptych.querySelectorAll('.defender-frame-caption');

    const clipTl = window.gsap.timeline({
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

  // ۸. روایت تصویری محدود — Sticky Scrollytelling در سکشن داستان برند
  const storySection = document.querySelector('.story-section');
  if (storySection && window.innerWidth >= 993) {
    const pointItems = storySection.querySelectorAll('.story-point-item');

    if (pointItems.length) {
      pointItems.forEach((item) => {
        window.ScrollTrigger.create({
          trigger: item,
          start: 'top 75%',
          end: 'bottom 45%',
          onEnter: () => item.classList.add('is-active'),
          onLeaveBack: () => item.classList.remove('is-active'),
        });
      });
    }
  }

  return { lenis };
}
