import { ref, computed } from 'vue';
import { api, allPages, getToken, setToken, assetURL } from '../shared/api.js';
import { toEnglishDigits, toPersianDigits, compactDuration } from '../shared/utils/format.js';

const shoes = ref([]), categories = ref([]), customers = ref([]), links = ref([]);
const directLinks = ref([]);
const admin = ref(null);
const isAuthenticated = ref(false), isInitialized = ref(false), dashboard = ref(null);

export function mapShoe(item) {
  const image = assetURL(item.coverImage) || '/assets/images/shoes.jpeg';
  const media = [
    ...(item.images || []).map((url) => ({ url: assetURL(url), type: 'image', isPrimary: url === item.coverImage })),
    ...(item.videos || []).map((url) => ({ url: assetURL(url), type: 'video', isPrimary: false })),
  ];
  return {
    id: item.modelID, recordID: item.ID, title: item.title, description: item.description,
    categories: (item.categories || []).map((category) => category.title), category: item.categories?.[0]?.title || '',
    colors: item.colors || [], sizes: (item.sizes || []).map((size) => toPersianDigits(String(size))),
    image, gallery: media.filter((entry) => entry.type === 'image').map((entry) => entry.url),
    media: media.length ? media : [{ url: image, type: 'image', isPrimary: true }], status: 'published',
  };
}

function mapCustomer(item) {
  return {
    id: item.ID, code: item.ID, nameFa: `${item.firstNameFa} ${item.lastNameFa}`.trim(),
    nameEn: `${item.firstNameEn} ${item.lastNameEn}`.trim(), shop: item.storeName,
    phone: item.phoneNumber, status: item.isActive ? 'active' : 'inactive',
    directAccess: { enabled: false, categories: [], addModels: [], excludeModels: [], duration: '15m', deadline: '3d' },
  };
}

function mapLink(item) {
  return {
    id: `LNK-${item.linkID}`, apiID: item.linkID, token: item.token,
    url: `${window.location.origin}/catalog?token=${encodeURIComponent(item.token)}`,
    recipientFa: item.recipientName, recipientEn: '', customerId: item.customerID,
    customer: customers.value.find((customer) => customer.id === item.customerID)?.shop || '',
    recordID: item.ID,
    phone: item.phoneNumber, authType: item.authMethod.toLowerCase(), categories: [], addModels: (item.shoeIDs || []).map((id) => shoes.value.find((shoe) => String(shoe.recordID) === String(id))?.id).filter(Boolean), excludeModels: [],
    viewingDuration: item.viewingDurationMinutes ? compactDuration(item.viewingDurationMinutes) : 'unlimited',
    startDeadline: item.expiresAt > 0 ? compactDuration(Math.max(1, Math.ceil((item.expiresAt - Date.now() / 1000) / 60))) : 'none', expiresAt: item.expiresAt,
    status: item.status === 'INACTIVE' ? 'revoked' : item.status === 'EXPIRED' ? 'expired' : item.status === 'PENDING' ? 'pending' : 'active',
    views: item.lastAccessedAt ? 1 : 0, lastAccessedAt: item.lastAccessedAt,
  };
}

function minutes(value) {
  if (!value || value === 'unlimited') return 0;
  return (parseInt(value, 10) || 0) * (value.endsWith('d') ? 1440 : value.endsWith('h') ? 60 : 1);
}
const linkID = (id) => [...links.value, ...directLinks.value].find((item) => item.id === id)?.recordID || String(id).replace(/^LNK-/, '');

