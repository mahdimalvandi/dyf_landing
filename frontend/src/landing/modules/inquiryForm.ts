/**
 * DYF Landing — B2B Inquiry Form Controller (FE-009)
 * Full Persian input normalization (converting Persian/Arabic numerals to standard digits),
 * strict Iranian mobile number validation (09xxxxxxxxx), inline accessible error messages,
 * network offline resilience (LocalStorage draft & pending queue), and luxury status transitions.
 */

export interface InquiryData {
  storeName: string;
  cityMarket: string;
  phoneNumber: string;
  linePreference: string;
}

export interface ValidationErrors {
  storeName?: string;
  cityMarket?: string;
  phoneNumber?: string;
  linePreference?: string;
}

const DRAFT_STORAGE_KEY = 'dyf_inquiry_draft_v1';
const OFFLINE_QUEUE_KEY = 'dyf_offline_inquiries_v1';

/**
 * Converts Persian (۰-۹) and Arabic (٠-٩) digits to standard ASCII (0-9)
 */
export function toEnglishDigits(str: string): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), String(i));
    result = result.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }
  return result;
}

/**
 * Validates B2B inquiry inputs according to Iranian mobile carrier standards and business requirements.
 */
export function validateInquiryForm(data: InquiryData): {
  isValid: boolean;
  errors: ValidationErrors;
  normalizedPhone: string;
} {
  const errors: ValidationErrors = {};

  // 1. Store / Buyer Name
  const trimmedName = data.storeName ? data.storeName.trim() : '';
  if (!trimmedName || trimmedName.length < 2) {
    errors.storeName = 'لطفاً نام فروشگاه یا نام خریدار را وارد کنید (حداقل ۲ حرف)';
  }

  // 2. City & Market
  const trimmedCity = data.cityMarket ? data.cityMarket.trim() : '';
  if (!trimmedCity || trimmedCity.length < 2) {
    errors.cityMarket = 'لطفاً شهر و بازار محل فعالیت را وارد کنید';
  }

  // 3. Iranian Mobile Number
  const rawPhone = data.phoneNumber ? data.phoneNumber.trim() : '';
  const cleanPhone = toEnglishDigits(rawPhone.replace(/[\s\-_()]/g, ''));

  let normalizedPhone = cleanPhone;
  if (normalizedPhone.startsWith('+98')) {
    normalizedPhone = '0' + normalizedPhone.slice(3);
  } else if (normalizedPhone.startsWith('0098')) {
    normalizedPhone = '0' + normalizedPhone.slice(4);
  } else if (normalizedPhone.length === 10 && normalizedPhone.startsWith('9')) {
    normalizedPhone = '0' + normalizedPhone;
  }

  if (!/^09\d{9}$/.test(normalizedPhone)) {
    errors.phoneNumber = 'شماره همراه باید ۱۱ رقم بوده و با ۰۹ شروع شود (مثال: ۰۹۱۲۳۴۵۶۷۸۹)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedPhone,
  };
}

