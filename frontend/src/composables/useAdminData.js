import { ref, computed } from 'vue';
import {
  FALLBACK_SHOES,
  FALLBACK_CATEGORIES,
  FALLBACK_CUSTOMERS,
  FALLBACK_LINKS,
} from '../mocks/fallbackData.js';
import { toEnglishDigits, toPersianDigits, normalizeImageUrl } from '../shared/utils/format.js';

// Global singleton reactive state
const shoes = ref([]);
const categories = ref([]);
const customers = ref([]);
const links = ref([]);
const isAuthenticated = ref(false);
const isInitialized = ref(false);

const STORAGE_KEYS = {
  SHOES: 'dyf_admin_shoes_v1',
  CATEGORIES: 'dyf_admin_categories_v2',
  CUSTOMERS: 'dyf_admin_customers_v1',
  LINKS: 'dyf_admin_links_v1',
  AUTH: 'dyf_admin_auth',
};

function sanitizeShoe(s) {
  if (!s) return s;
  const image = normalizeImageUrl(s.image);
  const media = Array.isArray(s.media) && s.media.length > 0
    ? s.media.map((m) => ({ ...m, url: normalizeImageUrl(m.url) }))
    : [{ url: image, type: 'image', isPrimary: true }];
  const gallery = Array.isArray(s.gallery) && s.gallery.length > 0
    ? s.gallery.map(normalizeImageUrl)
    : media.map((m) => m.url);
  return {
    ...s,
    image,
    media,
    gallery,
  };
}