export function useAdminData() {
  async function refreshData() {
    const [categoryItems, shoeItems, customerItems, linkItems, overview] = await Promise.all([
      api('/categories'), allPages('/shoes'), allPages('/customers'), allPages('/links'), api('/dashboard'),
    ]);
    categories.value = (categoryItems || []).map((item) => ({ id: item.ID, name: item.title, status: 'active', icon: 'briefcase', shoeCount: item.shoeCount }));
    shoes.value = shoeItems.map(mapShoe);
    customers.value = customerItems.map(mapCustomer);
    const details = await Promise.all(linkItems.map((item) => api(`/links/${item.linkID}`)));
    links.value = details.filter((item) => !item.isDirectAccess).map(mapLink);
    directLinks.value = details.filter((item) => item.isDirectAccess).map(mapLink);
    customers.value.forEach((customer) => {
      const link = directLinks.value.find((item) => item.customerId === customer.id);
      if (link) customer.directAccess = {
        enabled: link.status === 'active' || link.status === 'pending', linkId: link.id, url: link.url,
        addModels: link.addModels, categories: [], excludeModels: [], duration: link.viewingDuration,
        deadline: link.startDeadline, lastLogin: link.lastAccessedAt ? new Date(link.lastAccessedAt * 1000).toLocaleString('fa-IR') : '-',
      };
    });
    dashboard.value = overview.stats;
  }
  function clearAuth() {
    setToken(''); isAuthenticated.value = false;
    shoes.value = []; categories.value = []; customers.value = []; links.value = []; dashboard.value = null;
    directLinks.value = [];
    admin.value = null;
  }
  async function initData() {
    if (isInitialized.value) return;
    try { if (getToken()) await login(); }
    finally { isInitialized.value = true; }
  }
  async function login() {
    const profile = await api('/auth/admin/me'); admin.value = profile.admin || profile;
    await refreshData(); isAuthenticated.value = true;
  }
  async function logout() { await api('/auth/admin/logout', { method: 'POST' }); clearAuth(); }

  async function shoePayload(data) {
    const media = await Promise.all((data.media || []).map(async (item) => {
      if (!item.url.startsWith('data:') && !item.url.startsWith('blob:')) return item;
      const file = await (await fetch(item.url)).blob();
      const form = new FormData();
      form.append('file', file, `media.${file.type.split('/')[1] || 'jpg'}`);
      const uploaded = await api('/shoes/upload', { method: 'POST', body: form });
      return { ...item, url: uploaded.url };
    }));
    const strip = (url) => url?.includes('/uploads/') ? url.slice(url.indexOf('/uploads/')) : url;
    return {
      title: data.title, description: data.description || '',
      categoryIDs: categories.value.filter((category) => data.categories?.includes(category.name)).map((category) => category.id),
      colors: data.colors || [], sizes: (data.sizes || []).map((size) => Number(toEnglishDigits(String(size)))),
      coverImage: strip(media.find((item) => item.isPrimary && item.type !== 'video')?.url || media.find((item) => item.type !== 'video')?.url || ''),
      images: media.filter((item) => item.type !== 'video').map((item) => strip(item.url)), videos: media.filter((item) => item.type === 'video').map((item) => strip(item.url)),
    };
  }
  function customerPayload(data) {
    const split = (name) => { const [first = '', ...rest] = (name || '').trim().split(/\s+/); return [first, rest.join(' ')]; };
    const [firstNameFa, lastNameFa] = split(data.nameFa), [firstNameEn, lastNameEn] = split(data.nameEn);
    if (firstNameFa.length < 2 || lastNameFa.length < 2) throw new Error('نام و نام خانوادگی را کامل وارد کنید (هرکدام حداقل دو حرف).');
    return { firstNameFa, lastNameFa, firstNameEn, lastNameEn, storeName: data.shop || '', phoneNumber: toEnglishDigits(data.phone || '').replace(/\D/g, ''), isActive: data.status !== 'inactive' };
  }
  function linkPayload(data) {
    const selected = shoes.value.filter((shoe) => !(data.excludeModels || []).includes(shoe.id) && ((data.addModels || []).includes(shoe.id) || shoe.categories.some((name) => (data.categories || []).includes(name))));
    return {
      isDirectAccess: !!data.isDirectAccess,
      recipientName: data.recipientFa, phoneNumber: data.phone || '', customerID: data.customerId || 0,
      authMethod: (data.authType || 'direct').toUpperCase(), shoeIDs: selected.map((shoe) => shoe.recordID), viewingDurationMinutes: minutes(data.viewingDuration),
      expiresAt: data.expiresAt ?? (minutes(data.startDeadline) ? Math.floor(Date.now() / 1000) + minutes(data.startDeadline) * 60 : 0),
    };
  }
  async function mutate(path, method, body) {
    const result = await api(path, { method, body }); await refreshData(); return result;
  }
  const addShoe = async (data) => mutate('/shoes', 'POST', await shoePayload(data));
  const updateShoe = async (id, data) => mutate(`/shoes/${shoes.value.find((shoe) => shoe.id === id)?.recordID}`, 'PUT', await shoePayload(data));
  const deleteShoe = (id) => mutate(`/shoes/${shoes.value.find((shoe) => shoe.id === id)?.recordID}`, 'DELETE');
  const addCategory = (data) => mutate('/categories', 'POST', { title: data.name.trim() });
  const updateCategory = (id, data) => mutate(`/categories/${id}`, 'PUT', { title: data.name.trim() });
  const deleteCategory = (id) => mutate(`/categories/${id}`, 'DELETE');
  const addCustomer = (data) => mutate('/customers', 'POST', customerPayload(data));
  const updateCustomer = (id, data) => mutate(`/customers/${id}`, 'PUT', customerPayload(data));
  const deleteCustomer = (id) => mutate(`/customers/${id}`, 'DELETE');
  const toggleCustomerStatus = (id) => mutate(`/customers/${id}/status`, 'PATCH', { isActive: customers.value.find((item) => item.id === id)?.status !== 'active' });
  const updateCustomerDirectAccess = async (id, settings) => {
    const customer = customers.value.find((item) => item.id === id);
    const existing = directLinks.value.find((item) => item.customerId === id);
    if (!settings.enabled) {
      if (existing) await revokeLink(existing.id);
      return;
    }
    const body = linkPayload({
      isDirectAccess: true, customerId: id, recipientFa: customer.nameFa, phone: customer.phone,
      authType: 'direct', addModels: settings.addModels, viewingDuration: settings.duration, startDeadline: settings.deadline,
    });
    if (existing) {
      await api(`/links/${existing.recordID}`, { method: 'PUT', body });
      if (existing.status === 'revoked' || existing.status === 'expired') {
        await api(`/links/${existing.recordID}/reactivate`, { method: 'PATCH' });
      }
    } else {
      await api('/links', { method: 'POST', body });
    }
    await refreshData();
  };
  const createLink = async (data) => {
    const result = await mutate('/links', 'POST', linkPayload(data)); return links.value.find((item) => item.apiID === result.linkID);
  };
  const revokeLink = (id) => mutate(`/links/${linkID(id)}/revoke`, 'PATCH');
  const extendLink = (id) => mutate(`/links/${linkID(id)}/reactivate`, 'PATCH');
  const updateLink = (id, data) => {
    return mutate(`/links/${linkID(id)}`, 'PUT', linkPayload({ ...links.value.find((item) => item.id === id), ...data }));
  };
  const deleteLink = (id) => mutate(`/links/${linkID(id)}`, 'DELETE');
  const getModelCountForCategory = (name) => shoes.value.filter((shoe) => shoe.categories.includes(name)).length;
  const stats = computed(() => ({ totalShoes: dashboard.value?.activeShoesCount || 0, publishedShoes: dashboard.value?.activeShoesCount || 0,
    totalCategories: categories.value.length, activeCustomers: dashboard.value?.totalCustomersCount || 0,
    activeLinks: dashboard.value?.activeLinksCount || 0, totalViews: dashboard.value?.last7DaysViewsCount || 0 }));
  return { admin, shoes, categories, customers, links, isAuthenticated, isInitialized, stats, initData, refreshData, login, logout, clearAuth,
    addShoe, updateShoe, deleteShoe, addCategory, updateCategory, deleteCategory, getModelCountForCategory,
    addCustomer, updateCustomer, deleteCustomer, toggleCustomerStatus, updateCustomerDirectAccess,
    createLink, updateLink, revokeLink, extendLink, deleteLink };
}
