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

export function formatAccessDuration(value) {
  if (!value || value === 'none' || value === 'unlimited') return 'نامحدود';
  const match = String(value).match(/^(\d+)([mhd])$/);
  if (!match) return value;
  let total = Number(match[1]) * ({ m: 1, h: 60, d: 1440 }[match[2]]);
  if (!total) return '۰ دقیقه';
  const parts = [];
  for (const [size, label] of [[1440, 'روز'], [60, 'ساعت'], [1, 'دقیقه']]) {
    const amount = Math.floor(total / size);
    if (amount) parts.push(`${amount.toLocaleString('fa-IR')} ${label}`);
    total %= size;
  }
  return parts.join(' و ');
}

export function compactDuration(totalMinutes) {
  if (totalMinutes % 1440 === 0) return `${totalMinutes / 1440}d`;
  if (totalMinutes % 60 === 0) return `${totalMinutes / 60}h`;
  return `${totalMinutes}m`;
}

export function toPersianDigits(str) {
  if (!str && str !== 0) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (d) => farsiDigits[parseInt(d, 10)]);
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

export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '/assets/images/shoes.jpeg';
  const trimmed = url.trim();
  if (!trimmed) return '/assets/images/shoes.jpeg';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return '/' + trimmed;
}
