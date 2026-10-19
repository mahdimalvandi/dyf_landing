/**
 * ==========================================================================
 * DYF Private Catalog — Admin Panel Logic (Design System v4)
 * Task 1: UI Foundation, Authentication & Panel Shell
 * ==========================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // ۱. داده‌های اولیه و شبیه‌سازی‌شده (Mock Data Store)
  // ==========================================================================
  const DYF_DATA = {
    admin: {
      name: 'مهدی مالوندی',
      role: 'مدیر ارشد کارگاه',
      phone: '09121234567',
      avatar: 'م‌م',
    },
    stats: {
      totalModels: 18,
      publishedModels: 14,
      draftModels: 3,
      archivedModels: 1,
      activeCustomers: 24,
      activeLinks: 9,
      expiredLinks: 3,
      weeklyViews: 142,
    },
    categories: [
      { id: 'cat-1', name: 'لاین رسمی و اداری (Formal & Dress)', count: 8, status: 'active' },
      { id: 'cat-2', name: 'لاین اسپرت و کژوال (Sport & Casual)', count: 6, status: 'active' },
      { id: 'cat-3', name: 'لاین چرم لوکس دست‌دوز (Handmade Atelier)', count: 4, status: 'active' },
    ],
    recentAccessLinks: [
      {
        id: 'LNK-9081',
        recipientFa: 'حاج مصطفی کمالی',
        recipientEn: 'Haj Mostafa Kamali',
        customer: 'بنکداری کمالی (بازار تهران)',
        authType: 'otp', // otp or direct
        categories: ['لاین رسمی و اداری', 'لاین دست‌دوز'],
        status: 'active', // active, expired, pending
        expiresAt: '۲ روز دیگر (۳۰ مهر ۱۴۰۵)',
        duration: '۱۰ دقیقه پس از ورود',
        views: 3,
        url: 'https://dyf-atelier.ir/catalog?token=c8f2a91e',
      },
      {
        id: 'LNK-9082',
        recipientFa: 'مهندس امید شمس',
        recipientEn: 'Omid Shams',
        customer: 'بازرگانی کفش امید (تبریز)',
        authType: 'direct',
        categories: ['همه دسته‌بندی‌ها'],
        status: 'active',
        expiresAt: '۵ روز دیگر (۳ آبان ۱۴۰۵)',
        duration: 'دسترسی نامحدود',
        views: 8,
        url: 'https://dyf-atelier.ir/catalog?token=9b44fa71',
      },
      {
        id: 'LNK-9083',
        recipientFa: 'سپهر نوری‌زاده',
        recipientEn: 'Sepehr Nourizadeh',
        customer: 'گالری کفش سپهر (شیراز)',
        authType: 'otp',
        categories: ['لاین اسپرت و کژوال'],
        status: 'pending',
        expiresAt: '۱ روز دیگر (۲۹ مهر ۱۴۰۵)',
        duration: '۱۵ دقیقه پس از ورود',
        views: 0,
        url: 'https://dyf-atelier.ir/catalog?token=e110b5c4',
      },
      {
        id: 'LNK-9084',
        recipientFa: 'آرتین قوامی',
        recipientEn: 'Artin Ghavami',
        customer: 'بوتیک آرتین (اصفهان)',
        authType: 'direct',
        categories: ['لاین رسمی و اداری'],
        status: 'expired',
        expiresAt: 'منقضی شده (دیروز)',
        duration: 'پایان مهلت شروع دسترسی',
        views: 2,
        url: 'https://dyf-atelier.ir/catalog?token=77fa33d2',
      },
    ],
  };

  // ==========================================================================
  // ۲. ماژول مدیریت اعلان‌ها (Toast Notification System)
  // ==========================================================================
  const DYF_Toast = {
    container: null,

    init() {
      this.container = document.getElementById('dyfToastContainer');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'dyfToastContainer';
        this.container.className = 'dyf-toast-container';
        document.body.appendChild(this.container);
      }
    },

    show({ type = 'info', title = '', message = '', duration = 4000 }) {
      this.init();

      const icons = {
        success: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
        error: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
        warning: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        info: `<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      };

      const toast = document.createElement('div');
      toast.className = `dyf-toast dyf-toast-${type}`;
      toast.innerHTML = `
        ${icons[type] || icons.info}
        <div class="dyf-toast-content">
          ${title ? `<div class="dyf-toast-title">${title}</div>` : ''}
          <div class="dyf-toast-message">${message}</div>
        </div>
        <div class="dyf-toast-progress" style="transition: width ${duration}ms linear; width: 100%;"></div>
      `;

      this.container.appendChild(toast);

      // اجرای انیمیشن نوار پیشرفت
      requestAnimationFrame(() => {
        const progress = toast.querySelector('.dyf-toast-progress');
        if (progress) progress.style.width = '0%';
      });

      const timer = setTimeout(() => {
        this.dismiss(toast);
      }, duration);

      toast.addEventListener('click', () => {
        clearTimeout(timer);
        this.dismiss(toast);
      });
    },

    dismiss(toast) {
      toast.classList.add('is-leaving');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 260);
    },
  };

  window.DYF_Toast = DYF_Toast;

  // ==========================================================================
  // ۳. ماژول مدیریت مودال‌ها و تأیید عملیات (Modal System)
  // ==========================================================================
  const DYF_Modal = {
    open(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input, button:not(.dyf-modal-close)');
      if (firstInput) firstInput.focus();
    },

    close(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    },

    confirm({ title, message, confirmText = 'تأیید', cancelText = 'انصراف', onConfirm }) {
      let modal = document.getElementById('dyfConfirmModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dyfConfirmModal';
        modal.className = 'dyf-modal-backdrop';
        modal.innerHTML = `
          <div class="dyf-modal-card">
            <div class="dyf-modal-header">
              <h3 class="dyf-modal-title" id="dyfConfirmTitle"></h3>
              <button type="button" class="dyf-modal-close" data-close>&times;</button>
            </div>
            <div class="dyf-modal-body" id="dyfConfirmMessage"></div>
            <div class="dyf-modal-footer">
              <button type="button" class="dyf-btn dyf-btn-outline" data-close id="dyfConfirmCancelBtn"></button>
              <button type="button" class="dyf-btn dyf-btn-danger" id="dyfConfirmOkBtn"></button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('[data-close]').forEach((btn) => {
          btn.addEventListener('click', () => DYF_Modal.close('dyfConfirmModal'));
        });

        modal.addEventListener('click', (e) => {
          if (e.target === modal) DYF_Modal.close('dyfConfirmModal');
        });
      }

      document.getElementById('dyfConfirmTitle').textContent = title;
      document.getElementById('dyfConfirmMessage').innerHTML = message;
      document.getElementById('dyfConfirmCancelBtn').textContent = cancelText;
      const okBtn = document.getElementById('dyfConfirmOkBtn');
      okBtn.textContent = confirmText;

      const newOkBtn = okBtn.cloneNode(true);
      okBtn.parentNode.replaceChild(newOkBtn, okBtn);

      newOkBtn.addEventListener('click', () => {
        DYF_Modal.close('dyfConfirmModal');
        if (typeof onConfirm === 'function') onConfirm();
      });

      this.open('dyfConfirmModal');
    },
  };

  window.DYF_Modal = DYF_Modal;

  // بستن مودال با دکمه Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.dyf-modal-backdrop.is-open');
      if (openModal) DYF_Modal.close(openModal.id);
    }
  });

  // ==========================================================================
  // ۴. جریان احراز هویت و ورود مدیر (Admin Authentication Flow)
  // ==========================================================================
  const AuthController = {
    authView: document.getElementById('authView'),
    adminApp: document.getElementById('adminApp'),
    stepPhone: document.getElementById('authStepPhone'),
    stepOtp: document.getElementById('authStepOtp'),
    phoneInput: document.getElementById('adminPhoneInput'),
    sendOtpBtn: document.getElementById('sendOtpBtn'),
    verifyOtpBtn: document.getElementById('verifyOtpBtn'),
    otpPhoneDisplay: document.getElementById('otpPhoneDisplay'),
    otpDigits: document.querySelectorAll('.dyf-otp-digit'),
    timerEl: document.getElementById('otpCountdown'),
    resendBtn: document.getElementById('resendOtpBtn'),
    changePhoneBtn: document.getElementById('changePhoneBtn'),
    testQuickFillBtn: document.getElementById('testQuickFillBtn'),
    testErrorOtpBtn: document.getElementById('testErrorOtpBtn'),

    timerInterval: null,
    timeLeft: 60,
    testCode: '12345',

    init() {
      const isAuth = localStorage.getItem('dyf_admin_auth') === 'true';

      if (isAuth) {
        this.showAdminApp(false);
      } else {
        this.showAuthView();
      }

      this.bindEvents();
    },

    bindEvents() {
      // مرحله ۱: ارسال شماره تلفن
      if (this.sendOtpBtn) {
        this.sendOtpBtn.addEventListener('click', () => this.handleSendPhone());
      }
      if (this.phoneInput) {
        this.phoneInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.handleSendPhone();
        });
      }

      // تغییر شماره تلفن و بازگشت به مرحله ۱
      if (this.changePhoneBtn) {
        this.changePhoneBtn.addEventListener('click', () => {
          this.stepOtp.classList.add('is-hidden');
          this.stepPhone.classList.remove('is-hidden');
          this.stopTimer();
          if (this.phoneInput) this.phoneInput.focus();
        });
      }

      // ارسال مجدد کد
      if (this.resendBtn) {
        this.resendBtn.addEventListener('click', () => {
          this.startTimer();
          DYF_Toast.show({
            type: 'info',
            title: 'ارسال مجدد کد',
            message: `کد ۵ رقمی آزمایشی جدید (${this.testCode}) به شماره شما ارسال شد.`,
          });
        });
      }

      // ورودی‌های ۵ رقمی کد یک‌بارمصرف
      this.otpDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
          const val = e.target.value;
          if (val) {
            digit.classList.add('is-filled');
            if (index < this.otpDigits.length - 1) {
              this.otpDigits[index + 1].focus();
            }
          } else {
            digit.classList.remove('is-filled');
          }
        });

        digit.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !digit.value && index > 0) {
            this.otpDigits[index - 1].focus();
          }
          if (e.key === 'Enter') {
            this.handleVerifyOtp();
          }
        });

        // پشتیبانی از Paste متن کد ۵ رقمی
        digit.addEventListener('paste', (e) => {
          e.preventDefault();
          const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
          if (/^\d{5}$/.test(pasteData)) {
            pasteData.split('').forEach((char, i) => {
              if (this.otpDigits[i]) {
                this.otpDigits[i].value = char;
                this.otpDigits[i].classList.add('is-filled');
              }
            });
            this.otpDigits[4].focus();
          }
        });
      });

      // دکمه تأیید کد
      if (this.verifyOtpBtn) {
        this.verifyOtpBtn.addEventListener('click', () => this.handleVerifyOtp());
      }

      // ابزارهای تست سریع در صفحه ورود
      if (this.testQuickFillBtn) {
        this.testQuickFillBtn.addEventListener('click', () => {
          if (this.phoneInput) this.phoneInput.value = '09121234567';
          this.handleSendPhone();
          setTimeout(() => {
            this.fillOtpCode('12345');
            DYF_Toast.show({
              type: 'success',
              title: 'تکمیل خودکار تستی',
              message: 'شماره و کد پیش‌فرض تستی وارد شدند.',
            });
          }, 300);
        });
      }

      if (this.testErrorOtpBtn) {
        this.testErrorOtpBtn.addEventListener('click', () => {
          this.fillOtpCode('99999');
          this.handleVerifyOtp();
        });
      }

      // خروج از پنل (دکمه‌های هدر و سایدبار)
      document.querySelectorAll('.js-admin-logout').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          DYF_Modal.confirm({
            title: 'خروج از حساب مدیریت',
            message: 'آیا برای خروج از پنل مدیریت کاتالوگ اطمینان دارید؟',
            confirmText: 'خروج از پنل',
            cancelText: 'انصراف',
            onConfirm: () => {
              localStorage.removeItem('dyf_admin_auth');
              DYF_Toast.show({
                type: 'info',
                title: 'خروج موفق',
                message: 'جلسه کاری شما با موفقیت به پایان رسید.',
              });
              setTimeout(() => {
                window.location.reload();
              }, 400);
            },
          });
        });
      });
    },

    handleSendPhone() {
      const phone = this.phoneInput ? this.phoneInput.value.trim() : '';
      const phoneRegex = /^09[0-9]{9}$/;

      if (!phoneRegex.test(phone)) {
        if (this.phoneInput) this.phoneInput.classList.add('dyf-input-error');
        DYF_Toast.show({
          type: 'error',
          title: 'شماره نامعتبر',
          message: 'لطفاً یک شماره موبایل معتبر ۱۱ رقمی (مثال: 09121234567) وارد کنید.',
        });
        return;
      }

      if (this.phoneInput) this.phoneInput.classList.remove('dyf-input-error');
      if (this.sendOtpBtn) this.sendOtpBtn.classList.add('is-loading');

      setTimeout(() => {
        if (this.sendOtpBtn) this.sendOtpBtn.classList.remove('is-loading');
        if (this.otpPhoneDisplay) this.otpPhoneDisplay.textContent = phone;

        this.stepPhone.classList.add('is-hidden');
        this.stepOtp.classList.remove('is-hidden');

        // فوکوس روی اولین خانه کد
        if (this.otpDigits[0]) this.otpDigits[0].focus();

        this.startTimer();

        DYF_Toast.show({
          type: 'success',
          title: 'کد یک‌بارمصرف ارسال شد',
          message: `کد ۵ رقمی آزمایشی ورود: ${this.testCode}`,
          duration: 6000,
        });
      }, 550);
    },

    handleVerifyOtp() {
      let code = '';
      this.otpDigits.forEach((d) => (code += d.value.trim()));

      if (code.length < 5) {
        DYF_Toast.show({
          type: 'warning',
          title: 'کد ناقص است',
          message: 'لطفاً هر ۵ رقم کد تأیید را وارد کنید.',
        });
        return;
      }

      if (this.verifyOtpBtn) this.verifyOtpBtn.classList.add('is-loading');

      setTimeout(() => {
        if (this.verifyOtpBtn) this.verifyOtpBtn.classList.remove('is-loading');

        if (code === this.testCode) {
          // ورود موفق
          localStorage.setItem('dyf_admin_auth', 'true');
          DYF_Toast.show({
            type: 'success',
            title: 'احراز هویت موفق',
            message: 'خوش آمدید! در حال انتقال به پیشخوان مدیریت کاتالوگ...',
            duration: 2500,
          });

          setTimeout(() => {
            this.showAdminApp(true);
          }, 600);
        } else {
          // خطای شبیه‌سازی‌شده کد نادرست
          this.otpDigits.forEach((d) => {
            d.classList.add('dyf-input-error');
          });

          DYF_Toast.show({
            type: 'error',
            title: 'کد تأیید نادرست است',
            message: `کد واردشده نامعتبر است. کد صحیح آزمایشی: ${this.testCode}`,
          });

          setTimeout(() => {
            this.otpDigits.forEach((d) => d.classList.remove('dyf-input-error'));
          }, 1500);
        }
      }, 500);
    },

    fillOtpCode(code) {
      code.split('').forEach((char, i) => {
        if (this.otpDigits[i]) {
          this.otpDigits[i].value = char;
          this.otpDigits[i].classList.add('is-filled');
        }
      });
      if (this.otpDigits[4]) this.otpDigits[4].focus();
    },

    startTimer() {
      this.stopTimer();
      this.timeLeft = 60;
      if (this.resendBtn) this.resendBtn.disabled = true;

      this.updateTimerDisplay();
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        this.updateTimerDisplay();

        if (this.timeLeft <= 0) {
          this.stopTimer();
          if (this.resendBtn) this.resendBtn.disabled = false;
        }
      }, 1000);
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    updateTimerDisplay() {
      if (!this.timerEl) return;
      const m = Math.floor(this.timeLeft / 60);
      const s = this.timeLeft % 60;
      this.timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    showAuthView() {
      if (this.authView) this.authView.style.display = 'flex';
      if (this.adminApp) this.adminApp.classList.add('is-hidden');
    },

    showAdminApp(animate = false) {
      if (this.authView) this.authView.style.display = 'none';
      if (this.adminApp) {
        this.adminApp.classList.remove('is-hidden');
        if (animate) {
          this.adminApp.style.opacity = '0';
          requestAnimationFrame(() => {
            this.adminApp.style.transition = 'opacity 0.4s ease';
            this.adminApp.style.opacity = '1';
          });
        }
      }
      Router.init();
    },
  };

  // ==========================================================================
  // ۵. مسیریاب سبک درون‌پنل (SPA Hash-based View Router)
  // ==========================================================================
  const Router = {
    views: {},
    navItems: [],
    breadcrumbActive: document.getElementById('dyfBreadcrumbActive'),

    routes: {
      '#dashboard': { title: 'داشبورد تحلیلی', viewId: 'viewDashboard' },
      '#shoes': { title: 'مدیریت مدل‌های کفش', viewId: 'viewShoes' },
      '#categories': { title: 'مدیریت دسته‌بندی‌ها', viewId: 'viewCategories' },
      '#customers': { title: 'مشتریان و همکاران', viewId: 'viewCustomers' },
      '#access-links': { title: 'لینک‌های دسترسی اختصاصی', viewId: 'viewAccessLinks' },
      '#components': { title: 'کامپوننت‌های مشترک دیزاین سیستم', viewId: 'viewComponents' },
      '#settings': { title: 'تنظیمات کاتالوگ', viewId: 'viewSettings' },
    },

    init() {
      this.navItems = document.querySelectorAll('.dyf-nav-item');
      window.addEventListener('hashchange', () => this.handleRoute());

      const currentHash = window.location.hash || '#dashboard';
      this.navigate(currentHash);
    },

    navigate(hash) {
      if (!this.routes[hash]) hash = '#dashboard';
      window.location.hash = hash;
      this.handleRoute();
    },

    handleRoute() {
      const hash = window.location.hash || '#dashboard';
      const route = this.routes[hash] || this.routes['#dashboard'];

      // مخفی کردن تمامی ویوها
      document.querySelectorAll('.dyf-view').forEach((v) => v.classList.remove('is-active'));

      // نمایش ویوی فعال
      const activeView = document.getElementById(route.viewId);
      if (activeView) {
        activeView.classList.add('is-active');
      }

      // به‌روزرسانی نوار سایدبار
      this.navItems.forEach((item) => {
        if (item.getAttribute('href') === hash) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });

      // به‌روزرسانی مسیر موقعیت (Breadcrumbs)
      if (this.breadcrumbActive) {
        this.breadcrumbActive.textContent = route.title;
      }

      // بستن دراور سایدبار در موبایل پس از انتخاب مسیر
      SidebarController.closeMobileSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  };

  // ==========================================================================
  // ۶. کنترلر سایدبار ریسپانسیو (Sidebar Controller)
  // ==========================================================================
  const SidebarController = {
    sidebar: document.getElementById('adminSidebar'),
    overlay: document.getElementById('sidebarOverlay'),
    toggleBtn: document.getElementById('hamburgerToggle'),

    init() {
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', () => this.toggleMobileSidebar());
      }
      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.closeMobileSidebar());
      }
    },

    toggleMobileSidebar() {
      if (!this.sidebar) return;
      const isOpen = this.sidebar.classList.toggle('is-open');
      if (this.overlay) this.overlay.classList.toggle('is-open', isOpen);
    },

    closeMobileSidebar() {
      if (this.sidebar) this.sidebar.classList.remove('is-open');
      if (this.overlay) this.overlay.classList.remove('is-open');
    },
  };

  // ==========================================================================
  // ۷. رندر جدول لینک‌ها و اکشن‌های تعاملی داشبورد
  // ==========================================================================
  const DashboardController = {
    tableBody: document.getElementById('recentLinksTableBody'),
    emptyState: document.getElementById('tableEmptyState'),
    skeletonState: document.getElementById('tableSkeletonState'),

    init() {
      this.renderTable(DYF_DATA.recentAccessLinks);
      this.bindActions();
    },

    renderTable(links) {
      if (!this.tableBody) return;
      if (!links || links.length === 0) {
        this.tableBody.innerHTML = '';
        if (this.emptyState) this.emptyState.style.display = 'block';
        return;
      }

      if (this.emptyState) this.emptyState.style.display = 'none';

      const statusBadges = {
        active: `<span class="dyf-badge dyf-badge-active">فعال</span>`,
        expired: `<span class="dyf-badge dyf-badge-expired">منقضی</span>`,
        pending: `<span class="dyf-badge dyf-badge-draft">در انتظار ورود</span>`,
      };

      const authBadges = {
        otp: `<span style="color: var(--gold-light); font-size: 0.76rem;">همراه با OTP</span>`,
        direct: `<span style="color: var(--text-muted); font-size: 0.76rem;">ورود مستقیم</span>`,
      };

      this.tableBody.innerHTML = links
        .map(
          (lnk) => `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-ivory);">${lnk.recipientFa}</div>
            <div style="font-size: 0.74rem; color: var(--text-dim); font-family: var(--font-serif);">${lnk.recipientEn}</div>
          </td>
          <td>
            <div style="font-size: 0.82rem; color: var(--text-main);">${lnk.customer}</div>
            <div style="font-size: 0.72rem; color: var(--gold-primary);">${lnk.categories.join('، ')}</div>
          </td>
          <td>${authBadges[lnk.authType] || '-'}</td>
          <td>${statusBadges[lnk.status] || lnk.status}</td>
          <td>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${lnk.expiresAt}</div>
            <div style="font-size: 0.7rem; color: var(--text-dim);">${lnk.duration}</div>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-sm js-copy-link" data-url="${lnk.url}" title="کپی لینک اختصاصی">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span>کپی</span>
              </button>
              <button type="button" class="dyf-btn dyf-btn-specular dyf-btn-sm js-view-link-detail" data-id="${lnk.id}" title="مشاهده جزئیات">
                <span>جزئیات</span>
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');

      // پیوند رویداد کپی لینک
      this.tableBody.querySelectorAll('.js-copy-link').forEach((btn) => {
        btn.addEventListener('click', () => {
          const url = btn.getAttribute('data-url');
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
              DYF_Toast.show({
                type: 'success',
                title: 'لینک کپی شد',
                message: 'آدرس کاتالوگ اختصاصی در حافظه کپی شد.',
              });
            });
          } else {
            DYF_Toast.show({ type: 'info', title: 'لینک کاتالوگ', message: url });
          }
        });
      });

      // پیوند مشاهده جزئیات
      this.tableBody.querySelectorAll('.js-view-link-detail').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const item = DYF_DATA.recentAccessLinks.find((l) => l.id === id);
          if (item) {
            DYF_Modal.confirm({
              title: `شناسنامه لینک اختصاصی (${item.id})`,
              message: `
                <div style="display: grid; gap: 0.6rem; font-size: 0.88rem;">
                  <div><strong>گیرنده:</strong> ${item.recipientFa} (${item.recipientEn})</div>
                  <div><strong>مشتری مرتبط:</strong> ${item.customer}</div>
                  <div><strong>روش ورود:</strong> ${item.authType === 'otp' ? 'نیاز به تأیید شماره تلفن و OTP' : 'لینک مستقیم بدون OTP'}</div>
                  <div><strong>مهلت و مدت:</strong> ${item.expiresAt} — ${item.duration}</div>
                  <div><strong>تعداد دفعات مشاهده:</strong> ${item.views} بار</div>
                  <div><strong>آدرس:</strong> <span style="direction: ltr; display: inline-block; color: var(--gold-light); font-size: 0.78rem;">${item.url}</span></div>
                </div>
              `,
              confirmText: 'بستن',
              cancelText: 'لغو دسترسی این لینک',
              onConfirm: () => {},
            });
          }
        });
      });
    },

    bindActions() {
      // شبیه‌سازی کلید میانبر جست‌وجوی سریع
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          const searchInput = document.getElementById('quickSearchInput');
          if (searchInput) searchInput.focus();
        }
      });
    },
  };

  // ==========================================================================
  // ۸. کنترلر نمایش و تست آزمایشگاهی کامپوننت‌ها (Component Kitchen-Sink)
  // ==========================================================================
  const ComponentDemoController = {
    init() {
      // تست توست‌ها
      document.getElementById('demoToastSuccess')?.addEventListener('click', () => {
        DYF_Toast.show({
          type: 'success',
          title: 'عملیات موفق',
          message: 'مدل کفش «دیفندر هورس واکس» با موفقیت در کاتالوگ منتشر شد.',
        });
      });

      document.getElementById('demoToastError')?.addEventListener('click', () => {
        DYF_Toast.show({
          type: 'error',
          title: 'خطای اعتبارسنجی',
          message: 'حداقل یک تصویر اصلی برای انتشار مدل کفش الزامی است.',
        });
      });

      document.getElementById('demoToastWarning')?.addEventListener('click', () => {
        DYF_Toast.show({
          type: 'warning',
          title: 'هشدار مهلت دسترسی',
          message: 'مهلت مشاهده کاتالوگ برای مشتری «آرتین قوامی» کمتر از ۱ ساعت دیگر به پایان می‌رسد.',
        });
      });

      document.getElementById('demoToastInfo')?.addEventListener('click', () => {
        DYF_Toast.show({
          type: 'info',
          title: 'به‌روزرسانی کاتالوگ',
          message: '۳ مدل جدید به لاین اسپرت و کژوال افزوده شد.',
        });
      });

      // تست مودال تأیید حذف
      document.getElementById('demoConfirmModal')?.addEventListener('click', () => {
        DYF_Modal.confirm({
          title: 'تأیید بایگانی مدل کفش',
          message: 'آیا از انتقال مدل <strong>«کفش رسمی آکسفورد تمام‌چرم»</strong> به بخش بایگانی اطمینان دارید؟<br><small style="color: var(--text-dim);">این مدل از دید تمام لینک‌ها و کاتالوگ‌های اختصاصی مشتریان حذف خواهد شد.</small>',
          confirmText: 'بایگانی مدل',
          cancelText: 'انصراف',
          onConfirm: () => {
            DYF_Toast.show({
              type: 'info',
              title: 'مدل بایگانی شد',
              message: 'مدل انتخابی به آرشیو منتقل شد و در کاتالوگ فعال نمایش داده نمی‌شود.',
            });
          },
        });
      });

      // تست شبیه‌سازی لودینگ دکمه
      document.getElementById('demoBtnLoading')?.addEventListener('click', function () {
        const btn = this;
        btn.classList.add('is-loading');
        setTimeout(() => {
          btn.classList.remove('is-loading');
          DYF_Toast.show({ type: 'success', title: 'تکمیل عملیات', message: 'عملیات با موفقیت پایان یافت.' });
        }, 1800);
      });

      // تست تعویض حالت جدول (عادی / خالی / لودینگ اسکلتون)
      document.getElementById('demoTableToggleEmpty')?.addEventListener('click', () => {
        const tbody = document.getElementById('recentLinksTableBody');
        const empty = document.getElementById('tableEmptyState');
        if (tbody.children.length > 0) {
          tbody.innerHTML = '';
          empty.style.display = 'block';
        } else {
          DashboardController.renderTable(DYF_DATA.recentAccessLinks);
        }
      });
    },
  };

  // ==========================================================================
  // ۹. اجرای اولیه پس از آماده شدن DOM
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    AuthController.init();
    SidebarController.init();
    DashboardController.init();
    ComponentDemoController.init();
  });
})();
