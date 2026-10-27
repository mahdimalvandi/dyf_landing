import { ref, computed } from 'vue';
import { FALLBACK_SHOES, FALLBACK_CUSTOMERS, FALLBACK_LINKS } from '../mocks/fallbackData.js';

export function useCatalogData() {
  const shoes = ref([]);
  const customers = ref([]);
  const links = ref([]);
  const currentSession = ref(null);
  const searchQuery = ref('');
  const selectedCategory = ref('all');

  function loadStoreData() {
    try {
      const saved = localStorage.getItem('dyf_admin_shoes_v1');
      shoes.value = saved ? JSON.parse(saved) : [...FALLBACK_SHOES];
    } catch {
      shoes.value = [...FALLBACK_SHOES];
    }

    try {
      const saved = localStorage.getItem('dyf_admin_customers_v1');
      customers.value = saved ? JSON.parse(saved) : [...FALLBACK_CUSTOMERS];
    } catch {
      customers.value = [...FALLBACK_CUSTOMERS];
    }

    try {
      const saved = localStorage.getItem('dyf_admin_links_v1');
      links.value = saved ? JSON.parse(saved) : [...FALLBACK_LINKS];
    } catch {
      links.value = [...FALLBACK_LINKS];
    }
  }

  const eligibleShoes = computed(() => {
    if (!currentSession.value) return [];
    const s = currentSession.value;
    const published = shoes.value.filter((shoe) => shoe.status === 'published');

    return published.filter((shoe) => {
      if ((s.excludeModels || []).includes(shoe.id)) return false;
      if ((s.addModels || []).includes(shoe.id)) return true;

      const shoeCats = shoe.categories || [shoe.category];
      return (s.categories || []).some((permCat) =>
        shoeCats.some((sc) => sc && permCat && (sc.includes(permCat) || permCat.includes(sc)))
      );
    });
  });

  const uniqueCategories = computed(() => {
    const catMap = new Map();
    eligibleShoes.value.forEach((shoe) => {
      const cats = shoe.categories || [shoe.category];
      cats.forEach((c) => {
        if (c) {
          catMap.set(c, (catMap.get(c) || 0) + 1);
        }
      });
    });

    return Array.from(catMap.entries()).map(([title, count]) => ({
      title,
      count,
    }));
  });

  const filteredShoes = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    const cat = selectedCategory.value;

    return eligibleShoes.value.filter((shoe) => {
      if (q) {
        const matchTitle = (shoe.title || '').toLowerCase().includes(q);
        const matchLeather = (shoe.leather || '').toLowerCase().includes(q);
        const matchSole = (shoe.sole || '').toLowerCase().includes(q);
        const matchDesc = (shoe.description || '').toLowerCase().includes(q);
        const matchId = String(shoe.id).includes(q);
        if (!matchTitle && !matchLeather && !matchSole && !matchDesc && !matchId) {
          return false;
        }
      }

      if (cat !== 'all') {
        const shoeCats = shoe.categories || [shoe.category];
        if (!shoeCats.includes(cat)) {
          return false;
        }
      }

      return true;
    });
  });

  function createLinkSession(link) {
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

    link.views = (link.views || 0) + 1;
    try {
      localStorage.setItem('dyf_admin_links_v1', JSON.stringify(links.value));
    } catch {}

    return persistSession(session);
  }

  function createCustomerSession(cust) {
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

    return persistSession(session);
  }

  function persistSession(session) {
    const sessionKey = `dyf_cat_session_${session.id || session.token}`;
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.startTimestamp) {
          session.startTimestamp = parsed.startTimestamp;
        }
      } catch {}
    } else {
      try {
        localStorage.setItem(sessionKey, JSON.stringify(session));
      } catch {}
    }

    currentSession.value = session;
    return session;
  }

  function clearSession() {
    if (currentSession.value) {
      const sessionKey = `dyf_cat_session_${currentSession.value.id || currentSession.value.token}`;
      try {
        localStorage.removeItem(sessionKey);
      } catch {}
      currentSession.value = null;
    }
  }

  loadStoreData();

  return {
    shoes,
    customers,
    links,
    currentSession,
    searchQuery,
    selectedCategory,
    eligibleShoes,
    uniqueCategories,
    filteredShoes,
    loadStoreData,
    createLinkSession,
    createCustomerSession,
    clearSession,
  };
}
