import { ref, computed } from 'vue';
import { api } from '../shared/api.js';
import { mapShoe } from './useAdminData.js';

export function useCatalogData() {
  const shoes = ref([]), customers = ref([]), links = ref([]), currentSession = ref(null);
  const searchQuery = ref(''), selectedCategory = ref('all');
  const eligibleShoes = computed(() => currentSession.value ? shoes.value : []);
  const uniqueCategories = computed(() => {
    const counts = new Map();
    eligibleShoes.value.forEach((shoe) => shoe.categories.forEach((name) => counts.set(name, (counts.get(name) || 0) + 1)));
    return [...counts].map(([title, count]) => ({ title, count }));
  });
  const filteredShoes = computed(() => eligibleShoes.value.filter((shoe) =>
    (selectedCategory.value === 'all' || shoe.categories.includes(selectedCategory.value)) &&
    `${shoe.title} ${shoe.description} ${shoe.id}`.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
  ));
  async function createLinkSession(link) {
    const result = await api(`/catalog/${encodeURIComponent(link.token)}/access`, { method: 'POST', auth: false });
    shoes.value = (result.shoes || []).map(mapShoe);
    currentSession.value = {
      id: result.linkID, token: link.token, mode: 'link', recipientFa: result.recipientName,
      recipientEn: '', customer: result.recipientName,
      duration: result.remainingSeconds > 0 ? 'server' : 'unlimited', remainingSeconds: result.remainingSeconds, startTimestamp: Date.now(),
    };
    return currentSession.value;
  }
  function clearSession() { currentSession.value = null; shoes.value = []; }
  function loadStoreData() {}
  function createCustomerSession() { throw new Error('ورود پیامکی خریدار هنوز در بک‌اند فعال نیست.'); }
  return { shoes, customers, links, currentSession, searchQuery, selectedCategory, eligibleShoes, uniqueCategories,
    filteredShoes, createLinkSession, createCustomerSession, clearSession, loadStoreData };
}
