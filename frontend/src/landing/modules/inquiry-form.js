export function normalizeDigits(str) {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(persianDigits[i], String(i)).replaceAll(arabicDigits[i], String(i));
  }
  return res.trim();
}

export function validateIranPhoneNumber(phone) {
  const normalized = normalizeDigits(phone).replace(/\s+/g, '').replace(/^-+/, '');

  const regex = /^(?:(?:\+?98)|0)?9\d{9}$/;
  return regex.test(normalized);
}

export function formatPhoneNumberForApi(phone) {
  let normalized = normalizeDigits(phone).replace(/[\s\-+]/g, '');
  if (normalized.startsWith('989')) {
    normalized = '0' + normalized.slice(2);
  } else if (normalized.startsWith('9') && normalized.length === 10) {
    normalized = '0' + normalized;
  }
  return normalized;
}

export function initInquiryForm() {
  const inquiryForm = document.getElementById('inquiryForm');
  const formSuccessBanner = document.getElementById('formSuccessBanner');
  const resetFormBtn = document.getElementById('resetFormBtn');
  const submitBtn = inquiryForm?.querySelector('.inquiry-submit-btn');

  if (!inquiryForm) return;

  const storeNameInput = document.getElementById('storeName');
  const cityMarketInput = document.getElementById('cityMarket');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const linePreferenceSelect = document.getElementById('linePreference');

  const storeNameError = document.getElementById('storeNameError');
  const cityMarketError = document.getElementById('cityMarketError');
  const phoneNumberError = document.getElementById('phoneNumberError');
  const generalErrorBanner = document.getElementById('inquiryGeneralError');
  const errorBannerText = document.getElementById('inquiryErrorText');
  const errorWaLink = document.getElementById('inquiryErrorWaLink');
  const retryBtn = document.getElementById('inquiryRetryBtn');

  function clearErrors() {
    [storeNameInput, cityMarketInput, phoneNumberInput].forEach((input) => {
      if (input) {
        input.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
      }
    });

    [storeNameError, cityMarketError, phoneNumberError].forEach((errEl) => {
      if (errEl) {
        errEl.classList.remove('is-visible');
        errEl.textContent = '';
      }
    });

    if (generalErrorBanner) {
      generalErrorBanner.classList.remove('is-visible');
    }
  }

  function setFieldError(input, errorEl, message) {
    if (input) {
      input.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
  }

  [storeNameInput, cityMarketInput, phoneNumberInput].forEach((input) => {
    input?.addEventListener('input', () => {
      if (input.classList.contains('has-error')) {
        input.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
      }
      const errEl = document.getElementById(input.id + 'Error');
      if (errEl) {
        errEl.classList.remove('is-visible');
        errEl.textContent = '';
      }
      if (generalErrorBanner) {
        generalErrorBanner.classList.remove('is-visible');
      }
    });
  });

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      inquiryForm.requestSubmit();
    });
  }

  inquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const storeName = storeNameInput?.value.trim() || '';
    const cityMarket = cityMarketInput?.value.trim() || '';
    const rawPhone = phoneNumberInput?.value.trim() || '';
    const linePreference = linePreferenceSelect?.value || 'both';

    let hasValidationError = false;
    let firstInvalidInput = null;

    if (!storeName || storeName.length < 2) {
      setFieldError(storeNameInput, storeNameError, 'لطفاً نام فروشگاه یا خریدار را وارد کنید (حداقل ۲ حرف).');
      hasValidationError = true;
      firstInvalidInput = firstInvalidInput || storeNameInput;
    }

    if (!cityMarket || cityMarket.length < 2) {
      setFieldError(cityMarketInput, cityMarketError, 'لطفاً شهر و بازار فعالیت خود را وارد کنید.');
      hasValidationError = true;
      firstInvalidInput = firstInvalidInput || cityMarketInput;
    }

    if (!rawPhone || !validateIranPhoneNumber(rawPhone)) {
      setFieldError(
        phoneNumberInput,
        phoneNumberError,
        'شماره تماس باید یک شماره موبایل معتبر ۱۱ رقمی باشد (مثال: ۰۹۱۲۳۴۵۶۷۸۹).'
      );
      hasValidationError = true;
      firstInvalidInput = firstInvalidInput || phoneNumberInput;
    }

    if (hasValidationError) {
      firstInvalidInput?.focus();
      return;
    }

    const payload = {
      store_name: storeName,
      city_market: cityMarket,
      phone_number: formatPhoneNumberForApi(rawPhone),
      line_preference: linePreference,
      source: 'landing_page',
    };

    const lineNames = {
      both: 'هر دو لاین (رسمی + اسپرت)',
      executive: 'لاین رسمی و چرمی (FORMAL)',
      sneaker: 'لاین اسپرت و کژوال (SPORT & CASUAL)',
    };
    const waText = encodeURIComponent(
      `سلام، درخواست استعلام کاتالوگ عمده DYF:\nنام فروشگاه: ${storeName}\nشهر: ${cityMarket}\nتلفن: ${payload.phone_number}\nلاین موردنظر: ${lineNames[linePreference] || linePreference}`
    );
    if (errorWaLink) {
      errorWaLink.href = `https://wa.me/989153177455?text=${waText}`;
    }

    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'در حال ثبت اطلاعات...';
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${(import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api/v1/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 201) {
        inquiryForm.style.display = 'none';
        if (formSuccessBanner) {
          formSuccessBanner.classList.add('active');
          formSuccessBanner.focus?.();
        }
        return;
      }

      let errorMsg = `خطای سرور (${response.status}): سرویس ثبت استعلام در حال حاضر در دسترس نیست.`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message || errorData.message) {
          errorMsg = errorData.error?.message || errorData.message;
        }
      } catch {
      }

      showGeneralError(
        'خطا در ثبت اطلاعات در سرور',
        errorMsg + ' برای ثبت سریع استعلام، می‌توانید مشخصات را مستقیماً از طریق واتساپ ارسال فرمایید.'
      );
    } catch (err) {
      const isAbort = err.name === 'AbortError';
      const networkMsg = isAbort
        ? 'مهلت ارتباط با سرور به پایان رسید (Timeout). لطفاً اتصال شبکه خود را بررسی کنید.'
        : 'امکان برقراری ارتباط با سرور فراهم نشد. لطفاً اتصال اینترنت خود را بررسی کنید یا مستقیماً در واتساپ پیام بفرستید.';

      showGeneralError('عدم دسترسی به شبکه یا سرور', networkMsg);
    } finally {
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || 'ثبت درخواست همکاری';
      }
    }
  });

  function showGeneralError(title, text) {
    if (generalErrorBanner && errorBannerText) {
      const titleEl = generalErrorBanner.querySelector('.inquiry-error-title');
      if (titleEl) titleEl.textContent = title;
      errorBannerText.textContent = text;
      generalErrorBanner.classList.add('is-visible');
      generalErrorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      clearErrors();
      if (formSuccessBanner) {
        formSuccessBanner.classList.remove('active');
      }
      inquiryForm.reset();
      inquiryForm.style.display = 'flex';
      storeNameInput?.focus();
    });
  }
}
