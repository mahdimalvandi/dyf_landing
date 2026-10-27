const baseURL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const tokenKey = 'dyf_admin_token';

function serialize(body) {
  return JSON.stringify(body)
    .replace(/("customerID"\s*:\s*)"(\d+)"/g, '$1$2')
    .replace(/("(?:shoeIDs|categoryIDs)"\s*:\s*\[)([^\]]*)(\])/g, (_, start, values, end) => start + values.replace(/"(\d+)"/g, '$1') + end);
}

export function getToken() { return localStorage.getItem(tokenKey) || ''; }
export function setToken(token) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${baseURL}/api/v1${path}`, {
      method, headers, signal: controller.signal,
      body: body instanceof FormData ? body : body === undefined ? undefined : serialize(body),
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text.replace(/("(?:ID|customerID)"\s*:\s*)(\d{16,})(?=\s*[,}])/g, '$1"$2"').replace(/("(?:shoeIDs|categoryIDs)"\s*:\s*\[)([^\]]*)(\])/g, (_, start, values, end) => start + values.replace(/\d{16,}/g, '"$&"') + end)) : {};
    if (!response.ok || payload.success === false) {
      if (auth && response.status === 401) {
        setToken('');
        window.dispatchEvent(new Event('dyf:unauthorized'));
      }
      const error = new Error(payload.error?.message || payload.message || `خطای سرور (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return payload.data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('مهلت ارتباط با سرور پایان یافت. دوباره تلاش کنید.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export async function allPages(path) {
  const items = [];
  let page = 1;
  let result;
  do {
    result = await api(`${path}?page=${page}&limit=50`);
    items.push(...(result.items || []));
    page++;
  } while (page <= (result.pagination?.totalPages || 0));
  return items;
}

export function assetURL(url) { return url?.startsWith('/uploads/') ? `${baseURL}${url}` : url; }
