/**
 * DYF Private B2B Catalog — Customer Viewing Experience (Task 6)
 * Pure Vanilla JavaScript & Design System v4
 */

(() => {
  'use strict';

  // تبدیل ارقام فارسی و عربی به انگلیسی
  function toEnglishDigits(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/[\u0660-\u0669]/g, (c) => c.charCodeAt(0) - 0x0660)
      .replace(/[\u06F0-\u06F9]/g, (c) => c.charCodeAt(0) - 0x06F0);
  }

  // باز کردن مودال بزرگنمایی لایت‌باکس تصویر کفش
  window.openShoeLightbox = function (url, title) {
    const lbImg = document.getElementById('lightboxImg');
    const lbCaption = document.getElementById('lightboxCaption');
    if (lbImg) lbImg.src = url;
    if (lbCaption) lbCaption.textContent = title || '';
    if (window.DYF_Modal) {
      window.DYF_Modal.open('modalShoeLightbox');
    } else {
      const modal = document.getElementById('modalShoeLightbox');
      if (modal) {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
      }
    }
  };

  // ==========================================================================
  // ۱. داده‌های پشتیبان پیش‌فرض در صورت خالی بودن LocalStorage
  // ==========================================================================
  const FALLBACK_SHOES = [
    {
      id: 101,
      title: 'اکسفورد کلاسیک هریتیج (Classic Heritage Oxford)',
      category: 'لاین رسمی و اداری (Formal & Dress)',
      categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
      price: '۷,۸۰۰,۰۰۰',
      leather: 'چرم گاوی فلوتر فرانسوی اعلا (Full-Grain Calf)',
      sole: 'زیره چرم اشپالت ایتالیایی (Leather Sole) + پاشنه رابر',
      construction: 'دست‌دوز گودیرولت (Goodyear Welted)',
      colors: [
        { name: 'مشکی واکس‌خورده', hex: '#1a1918' },
        { name: 'قهوه‌ای شکلاتی سوخته', hex: '#4a2c1b' },
      ],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴', '۴۵'],
      status: 'published',
      image: 'assets/images/craft-formal.jpeg',
      gallery: ['assets/images/craft-formal.jpeg', 'assets/images/shoes.jpeg'],
      description: 'شاهکار دوخت سنتی با برش‌های دست‌ساز و پرداخت واکس زنبور عسل. مناسب مراسم‌های دیپلماتیک و استایل‌های اداری فاخر.',
    },
    {
      id: 102,
      title: 'دربی بروژ دست‌دوز دیفندر (Defender Brogue Derby)',
      category: 'لاین رسمی و اداری (Formal & Dress)',
      categories: ['لاین رسمی و اداری'],
      price: '۶,۹۵۰,۰۰۰',
      leather: 'چرم گاومیش واکس‌خورده طبیعی با پاتینای دستی',
      sole: 'زیره چرم دوبل گیاهی دست‌کوب مقاوم',
      construction: 'دوخت دور بلیک تقویت‌شده (Blake Rapid)',
      colors: [
        { name: 'عسلی پتینه‌شده', hex: '#a66e38' },
        { name: 'بلوطی تیره', hex: '#3d2415' },
      ],
      sizes: ['۳۹', '۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      image: 'assets/images/shoes.jpeg',
      gallery: ['assets/images/shoes.jpeg', 'assets/images/craft-formal.jpeg'],
      description: 'طراحی وینتیج با سوراخ‌کاری‌های ظریف بروژینگ روی سرپنجه مدالیون و حاشیه‌ها. راحتی استثنایی برای تردد روزمره مدیران.',
    },
    {
      id: 103,
      title: 'اسنیکر لوکس چرم نپا (Minimal Craft Sneaker)',
      category: 'لاین اسپرت و کژوال (Sport & Casual)',
      categories: ['لاین اسپرت و کژوال'],
      price: '۵,۴۰۰,۰۰۰',
      leather: 'چرم طبیعی نپا سوپر سافت ایتالیا با منافذ تنفسی',
      sole: 'کفی ارگونومیک لاتکس طبیعی + زیره ترمو لایت رابر',
      construction: 'کف‌دوخت استروبل (Strobel Comfort Stitch)',
      colors: [
        { name: 'سفید عاجی استخوانی', hex: '#f0ece1' },
        { name: 'مشکی کربن مات', hex: '#222222' },
      ],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: 'published',
      image: 'assets/images/craft-sport.jpg',
      gallery: ['assets/images/craft-sport.jpg'],
      description: 'تلاقی متانت چرم دست‌ساز با ارگونومی کفش‌های مدرن شهری. ایده‌آل برای ست‌های اسمارت‌کژوال و ساعات کاری طولانی.',
    },
    {
      id: 104,
      title: 'نیم‌بوت چلسی اشپالت هریتیج (Heritage Chelsea Boot)',
      category: 'لاین چرم لوکس دست‌دوز (Handmade Atelier)',
      categories: ['لاین چرم لوکس دست‌دوز', 'نیم‌بوت و پوتین کلاسیک'],
      price: '۸,۶۰۰,۰۰۰',
      leather: 'جیر اشپالت طبیعی آب‌گریز اولترا سافت با آستر بز',
      sole: 'ترکیب زیره دانیت (Dainite Studded) و چرم طبیعی',
      construction: 'دست‌دوز گودیرولت ضدنفوذ رطوبت',
      colors: [
        { name: 'شکلاتی خاکی', hex: '#5c4033' },
        { name: 'خاکستری ذغالی', hex: '#2b2b2b' },
      ],
      sizes: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴', '۴۵'],
      status: 'published',
      image: 'assets/images/story-workshop.jpeg',
      gallery: ['assets/images/story-workshop.jpeg', 'assets/images/shoes.jpeg'],
      description: 'چلسی اصیل انگلیسی با کش‌های جانبی باکیفیت و دوام چند ده‌ساله. استقامت بی‌نظیر زیره در شرایط بارانی و یخبندان.',
    },
  ];

  const FALLBACK_CUSTOMERS = [
    {
      id: 101,
      code: 'CUST-101',
      nameFa: 'حاج مصطفی کمالی',
      nameEn: 'Haj Mostafa Kamali',
      shop: 'بنکداری و پخش کمالی (بازار تهران)',
      phone: '09121112233',
      status: 'active',
      directAccess: {
        enabled: true,
        categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
        addModels: [102],
        excludeModels: [],
        duration: '15m',
        deadline: '5d',
      },
    },
    {
      id: 102,
      code: 'CUST-102',
      nameFa: 'مهندس امید شمس',
      nameEn: 'Omid Shams',
      shop: 'بازرگانی کفش امید (تبریز)',
      phone: '09142223344',
      status: 'active',
      directAccess: {
        enabled: true,
        categories: ['لاین رسمی و اداری', 'لاین اسپرت و کژوال', 'لاین چرم لوکس دست‌دوز'],
        addModels: [],
        excludeModels: [],
        duration: 'unlimited',
        deadline: 'none',
      },
    },
  ];

  const FALLBACK_LINKS = [
    {
      id: 'LNK-9081',
      token: 'c8f2a91e',
      recipientFa: 'حاج مصطفی کمالی',
      recipientEn: 'Haj Mostafa Kamali',
      customer: 'بنکداری کمالی (بازار تهران)',
      customerId: 101,
      phone: '09121112233',
      authType: 'otp',
      categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
      addModels: [],
      excludeModels: [104],
      startDeadline: '3d',
      viewingDuration: '15m',
      status: 'active',
    },
    {
      id: 'LNK-9082',
      token: '9b44fa71',
      recipientFa: 'مهندس امید شمس',
      recipientEn: 'Omid Shams',
      customer: 'بازرگانی کفش امید (تبریز)',
      customerId: 102,
      phone: '09142223344',
      authType: 'direct',
      categories: ['لاین رسمی و اداری', 'لاین اسپرت و کژوال', 'لاین چرم لوکس دست‌دوز'],
      addModels: [101],
      excludeModels: [],
      startDeadline: '7d',
      viewingDuration: 'unlimited',
      status: 'active',
    },
    {
      id: 'LNK-9084',
      token: '77fa33d2',
      recipientFa: 'آرتین قوامی',
      recipientEn: 'Artin Ghavami',
      customer: 'بوتیک لوکس آرتین (اصفهان)',
      customerId: 104,
      phone: '09134445566',
      authType: 'direct',
      categories: ['لاین رسمی و اداری'],
      addModels: [],
      excludeModels: [],
      startDeadline: '24h',
      viewingDuration: '10m',
      status: 'expired',
      reason: 'پایان مهلت شروع دسترسی (عدم مراجعه در مهلت ۲۴ ساعته)',
    },
  ];

  // ==========================================================================
  // ۲. سیستم اعلان‌های Toast
  // ==========================================================================
  const DYF_Toast = {
    container: null,
    init() {
      this.container = document.getElementById('dyfToastContainer');
    },
    show({ type = 'info', title = '', message = '', duration = 4000 }) {
      if (!this.container) this.init();
      if (!this.container) return;

      const toast = document.createElement('div');
      toast.className = `dyf-toast dyf-toast-${type}`;

      const iconSvg =
        type === 'success'
          ? '<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
          : type === 'error'
          ? '<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>'
          : '<svg class="dyf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12" y1="8" y2="8"/></svg>';

      toast.innerHTML = `
        ${iconSvg}
        <div class="dyf-toast-content">
          ${title ? `<div class="dyf-toast-title">${title}</div>` : ''}
          <div class="dyf-toast-msg">${message}</div>
        </div>
        <button type="button" class="dyf-toast-close" aria-label="بستن">&times;</button>
      `;

      toast.querySelector('.dyf-toast-close').addEventListener('click', () => {
        this.dismiss(toast);
      });

      this.container.appendChild(toast);

      if (duration > 0) {
        setTimeout(() => this.dismiss(toast), duration);
      }
    },
    dismiss(toast) {
      toast.classList.add('is-hiding');
      setTimeout(() => toast.remove(), 250);
    },
  };

  // ==========================================================================
  // ۳. مدیریت مودال‌ها
  // ==========================================================================
  const DYF_Modal = {
    open(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    },
    close(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },
    init() {
      // بستن با دکمه‌های [data-close] یا کلیک روی پس‌زمینه خارج از باکس
      document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('[data-close]');
        if (closeBtn) {
          const modal = closeBtn.closest('.dyf-modal-backdrop');
          if (modal) {
            this.close(modal.id);
            return;
          }
        }

        const openModal = e.target.closest('.dyf-modal-backdrop.is-open');
        if (openModal) {
          const isInsideCard = e.target.closest('.dyf-modal-card');
          const isInsideLightboxImg = e.target.closest('.dyf-lightbox-img');
          if (!isInsideCard && !isInsideLightboxImg) {
            this.close(openModal.id);
          }
        }
      });

      // بستن مودال با کلید Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const openModal = document.querySelector('.dyf-modal-backdrop.is-open');
          if (openModal) this.close(openModal.id);
        }
      });
    },
  };

  window.DYF_Modal = DYF_Modal;

  // ==========================================================================
  // ۴. کنترلر تجربه کاربری کاتالوگ (CatalogAppController)
  // ==========================================================================
  const CatalogAppController = {
    shoes: [],
    customers: [],
    links: [],
    currentSession: null,
    timerInterval: null,
    timeLeft: 60,
    testCode: '12345',
    searchQuery: '',
    selectedCategory: 'all',
    eligibleShoes: [],

    init() {
      DYF_Toast.init();
      DYF_Modal.init();
      this.loadStoreData();
      this.bindEvents();
      this.handleInitialRouting();
    },

    loadStoreData() {
      try {
        const savedShoes = localStorage.getItem('dyf_admin_shoes_v1');
        this.shoes = savedShoes ? JSON.parse(savedShoes) : [...FALLBACK_SHOES];
      } catch (e) {
        this.shoes = [...FALLBACK_SHOES];
      }

      try {
        const savedCustomers = localStorage.getItem('dyf_admin_customers_v1');
        this.customers = savedCustomers ? JSON.parse(savedCustomers) : [...FALLBACK_CUSTOMERS];
      } catch (e) {
        this.customers = [...FALLBACK_CUSTOMERS];
      }

      try {
        const savedLinks = localStorage.getItem('dyf_admin_links_v1');
        this.links = savedLinks ? JSON.parse(savedLinks) : [...FALLBACK_LINKS];
      } catch (e) {
        this.links = [...FALLBACK_LINKS];
      }
    },

    bindEvents() {
      const phoneInput = document.getElementById('catPhoneInput');
      const sendOtpBtn = document.getElementById('catSendOtpBtn');
      const verifyOtpBtn = document.getElementById('catVerifyOtpBtn');
      const changePhoneBtn = document.getElementById('catChangePhoneBtn');
      const resendOtpBtn = document.getElementById('catResendOtpBtn');
      const otpDigits = document.querySelectorAll('#authStepOtp .dyf-otp-digit');

      // نرمال‌سازی ارقام ورودی شماره همراه
      if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
          e.target.value = toEnglishDigits(e.target.value).replace(/\D/g, '');
        });
        phoneInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.handleSendPhone();
        });
      }

      // ارسال کد یک‌بارمصرف
      if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => this.handleSendPhone());
      }

      // تغییر شماره تلفن و بازگشت به مرحله اول
      if (changePhoneBtn) {
        changePhoneBtn.addEventListener('click', () => {
          const stepOtp = document.getElementById('authStepOtp');
          const stepPhone = document.getElementById('authStepPhone');
          if (stepOtp) stepOtp.classList.add('is-hidden');
          if (stepPhone) stepPhone.classList.remove('is-hidden');
          this.stopTimer();
          if (phoneInput) phoneInput.focus();
        });
      }

      // ارسال مجدد کد
      if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', () => {
          this.startTimer();
          DYF_Toast.show({
            type: 'info',
            title: 'ارسال مجدد کد',
            message: 'کد ۵ رقمی تأیید مجدداً به شماره شما ارسال شد.',
          });
        });
      }

      // مدیریت خانه‌های مجزای ۵ رقمی OTP (دقیقاً مشابه پنل مدیریت)
      otpDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
          const raw = toEnglishDigits(e.target.value).replace(/\D/g, '');
          e.target.value = raw ? raw.slice(-1) : '';
          if (e.target.value) {
            digit.classList.add('is-filled');
            if (index < otpDigits.length - 1) {
              otpDigits[index + 1].focus();
            }
          } else {
            digit.classList.remove('is-filled');
          }
        });

        digit.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !digit.value && index > 0) {
            otpDigits[index - 1].focus();
          }
          if (e.key === 'Enter') {
            this.handleVerifyOtp();
          }
        });

        digit.addEventListener('paste', (e) => {
          e.preventDefault();
          const raw = (e.clipboardData || window.clipboardData).getData('text').trim();
          const pasteData = toEnglishDigits(raw).replace(/\D/g, '');
          if (pasteData.length >= 5) {
            pasteData.slice(0, 5).split('').forEach((char, i) => {
              if (otpDigits[i]) {
                otpDigits[i].value = char;
                otpDigits[i].classList.add('is-filled');
              }
            });
            otpDigits[otpDigits.length - 1].focus();
          }
        });
      });

      // دکمه تأیید کد و ورود
      if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', () => this.handleVerifyOtp());
      }

      // دکمه ورود مستقیم لینک بدون رمز
      const directEnterBtn = document.getElementById('catDirectEnterBtn');
      if (directEnterBtn) {
        directEnterBtn.addEventListener('click', () => {
          if (this.pendingDirectLink) {
            this.startSessionFromLink(this.pendingDirectLink);
          }
        });
      }

      // جست‌وجوی زنده کاتالوگ
      const searchInput = document.getElementById('catSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.renderCatalogGrid();
        });
      }

      // بازنشانی فیلترها
      const resetBtn = document.getElementById('catResetFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.selectedCategory = 'all';
          if (searchInput) searchInput.value = '';
          document.querySelectorAll('.dyf-cat-filter-btn').forEach((btn) => {
            btn.classList.toggle('is-active', btn.getAttribute('data-cat') === 'all');
          });
          this.renderCatalogGrid();
        });
      }

      // خروج از کاتالوگ
      const logoutBtn = document.getElementById('catLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          this.endSession(false);
          window.location.href = 'catalog.html';
        });
      }
    },

    startTimer() {
      this.stopTimer();
      this.timeLeft = 60;
      this.updateTimerDisplay();

      const resendBtn = document.getElementById('catResendOtpBtn');
      if (resendBtn) {
        resendBtn.disabled = true;
        resendBtn.textContent = 'ارسال مجدد کد';
      }

      this.timerInterval = setInterval(() => {
        this.timeLeft -= 1;
        this.updateTimerDisplay();

        if (this.timeLeft <= 0) {
          this.stopTimer();
          if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.textContent = 'ارسال مجدد کد تأیید';
          }
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
      const timerEl = document.getElementById('catOtpCountdown');
      if (!timerEl) return;
      const mins = Math.floor(this.timeLeft / 60);
      const secs = this.timeLeft % 60;
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    handleInitialRouting() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      const titleEl = document.getElementById('catLoginHeaderTitle');
      const subEl = document.getElementById('catLoginHeaderSub');
      const stepPhone = document.getElementById('authStepPhone');
      const stepOtp = document.getElementById('authStepOtp');

      if (!token) {
        // بدون توکن: ورود با شماره تلفن همکاران
        if (titleEl) titleEl.textContent = 'ورود به کاتالوگ خصوصی DYF';
        if (subEl) subEl.textContent = 'ورود با شماره همراه تاییدشده جهت مشاهده لاین‌های مجاز همکاران';
        if (stepPhone) stepPhone.classList.remove('is-hidden');
        if (stepOtp) stepOtp.classList.add('is-hidden');
        return;
      }

      // بررسی توکن
      const link = this.links.find((l) => l.token === token || l.id === token);
      if (!link) {
        this.showTokenError('لینک اختصاصی نامعتبر است', 'توکن درج‌شده در نشانی وب یافت نشد یا تغییر یافته است. لطفاً لینک صحیح را مجدداً وارد فرمایید.');
        return;
      }

      if (link.status === 'expired' || link.status === 'deactivated') {
        const desc = link.reason || (link.status === 'expired' ? 'مهلت آغازین ورود برای این لینک به پایان رسیده است.' : 'این لینک توسط مدیریت کارگاه غیرفعال شده است.');
        this.showTokenError('اعتبار لینک به پایان رسیده است', desc);
        return;
      }

      // لینک معتبر است
      if (titleEl) titleEl.textContent = 'ورود به کاتالوگ خصوصی DYF';
      if (subEl) subEl.textContent = 'ورود با شماره همراه تاییدشده جهت مشاهده لاین‌های مجاز همکاران';

      if (link.authType === 'direct') {
        // ورود مستقیم بدون رمز
        this.pendingDirectLink = link;
        if (stepPhone) stepPhone.classList.add('is-hidden');
        if (stepOtp) stepOtp.classList.add('is-hidden');
        document.getElementById('catDirectLinkEntryBox').style.display = 'block';
      } else {
        // ورود نیازمند شماره تلفن و تایید OTP
        this.pendingOtpLink = link;
        const phoneLabel = document.getElementById('catPhoneInputLabel');
        if (phoneLabel) phoneLabel.textContent = `شماره تلفن همراه همکار (${link.recipientFa})`;
        const phoneInput = document.getElementById('catPhoneInput');
        if (phoneInput && link.phone) {
          phoneInput.value = link.phone;
        }
        if (stepPhone) stepPhone.classList.remove('is-hidden');
        if (stepOtp) stepOtp.classList.add('is-hidden');
      }
    },

    showTokenError(title, desc) {
      const errorBox = document.getElementById('catTokenErrorBox');
      const errorTitle = document.getElementById('catTokenErrorTitle');
      const errorDesc = document.getElementById('catTokenErrorDesc');

      if (errorTitle) errorTitle.textContent = title;
      if (errorDesc) errorDesc.textContent = desc;
      if (errorBox) errorBox.style.display = 'block';

      document.getElementById('authStepPhone')?.classList.add('is-hidden');
      document.getElementById('authStepOtp')?.classList.add('is-hidden');
      const directBox = document.getElementById('catDirectLinkEntryBox');
      if (directBox) directBox.style.display = 'none';
    },

    handleSendPhone() {
      const phoneInput = document.getElementById('catPhoneInput');
      const sendOtpBtn = document.getElementById('catSendOtpBtn');
      const phone = toEnglishDigits(phoneInput ? phoneInput.value.trim() : '').replace(/\D/g, '');
      if (phoneInput) phoneInput.value = phone;

      const phoneRegex = /^09[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        if (phoneInput) phoneInput.classList.add('dyf-input-error');
        DYF_Toast.show({
          type: 'error',
          title: 'شماره نامعتبر',
          message: 'لطفاً یک شماره موبایل معتبر ۱۱ رقمی (مثال: 09121112233) وارد کنید.',
        });
        phoneInput?.focus();
        return;
      }

      if (phoneInput) phoneInput.classList.remove('dyf-input-error');

      if (this.pendingOtpLink) {
        // احراز هویت لینک دارای OTP
        if (this.pendingOtpLink.phone && this.pendingOtpLink.phone !== phone) {
          DYF_Toast.show({
            type: 'error',
            title: 'شماره تلفن غیرمجاز',
            message: 'شماره واردشده با شماره مجاز تعریف‌شده برای این لینک اختصاصی مطابقت ندارد.',
          });
          return;
        }
        this.verifiedPhone = phone;
      } else {
        // ورود همکاران ثبت‌شده
        let customer = this.customers.find((c) => c.phone === phone);
        if (!customer) {
          // برای دسترسی راحت تستی در صورت تایپ شماره دیگر، کاربر همکار پیش‌فرض تنظیم می‌شود
          customer = {
            id: 101,
            code: 'CUST-101',
            nameFa: 'همکار گرامی',
            nameEn: 'Valued Partner',
            phone: phone,
            status: 'active',
            directAccess: {
              enabled: true,
              categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز', 'لاین اسپرت و کژوال'],
              addModels: [],
              excludeModels: [],
              duration: 'unlimited',
              deadline: 'none',
            },
          };
        }

        if (customer.status !== 'active') {
          DYF_Toast.show({
            type: 'error',
            title: 'حساب مسدود است',
            message: 'حساب کاربری شما موقتاً غیرفعال شده است. لطفاً با دفتر کارگاه تماس حاصل فرمایید.',
          });
          return;
        }

        this.authenticatedCustomer = customer;
        this.verifiedPhone = phone;
      }

      if (sendOtpBtn) sendOtpBtn.classList.add('is-loading');

      setTimeout(() => {
        if (sendOtpBtn) sendOtpBtn.classList.remove('is-loading');

        const stepPhone = document.getElementById('authStepPhone');
        const stepOtp = document.getElementById('authStepOtp');
        const otpPhoneDisplay = document.getElementById('catOtpPhoneDisplay');
        const otpDigits = document.querySelectorAll('#authStepOtp .dyf-otp-digit');

        if (otpPhoneDisplay) otpPhoneDisplay.textContent = phone;
        if (stepPhone) stepPhone.classList.add('is-hidden');
        if (stepOtp) stepOtp.classList.remove('is-hidden');

        otpDigits.forEach((d) => {
          d.value = '';
          d.classList.remove('is-filled', 'dyf-input-error');
        });

        if (otpDigits[0]) otpDigits[0].focus();
        this.startTimer();

        DYF_Toast.show({
          type: 'success',
          title: 'کد تأیید ارسال شد',
          message: 'کد ۵ رقمی تأیید برای شماره شما ارسال شد.',
          duration: 3500,
        });
      }, 500);
    },

    handleVerifyOtp() {
      const otpDigits = document.querySelectorAll('#authStepOtp .dyf-otp-digit');
      const verifyOtpBtn = document.getElementById('catVerifyOtpBtn');
      const digits = Array.from(otpDigits).map((d) => toEnglishDigits(d.value).replace(/\D/g, '').trim());
      const code = digits.join('');

      if (code.length < 5) {
        DYF_Toast.show({
          type: 'warning',
          title: 'کد ناقص است',
          message: 'لطفاً هر ۵ رقم کد تأیید را وارد کنید.',
        });
        return;
      }

      if (verifyOtpBtn) verifyOtpBtn.classList.add('is-loading');

      setTimeout(() => {
        if (verifyOtpBtn) verifyOtpBtn.classList.remove('is-loading');

        if (code === this.testCode) {
          this.stopTimer();
          DYF_Toast.show({
            type: 'success',
            title: 'احراز هویت موفق',
            message: 'خوش آمدید! در حال انتقال به کاتالوگ خصوصی DYF...',
            duration: 2000,
          });

          setTimeout(() => {
            if (this.pendingOtpLink) {
              this.startSessionFromLink(this.pendingOtpLink);
            } else if (this.authenticatedCustomer) {
              this.startSessionFromCustomer(this.authenticatedCustomer);
            }
          }, 400);
        } else {
          otpDigits.forEach((d) => d.classList.add('dyf-input-error'));

          DYF_Toast.show({
            type: 'error',
            title: 'کد تأیید نادرست است',
            message: `کد واردشده نامعتبر است. کد صحیح آزمایشی: ${this.testCode}`,
          });

          setTimeout(() => {
            otpDigits.forEach((d) => d.classList.remove('dyf-input-error'));
          }, 1500);
        }
      }, 500);
    },

    startSessionFromLink(link) {
      const session = {
        mode: 'link',
        id: link.id,
        token: link.token,
        recipientFa: link.recipientFa,
        recipientEn: link.recipientEn,
        customer: link.customer,
        categories: link.categories || [],
        addModels: link.addModels || [],
        excludeModels: link.excludeModels || [],
        duration: link.viewingDuration || 'unlimited',
        startTimestamp: Date.now(),
      };

      // افزایش شمارنده بازدید
      link.views = (link.views || 0) + 1;
      try {
        localStorage.setItem('dyf_admin_links_v1', JSON.stringify(this.links));
      } catch (e) {}

      this.launchCatalogSession(session);
    },

    startSessionFromCustomer(cust) {
      const da = cust.directAccess || {};
      const session = {
        mode: 'customer',
        id: cust.code,
        recipientFa: cust.nameFa,
        recipientEn: cust.nameEn,
        customer: cust.shop || cust.nameFa,
        categories: da.categories || [],
        addModels: da.addModels || [],
        excludeModels: da.excludeModels || [],
        duration: da.duration || 'unlimited',
        startTimestamp: Date.now(),
      };

      this.launchCatalogSession(session);
    },

    launchCatalogSession(session) {
      // بررسی وجود تایمر قبلی ذخیره‌شده برای این نشست در صورت رفرش
      const sessionKey = `dyf_cat_session_${session.id || session.token}`;
      const savedSession = localStorage.getItem(sessionKey);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.startTimestamp) {
            session.startTimestamp = parsed.startTimestamp;
          }
        } catch (e) {}
      } else {
        localStorage.setItem(sessionKey, JSON.stringify(session));
      }

      this.currentSession = session;

      // پنهان‌سازی لاگین و نمایش کاتالوگ
      document.getElementById('catLoginView').style.display = 'none';
      const appView = document.getElementById('catAppView');
      appView.style.display = 'flex';

      // تنظیم اطلاعات هدر و خوش‌آمدگویی (فقط نام مشتری بدون نام شرکت یا پرانتز)
      const greetingEl = document.getElementById('catRecipientGreetingName');
      const badgeText = document.getElementById('catAccessScopeBadgeText');

      if (greetingEl) {
        const rawName = session.recipientFa || 'همکار گرامی';
        const cleanName = rawName.replace(/\(.*?\)/g, '').trim();
        greetingEl.textContent = cleanName || 'همکار گرامی';
      }
      if (badgeText) {
        badgeText.textContent =
          session.mode === 'link'
            ? `دسترسی اختصاصی با لینک ${session.id} | احراز هویت‌شده`
            : `دسترسی مستقیم بنکداری | ورود پیامکی ${session.recipientFa}`;
      }

      // محاسبه مدل‌های مجاز بر اساس فرمول تجاری
      this.calculateEligibleShoes();

      // تنظیم و آغاز تایمر مشاهده
      this.initSessionTimer();

      // رندر تب‌های دسته‌بندی و شبکه محصولات
      this.renderCategoryTabs();
      this.renderCatalogGrid();

      DYF_Toast.show({
        type: 'success',
        title: 'خوش آمدید',
        message: `کاتالوگ خصوصی آتلیه DYF برای شما بارگذاری گردید.`,
      });
    },

    calculateEligibleShoes() {
      const s = this.currentSession;
      const published = this.shoes.filter((shoe) => shoe.status === 'published');

      // فرمول کاتالوگ: (منتشرشده در دسته‌های مجاز + مدل‌های افزوده دستی) - مدل‌های مستثنا
      this.eligibleShoes = published.filter((shoe) => {
        // ۱. استثناکردن قطعی اولویت دارد
        if ((s.excludeModels || []).includes(shoe.id)) return false;

        // ۲. افزودن مدل‌های خاص
        if ((s.addModels || []).includes(shoe.id)) return true;

        // ۳. تطابق با دسته‌بندی‌های مجاز
        const shoeCats = shoe.categories || [shoe.category];
        const hasMatchingCat = (s.categories || []).some((permCat) =>
          shoeCats.some((sc) => sc.includes(permCat) || permCat.includes(sc))
        );

        return hasMatchingCat;
      });
    },

    initSessionTimer() {
      const s = this.currentSession;
      const timerPill = document.getElementById('catSessionTimerPill');
      const displayEl = document.getElementById('catCountdownDisplay');

      if (!s || s.duration === 'unlimited') {
        if (timerPill) {
          timerPill.style.display = 'inline-flex';
          timerPill.innerHTML = `<span>دسترسی نامحدود همکار</span>`;
          timerPill.classList.remove('is-warning');
        }
        return;
      }

      if (timerPill) timerPill.style.display = 'inline-flex';

      // محاسبه مدت زمان به ثانیه
      let totalSeconds = 15 * 60; // پیش‌فرض ۱۵ دقیقه
      if (s.duration === '10m') totalSeconds = 10 * 60;
      else if (s.duration === '15m') totalSeconds = 15 * 60;
      else if (s.duration === '30m') totalSeconds = 30 * 60;
      else if (s.duration === '1h') totalSeconds = 60 * 60;
      else if (s.duration === '2h') totalSeconds = 120 * 60;
      else if (s.duration === '24h') totalSeconds = 24 * 3600;

      const elapsedSeconds = Math.floor((Date.now() - s.startTimestamp) / 1000);
      let remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

      const updateDisplay = () => {
        if (remainingSeconds <= 0) {
          clearInterval(this.timerInterval);
          this.endSession(true);
          return;
        }

        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (displayEl) displayEl.textContent = formatted;

        if (remainingSeconds < 120) {
          timerPill?.classList.add('is-warning');
        } else {
          timerPill?.classList.remove('is-warning');
        }

        remainingSeconds -= 1;
      };

      updateDisplay();
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(updateDisplay, 1000);
    },

    endSession(isExpired = false) {
      if (this.timerInterval) clearInterval(this.timerInterval);

      if (this.currentSession) {
        const sessionKey = `dyf_cat_session_${this.currentSession.id || this.currentSession.token}`;
        localStorage.removeItem(sessionKey);
      }

      document.getElementById('catAppView').style.display = 'none';

      if (isExpired) {
        const expView = document.getElementById('catExpiredView');
        if (expView) expView.style.display = 'flex';
      }
    },

    renderCategoryTabs() {
      const container = document.getElementById('catCategoryFilterTabs');
      if (!container) return;

      // جمع‌آوری دسته‌بندی‌های یکتا میان کفش‌های مجاز
      const catSet = new Set();
      this.eligibleShoes.forEach((shoe) => {
        const cats = shoe.categories || [shoe.category];
        cats.forEach((c) => catSet.add(c));
      });

      const uniqueCats = Array.from(catSet);

      let html = `<button type="button" class="dyf-cat-filter-btn is-active" data-cat="all">همه مدل‌های مجاز (${this.eligibleShoes.length})</button>`;
      uniqueCats.forEach((cat) => {
        const count = this.eligibleShoes.filter((s) => (s.categories || [s.category]).includes(cat)).length;
        html += `<button type="button" class="dyf-cat-filter-btn" data-cat="${cat}">${cat} (${count})</button>`;
      });

      container.innerHTML = html;

      container.querySelectorAll('.dyf-cat-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.dyf-cat-filter-btn').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          this.selectedCategory = btn.getAttribute('data-cat') || 'all';
          this.renderCatalogGrid();
        });
      });
    },

    getFilteredShoes() {
      return this.eligibleShoes.filter((shoe) => {
        if (this.searchQuery) {
          const matchTitle = (shoe.title || '').toLowerCase().includes(this.searchQuery);
          const matchLeather = (shoe.leather || '').toLowerCase().includes(this.searchQuery);
          const matchSole = (shoe.sole || '').toLowerCase().includes(this.searchQuery);
          const matchDesc = (shoe.description || '').toLowerCase().includes(this.searchQuery);
          const matchId = String(shoe.id).includes(this.searchQuery);
          if (!matchTitle && !matchLeather && !matchSole && !matchDesc && !matchId) return false;
        }

        if (this.selectedCategory !== 'all') {
          const shoeCats = shoe.categories || [shoe.category];
          if (!shoeCats.includes(this.selectedCategory)) return false;
        }

        return true;
      });
    },

    renderCatalogGrid() {
      const grid = document.getElementById('catShoesGrid');
      const emptyState = document.getElementById('catEmptyState');
      const countBadge = document.getElementById('catModelsCountBadge');

      const filtered = this.getFilteredShoes();

      if (countBadge) countBadge.textContent = `${filtered.length} مدل قابل مشاهده`;

      if (!filtered.length) {
        if (grid) grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      if (grid) {
        grid.style.display = 'grid';
        grid.innerHTML = filtered.map((shoe) => this.renderShoeCardHtml(shoe)).join('');
        this.bindCardEvents(grid);
      }
    },

    renderShoeCardHtml(shoe) {
      const primaryImage = shoe.image || (shoe.gallery && shoe.gallery[0]) || 'assets/images/craft-formal.jpeg';
      const categories = shoe.categories || (shoe.category ? [shoe.category] : ['کفش چرم دست‌دوز']);
      const categoriesHtml = categories
        .map((c) => `<span class="dyf-category-pill" style="font-size: 0.72rem; padding: 0.15rem 0.55rem; background: rgba(61, 36, 21, 0.45); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); color: var(--gold-light);">${c}</span>`)
        .join('');

      const colorCount = (shoe.colors || []).length;
      const sizeCount = (shoe.sizes || []).length;

      return `
        <article class="dyf-cat-card" data-shoe-id="${shoe.id}" title="مشاهده جزئیات مدل">
          <div class="dyf-cat-media">
            <img src="${primaryImage}" alt="${shoe.title}" loading="lazy">
            <div class="dyf-cat-code-badge">DYF-${shoe.id}</div>
          </div>

          <div class="dyf-cat-body">
            <h3 class="dyf-cat-title">${shoe.title}</h3>
            <div class="dyf-cat-categories">${categoriesHtml}</div>

            <div class="dyf-cat-specs-row">
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span>تعداد رنگ:</span>
                <span style="color: var(--text-main); font-weight: 700;">${colorCount}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span>تعداد سایز:</span>
                <span style="color: var(--gold-light); font-weight: 700;">${sizeCount}</span>
              </div>
            </div>

            <div class="dyf-cat-footer-actions">
              <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-view-dossier" data-shoe-id="${shoe.id}" style="width: 100%; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>مشاهده جزئیات</span>
              </button>
            </div>
          </div>
        </article>
      `;
    },

    bindCardEvents(container) {
      // کلیک روی کل کارت برای مشاهده شناسنامه و جزئیات
      container.querySelectorAll('.dyf-cat-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('button, a')) return;
          const id = parseInt(card.getAttribute('data-shoe-id'), 10);
          if (id) this.openShoeDossier(id);
        });
      });

      // کلیک روی دکمه مشاهده جزئیات
      container.querySelectorAll('.js-view-dossier').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-shoe-id'), 10);
          if (id) this.openShoeDossier(id);
        });
      });
    },

    openShoeDossier(shoeId) {
      const shoe = this.shoes.find((s) => s.id === shoeId);
      if (!shoe) return;

      const titleEl = document.getElementById('dossierModalTitle');
      const shoeTitleEl = document.getElementById('dossierShoeTitle');
      const catPillEl = document.getElementById('dossierCategoryPill');
      const descEl = document.getElementById('dossierShoeDesc');
      const mainImg = document.getElementById('dossierMainImage');
      const mainImgWrap = document.getElementById('dossierMainImageWrap');
      const thumbsWrap = document.getElementById('dossierThumbnailsWrap');
      const sizesEl = document.getElementById('dossierSizes');
      const colorsEl = document.getElementById('dossierColors');

      if (titleEl) titleEl.textContent = `شناسنامه مدل کفش (DYF-${shoe.id})`;
      if (shoeTitleEl) shoeTitleEl.textContent = shoe.title;
      if (catPillEl) {
        const cat = shoe.category || (shoe.categories && shoe.categories[0]) || 'چرم طبیعی کارگاه';
        catPillEl.innerHTML = `<span class="dyf-badge dyf-badge-active">${cat}</span>`;
      }
      if (descEl) descEl.textContent = shoe.description || 'تولید دست‌دوز با کیفیت صادراتی و متریال درجه یک طبیعی.';

      const primaryImage = shoe.image || (shoe.gallery && shoe.gallery[0]) || 'assets/images/craft-formal.jpeg';
      if (mainImg) mainImg.src = primaryImage;

      // کلیک تصویر اصلی برای نمایش لایت‌باکس تمام‌صفحه
      if (mainImgWrap) {
        mainImgWrap.onclick = () => {
          const currentSrc = mainImg ? mainImg.src : primaryImage;
          window.openShoeLightbox(currentSrc, `${shoe.title} (DYF-${shoe.id})`);
        };
      }

      // رندر ریزتصاویر
      const gallery = shoe.gallery && shoe.gallery.length ? shoe.gallery : [primaryImage, 'assets/images/shoes.jpeg'];
      if (thumbsWrap) {
        thumbsWrap.innerHTML = gallery
          .map(
            (src, i) => `
            <div class="dyf-thumb-item ${i === 0 ? 'is-active' : ''}" style="width: 58px; height: 58px; border-radius: var(--r-sm); overflow: hidden; border: 2px solid ${i === 0 ? 'var(--gold-primary)' : 'var(--border-subtle)'}; cursor: pointer; flex-shrink: 0;" data-src="${src}">
              <img src="${src}" alt="ریزتصویر" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          `
          )
          .join('');

        thumbsWrap.querySelectorAll('.dyf-thumb-item').forEach((thumb) => {
          thumb.addEventListener('click', () => {
            thumbsWrap.querySelectorAll('.dyf-thumb-item').forEach((t) => (t.style.borderColor = 'var(--border-subtle)'));
            thumb.style.borderColor = 'var(--gold-primary)';
            if (mainImg) mainImg.src = thumb.getAttribute('data-src');
          });
        });
      }

      if (sizesEl) {
        const sizes = shoe.sizes || ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'];
        sizesEl.textContent = sizes.join('، ');
      }
      if (colorsEl) {
        const colors = shoe.colors || [{ name: 'مشکی' }, { name: 'قهوه‌ای' }];
        colorsEl.textContent = colors.map((c) => (typeof c === 'string' ? c : c.name)).join('، ');
      }

      DYF_Modal.open('modalShoeDossier');
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    CatalogAppController.init();
  });
})();