export function initInquiryForm(): void {
  const inquiryForm = document.getElementById('inquiryForm') as HTMLFormElement | null;
  const formSuccessBanner = document.getElementById('formSuccessBanner');
  const resetFormBtn = document.getElementById('resetFormBtn');

  if (!inquiryForm) return;

  const storeNameInput = document.getElementById('storeName') as HTMLInputElement | null;
  const cityMarketInput = document.getElementById('cityMarket') as HTMLInputElement | null;
  const phoneInput = document.getElementById('phoneNumber') as HTMLInputElement | null;
  const linePrefSelect = document.getElementById('linePreference') as HTMLSelectElement | null;
  const submitBtn = inquiryForm.querySelector<HTMLButtonElement>('.inquiry-submit-btn');

  // 1. Restore draft if available
  try {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      const parsed: Partial<InquiryData> = JSON.parse(savedDraft);
      if (storeNameInput && parsed.storeName) storeNameInput.value = parsed.storeName;
      if (cityMarketInput && parsed.cityMarket) cityMarketInput.value = parsed.cityMarket;
      if (phoneInput && parsed.phoneNumber) phoneInput.value = parsed.phoneNumber;
      if (linePrefSelect && parsed.linePreference) linePrefSelect.value = parsed.linePreference;
    }
  } catch {
    // Ignore storage parse errors
  }

  // 2. Persist draft on user input
  const persistDraft = () => {
    try {
      const draft: InquiryData = {
        storeName: storeNameInput?.value || '',
        cityMarket: cityMarketInput?.value || '',
        phoneNumber: phoneInput?.value || '',
        linePreference: linePrefSelect?.value || 'both',
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage quota or private browsing mode
    }
  };

  [storeNameInput, cityMarketInput, phoneInput, linePrefSelect].forEach((el) => {
    if (el) {
      el.addEventListener('input', () => {
        clearFieldError(el);
        persistDraft();
      });
    }
  });

  // Helper: Display error message under field
  const showFieldError = (inputEl: HTMLElement | null, message: string) => {
    if (!inputEl) return;
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-invalid', 'true');

    const group = inputEl.closest('.inquiry-form-group');
    if (!group) return;

    let errorEl = group.querySelector<HTMLElement>('.inquiry-error-msg');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'inquiry-error-msg';
      errorEl.setAttribute('role', 'alert');
      group.appendChild(errorEl);
    }
    errorEl.textContent = message;
  };

  // Helper: Clear error message from field
  const clearFieldError = (inputEl: HTMLElement | null) => {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid');
    inputEl.removeAttribute('aria-invalid');

    const group = inputEl.closest('.inquiry-form-group');
    if (!group) return;

    const errorEl = group.querySelector<HTMLElement>('.inquiry-error-msg');
    if (errorEl) {
      errorEl.remove();
    }
  };

  // 3. Handle Form Submit
  inquiryForm.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    const data: InquiryData = {
      storeName: storeNameInput?.value || '',
      cityMarket: cityMarketInput?.value || '',
      phoneNumber: phoneInput?.value || '',
      linePreference: linePrefSelect?.value || 'both',
    };

    const validation = validateInquiryForm(data);

    if (!validation.isValid) {
      if (validation.errors.storeName) showFieldError(storeNameInput, validation.errors.storeName);
      if (validation.errors.cityMarket) showFieldError(cityMarketInput, validation.errors.cityMarket);
      if (validation.errors.phoneNumber) showFieldError(phoneInput, validation.errors.phoneNumber);

      // Focus the first invalid element
      if (validation.errors.storeName && storeNameInput) storeNameInput.focus();
      else if (validation.errors.cityMarket && cityMarketInput) cityMarketInput.focus();
      else if (validation.errors.phoneNumber && phoneInput) phoneInput.focus();
      return;
    }

    // Set UI to loading state
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      submitBtn.textContent = 'در حال ثبت و هماهنگی...';
    }

    try {
      // Simulate realistic atelier network latency (400ms - 800ms)
      await new Promise((res) => setTimeout(res, 550));

      const payload = {
        ...data,
        phoneNumber: validation.normalizedPhone,
        submittedAt: new Date().toISOString(),
      };

      // If offline, queue locally
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        try {
          const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
          queue.push(payload);
          localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        } catch {
          // ignore
        }
      }

      // Clear draft on successful submission
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }

      // Transition to success screen
      inquiryForm.style.display = 'none';
      if (formSuccessBanner) {
        formSuccessBanner.classList.add('active');
        formSuccessBanner.focus();
      }
    } catch (err) {
      console.error('[DYF Inquiry Form] Submission error:', err);
      alert('خطایی در ارتباط رخ داد. لطفاً مجدداً تلاش کنید یا از طریق واتساپ پیام ارسال نمایید.');
    } finally {
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        if (originalBtnText) submitBtn.textContent = originalBtnText;
      }
    }
  });

  // 4. Handle Reset
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      if (formSuccessBanner) {
        formSuccessBanner.classList.remove('active');
      }
      inquiryForm.reset();
      [storeNameInput, cityMarketInput, phoneInput].forEach((el) => clearFieldError(el));
      inquiryForm.style.display = 'flex';
      if (storeNameInput) storeNameInput.focus();
    });
  }
}
