export function toEnglishDigits(str) {
  if (!str) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = String(str);
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(farsiDigits[i], String(i)).replaceAll(arabicDigits[i], String(i));
  }
  return res;
}

export function validateIranPhoneNumber(phone) {
  const normalized = toEnglishDigits(phone).replace(/\s+/g, '').replace(/^-+/, '');
  const regex = /^(?:(?:\+?98)|0)?9\d{9}$/;
  return regex.test(normalized);
}

export function formatPhoneNumberForApi(phone) {
  let normalized = toEnglishDigits(phone).replace(/[\s\-+]/g, '');
  if (normalized.startsWith('98')) {
    normalized = normalized.slice(2);
  }
  if (normalized.length === 10 && normalized.startsWith('9')) {
    normalized = '0' + normalized;
  }
  return normalized;
}
