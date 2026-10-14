// ==========================================================================
// کنترل تعاملی منوی همبرگری موبایل
// ==========================================================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

function toggleMenu() {
  if (!hamburgerBtn || !mobileDrawer || !mobileOverlay) return;
  const isOpen = hamburgerBtn.classList.toggle('active');
  mobileDrawer.classList.toggle('active');
  mobileOverlay.classList.toggle('active');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu);

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (mobileDrawer && mobileDrawer.classList.contains('active')) {
      toggleMenu();
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('active')) {
    toggleMenu();
  }
});

// ==========================================================================
// انیمیشن Specular Highlight برای حرکت ماوس و تاچ
// ==========================================================================
document.querySelectorAll('.js-specular').forEach(button => {
  const handlePointer = (clientX, clientY) => {
    const rect = button.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    button.style.setProperty('--x', `${x}px`);
    button.style.setProperty('--y', `${y}px`);
  };

  button.addEventListener('mousemove', (e) => handlePointer(e.clientX, e.clientY));
  button.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
  });
});

// ==========================================================================
// مدیریت ارسال فرم استعلام B2B
// ==========================================================================
const inquiryForm = document.getElementById('inquiryForm');
const formSuccessBanner = document.getElementById('formSuccessBanner');
const resetFormBtn = document.getElementById('resetFormBtn');

if (inquiryForm) {
  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    inquiryForm.style.display = 'none';
    if (formSuccessBanner) formSuccessBanner.classList.add('active');
  });
}

if (resetFormBtn) {
  resetFormBtn.addEventListener('click', () => {
    if (formSuccessBanner) formSuccessBanner.classList.remove('active');
    if (inquiryForm) {
      inquiryForm.reset();
      inquiryForm.style.display = 'flex';
    }
  });
}

// ==========================================================================
// خنثی‌سازی فوکوس و کیبورد مدل سه‌بعدی هیرو
// ==========================================================================
const heroModelViewer = document.querySelector('.hero-model-viewer');
if (heroModelViewer) {
  heroModelViewer.addEventListener('focus', () => heroModelViewer.blur());
  heroModelViewer.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      heroModelViewer.blur();
    }
  });
}

// ==========================================================================
// راه‌اندازی اسکرول روان (Lenis) و انیمیشن‌های مبتنی بر اسکرول (GSAP ScrollTrigger)
// ==========================================================================
(function initSmoothScrollAndAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ۱. راه‌اندازی Lenis Smooth Scroll
  let lenis = null;
  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // حرکت کاملاً طبیعی و بدون اینرسی آزاردهنده
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
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  } else if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  // تغییر ظاهر هدر با اسکرول
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

  // مدیریت ناوبری لینک‌های داخلی با اسکرول نرم
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

        if (mobileDrawer && mobileDrawer.classList.contains('active')) {
          toggleMenu();
        }
      }
    });
  });

  // انتخاب هوشمند لاین کاتالوگ و اسکرول به فرم استعلام
  document.querySelectorAll('.js-select-line').forEach(link => {
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

      if (mobileDrawer && mobileDrawer.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // دکمه‌های اقدام به استعلام (هدر و هیرو)
  document.querySelectorAll('.js-scroll-inquiry, .header-actions .btn-desktop').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const inquiryTarget = document.getElementById('inquiry');
      if (inquiryTarget) {
        if (lenis) {
          lenis.scrollTo(inquiryTarget, { offset: -85, duration: 1.1 });
        } else {
          inquiryTarget.scrollIntoView({ behavior: 'smooth' });
        }
      }

      if (mobileDrawer && mobileDrawer.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // اگر کاربر ترجیح کاهش حرکت داده باشد، انیمیشن‌های اسکرول را لغو می‌کنیم
  if (prefersReducedMotion || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    return;
  }

  // ========================================================================
  // ۲. ظاهر شدن نرم متن‌ها — Fade Up Reveal (فقط روی عناصر کلیدی، یک‌بار اجرا)
  // ========================================================================
  const revealConfigs = [
    {
      trigger: '.hero-content-top',
      elements: '.hero-badge, .hero-main-title, .hero-main-desc, .hero-actions-group',
      start: 'top 90%',
    },
    {
      trigger: '.story-text-col',
      elements: '.story-badge, .story-title, .story-description',
      start: 'top 85%',
    },
    {
      trigger: '.craft-editorial-header',
      elements: '.craft-editorial-kicker, .craft-main-title, .craft-main-desc, .craft-curation-badge',
      start: 'top 85%',
    },
    {
      trigger: '.craft-row-formal',
      elements: '.craft-row-formal .craft-text-col > *',
      start: 'top 80%',
      stagger: 0.07,
    },
    {
      trigger: '.craft-row-sport',
      elements: '.craft-row-sport .craft-text-col > *',
      start: 'top 80%',
      stagger: 0.07,
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
      stagger: 0.1,
    },
    {
      trigger: '.inquiry-intro-col',
      elements: '.inquiry-meta, .inquiry-main-title, .inquiry-intro-desc',
      start: 'top 85%',
    },
    {
      trigger: '.inquiry-form-sector',
      elements: '.inquiry-form-header, .inquiry-fields-grid, .inquiry-form-actions, .inquiry-privacy-note',
      start: 'top 85%',
      stagger: 0.08,
    },
  ];

  revealConfigs.forEach(cfg => {
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
      y: 18,
      opacity: 0,
      duration: 0.62,
      ease: 'power2.out',
      stagger: cfg.stagger || 0.07,
      clearProps: 'transform,opacity',
    });
  });

  // ========================================================================
  // ۳. نمایان‌شدن تصویری — Clip Reveal در سکشن Defender
  // ========================================================================
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
      }
    });

    // تصویر اصلی: نمایان شدن از لبه نرم عمودی و بازگشت ملایم زوم از ۱.۰۳ به ۱.۰
    if (masterImg) {
      clipTl.fromTo(masterImg,
        { clipPath: 'inset(0 0 100% 0)', scale: 1.03 },
        { clipPath: 'inset(0 0 0% 0)', scale: 1.0, duration: 0.82, ease: 'power2.out' },
        0
      );
    }

    // دو تصویر کوچک‌تر: اختلاف زمانی بسیار کم (stagger) جهت حفظ یکپارچگی گالری
    if (detailImgs.length) {
      clipTl.fromTo(detailImgs,
        { clipPath: 'inset(0 0 100% 0)', scale: 1.03 },
        { clipPath: 'inset(0 0 0% 0)', scale: 1.0, duration: 0.78, ease: 'power2.out', stagger: 0.12 },
        0.14
      );
    }

    // برچسب‌ها و مشخصات متنی روی تصاویر بدون بریده‌شدن به‌آرامی نمایان می‌شوند
    if (captions.length) {
      clipTl.fromTo(captions,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.1 },
        0.42
      );
    }
  }

  // ========================================================================
  // ۴. روایت تصویری محدود — Sticky Scrollytelling در سکشن داستان برند
  // ========================================================================
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
})();
