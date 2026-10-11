// کنترل تعاملی منوی همبرگری موبایل
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleMenu() {
      const isOpen = hamburgerBtn.classList.toggle('active');
      mobileDrawer.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    hamburgerBtn.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', toggleMenu);

    // بسته شدن منو با لمس هر لینک
    mobileLinks.forEach(link => {
      link.addEventListener('click', toggleMenu);
    });

    // انیمیشن Specular Highlight برای حرکت ماوس و تاچ
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
        if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
      });
    });

    // اسکرول نرم به فرم استعلام برای دکمه‌های هدر و اکشن
    document.querySelectorAll('.js-scroll-inquiry, .header-actions .btn-desktop, .mobile-drawer-bottom .btn-specular').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('inquiry');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          if (mobileDrawer.classList.contains('active')) {
            toggleMenu();
          }
        }
      });
    });

    // انتخاب هوشمند لاین و اسکرول مستقیم به فرم استعلام
    document.querySelectorAll('.js-select-line').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const lineVal = link.getAttribute('data-line');
        const selectEl = document.getElementById('linePreference');
        if (selectEl && lineVal) {
          selectEl.value = lineVal;
        }
        const target = document.getElementById('inquiry');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          if (typeof mobileDrawer !== 'undefined' && mobileDrawer.classList.contains('active')) {
            toggleMenu();
          }
        }
      });
    });



    // مدیریت ارسال فرم استعلام B2B
    const inquiryForm = document.getElementById('inquiryForm');
    const formSuccessBanner = document.getElementById('formSuccessBanner');
    const resetFormBtn = document.getElementById('resetFormBtn');

    if (inquiryForm) {
      inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        inquiryForm.style.display = 'none';
        formSuccessBanner.classList.add('active');
      });
    }

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        formSuccessBanner.classList.remove('active');
        inquiryForm.reset();
        inquiryForm.style.display = 'flex';
      });
    }