export function useAdminData() {
  function initData() {
    if (isInitialized.value) return;

    // Check auth
    try {
      isAuthenticated.value = localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch {
      isAuthenticated.value = false;
    }

    // Load Shoes
    try {
      const savedShoes = localStorage.getItem(STORAGE_KEYS.SHOES);
      if (savedShoes) {
        shoes.value = JSON.parse(savedShoes).map(sanitizeShoe);
      } else {
        shoes.value = JSON.parse(JSON.stringify(FALLBACK_SHOES)).map(sanitizeShoe);
        saveShoes();
      }
    } catch {
      shoes.value = JSON.parse(JSON.stringify(FALLBACK_SHOES)).map(sanitizeShoe);
    }

    // Load Categories
    try {
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories);
      } else {
        categories.value = JSON.parse(JSON.stringify(FALLBACK_CATEGORIES));
        saveCategories();
      }
    } catch {
      categories.value = JSON.parse(JSON.stringify(FALLBACK_CATEGORIES));
    }

    // Load Customers
    try {
      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (savedCustomers) {
        customers.value = JSON.parse(savedCustomers);
      } else {
        customers.value = JSON.parse(JSON.stringify(FALLBACK_CUSTOMERS));
        saveCustomers();
      }
    } catch {
      customers.value = JSON.parse(JSON.stringify(FALLBACK_CUSTOMERS));
    }

    // Load Links
    try {
      const savedLinks = localStorage.getItem(STORAGE_KEYS.LINKS);
      if (savedLinks) {
        links.value = JSON.parse(savedLinks);
      } else {
        links.value = JSON.parse(JSON.stringify(FALLBACK_LINKS));
        saveLinks();
      }
    } catch {
      links.value = JSON.parse(JSON.stringify(FALLBACK_LINKS));
    }

    isInitialized.value = true;
  }

  // --- Auth methods ---
  function login() {
    isAuthenticated.value = true;
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } catch (e) {
      console.error(e);
    }
  }

  function logout() {
    isAuthenticated.value = false;
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {
      console.error(e);
    }
  }

  // --- Persistence helpers ---
  function saveShoes() {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOES, JSON.stringify(shoes.value));
    } catch (e) {
      console.error('Error saving shoes:', e);
    }
  }

  function saveCategories() {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories.value));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  }

  function saveCustomers() {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers.value));
    } catch (e) {
      console.error('Error saving customers:', e);
    }
  }

  function saveLinks() {
    try {
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links.value));
    } catch (e) {
      console.error('Error saving links:', e);
    }
  }

  // --- Shoes CRUD ---
  function addShoe(data) {
    const nextId = shoes.value.length > 0 ? Math.max(...shoes.value.map((s) => Number(s.id) || 100)) + 1 : 101;
    const rawShoe = {
      id: nextId,
      title: data.title,
      category: data.categories?.[0] || 'کفش رسمی و اداری',
      categories: data.categories || [],
      colors: data.colors || [],
      sizes: data.sizes || ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'],
      status: data.status || 'published',
      description: data.description || '',
      media: data.media && data.media.length ? data.media : [
        { url: '/assets/images/shoes.jpeg', type: 'image', isPrimary: true }
      ],
      image: data.media?.[0]?.url || '/assets/images/shoes.jpeg',
      gallery: (data.media || []).map((m) => m.url),
    };
    const newShoe = sanitizeShoe(rawShoe);
    shoes.value.unshift(newShoe);
    saveShoes();
    return newShoe;
  }

  function updateShoe(id, data) {
    const index = shoes.value.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;

    const existing = shoes.value[index];
    const updated = sanitizeShoe({
      ...existing,
      ...data,
      id: existing.id,
      image: data.media?.find((m) => m.isPrimary)?.url || data.media?.[0]?.url || existing.image,
      gallery: data.media?.map((m) => m.url) || existing.gallery,
    });
    shoes.value[index] = updated;
    saveShoes();
    return updated;
  }

  function deleteShoe(id) {
    shoes.value = shoes.value.filter((s) => s.id !== Number(id));
    saveShoes();
  }

  function toggleShoeStatus(id) {
    const shoe = shoes.value.find((s) => s.id === Number(id));
    if (shoe) {
      shoe.status = shoe.status === 'published' ? 'draft' : 'published';
      saveShoes();
    }
  }

  // --- Categories CRUD ---
  function addCategory(data) {
    const slug = 'cat-' + Date.now().toString(36);
    const newCategory = {
      id: data.id || slug,
      name: data.name.trim(),
      status: data.status || 'active',
      icon: data.icon || 'briefcase',
    };
    categories.value.push(newCategory);
    saveCategories();
    return newCategory;
  }

  function updateCategory(id, data) {
    const index = categories.value.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const oldName = categories.value[index].name;
    const updated = {
      ...categories.value[index],
      ...data,
      id,
    };
    categories.value[index] = updated;

    // If name changed, optionally sync with shoes
    if (data.name && data.name !== oldName) {
      shoes.value.forEach((shoe) => {
        if (shoe.categories) {
          shoe.categories = shoe.categories.map((c) => (c === oldName ? data.name : c));
        }
      });
      saveShoes();
    }

    saveCategories();
    return updated;
  }

  function deleteCategory(id) {
    categories.value = categories.value.filter((c) => c.id !== id);
    saveCategories();
  }

  function toggleCategoryStatus(id) {
    const cat = categories.value.find((c) => c.id === id);
    if (cat) {
      cat.status = cat.status === 'active' ? 'inactive' : 'active';
      saveCategories();
    }
  }

  function getModelCountForCategory(categoryName) {
    if (!categoryName) return 0;
    const clean = categoryName.replace(/^لاین\s+/, '').trim();
    return shoes.value.filter((shoe) => {
      if (shoe.categories && shoe.categories.length) {
        return shoe.categories.some((c) => c.replace(/^لاین\s+/, '').trim() === clean);
      }
      return (shoe.category || '').replace(/^لاین\s+/, '').trim() === clean;
    }).length;
  }

  // --- Customers CRUD ---
  function addCustomer(data) {
    const nextId = customers.value.length > 0 ? Math.max(...customers.value.map((c) => Number(c.id) || 100)) + 1 : 101;
    const newCustomer = {
      id: nextId,
      code: `CUST-${nextId}`,
      nameFa: data.nameFa.trim(),
      nameEn: data.nameEn || '',
      shop: data.shop || '',
      phone: toEnglishDigits(data.phone).replace(/\D/g, ''),
      status: data.status || 'active',
      tier: data.tier || 'wholesale',
      directAccess: data.directAccess || {
        enabled: false,
        categories: categories.value.map((c) => c.name),
        addModels: [],
        excludeModels: [],
        duration: '15m',
        deadline: '3d',
        lastLogin: '-',
      },
    };
    customers.value.unshift(newCustomer);
    saveCustomers();
    return newCustomer;
  }

  function updateCustomer(id, data) {
    const index = customers.value.findIndex((c) => c.id === Number(id));
    if (index === -1) return null;
    const updated = {
      ...customers.value[index],
      ...data,
      id: Number(id),
    };
    customers.value[index] = updated;
    saveCustomers();
    return updated;
  }

  function deleteCustomer(id) {
    customers.value = customers.value.filter((c) => c.id !== Number(id));
    saveCustomers();
  }

  function toggleCustomerStatus(id) {
    const cust = customers.value.find((c) => c.id === Number(id));
    if (cust) {
      cust.status = cust.status === 'active' ? 'inactive' : 'active';
      saveCustomers();
    }
  }

  function updateCustomerDirectAccess(id, directAccessSettings) {
    const cust = customers.value.find((c) => c.id === Number(id));
    if (cust) {
      cust.directAccess = {
        ...cust.directAccess,
        ...directAccessSettings,
      };
      saveCustomers();
    }
  }

  // --- Access Links CRUD ---
  function createLink(data) {
    const token = Math.random().toString(16).substring(2, 10);
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newLink = {
      id: `LNK-${idNum}`,
      token,
      recipientFa: data.recipientFa.trim(),
      recipientEn: data.recipientEn || '',
      customer: data.customer || '',
      customerId: data.customerId || null,
      phone: data.phone || '',
      authType: data.authType || 'direct',
      categories: data.categories || categories.value.map((c) => c.name),
      addModels: data.addModels || [],
      excludeModels: data.excludeModels || [],
      startDeadline: data.startDeadline || '3d',
      viewingDuration: data.viewingDuration || '15m',
      createdAt: data.createdAt || new Date().toLocaleDateString('fa-IR'),
      status: 'active',
      reason: null,
      views: 0,
      url: `/catalog?token=${token}`,
    };
    links.value.unshift(newLink);
    saveLinks();
    return newLink;
  }

  function updateLink(id, data) {
    const index = links.value.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const updated = {
      ...links.value[index],
      ...data,
      id,
    };
    links.value[index] = updated;
    saveLinks();
    return updated;
  }

  function revokeLink(id) {
    const link = links.value.find((l) => l.id === id);
    if (link) {
      link.status = 'revoked';
      link.reason = 'ابطال شده توسط مدیر';
      saveLinks();
    }
  }

  function extendLink(id, duration = '24h') {
    const link = links.value.find((l) => l.id === id);
    if (link) {
      link.status = 'active';
      link.startDeadline = duration;
      link.reason = null;
      saveLinks();
    }
  }

  function deleteLink(id) {
    links.value = links.value.filter((l) => l.id !== id);
    saveLinks();
  }

  // --- Computed Stats ---
  const stats = computed(() => {
    const totalShoes = shoes.value.length;
    const publishedShoes = shoes.value.filter((s) => s.status === 'published').length;
    const totalCats = categories.value.length;
    const activeCusts = customers.value.filter((c) => c.status === 'active').length;
    const activeLnk = links.value.filter((l) => l.status === 'active').length;
    const totalViews = links.value.reduce((acc, l) => acc + (Number(l.views) || 0), 0);

    return {
      totalShoes,
      publishedShoes,
      totalCategories: totalCats,
      activeCustomers: activeCusts,
      activeLinks: activeLnk,
      totalViews,
    };
  });

  return {
    shoes,
    categories,
    customers,
    links,
    isAuthenticated,
    isInitialized,
    stats,
    initData,
    login,
    logout,
    saveShoes,
    saveCategories,
    saveCustomers,
    saveLinks,
    // Shoe operations
    addShoe,
    updateShoe,
    deleteShoe,
    toggleShoeStatus,
    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getModelCountForCategory,
    // Customer operations
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    updateCustomerDirectAccess,
    // Link operations
    createLink,
    updateLink,
    revokeLink,
    extendLink,
    deleteLink,
  };
}
