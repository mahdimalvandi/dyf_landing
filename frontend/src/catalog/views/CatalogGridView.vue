<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogAccessStore } from '../stores/access';
import { catalogService } from '@/shared/api/services';
import type { ShoeItemResponse } from '@/shared/api/types';
import SessionHeader from '../components/SessionHeader.vue';
import ShoeDetailLightbox, { type ShoeDisplayItem } from '../components/ShoeDetailLightbox.vue';
import { analyticsTracker } from '../utils/analyticsTracker';

const router = useRouter();
const accessStore = useCatalogAccessStore();

// Shoes state
const shoes = ref<ShoeDisplayItem[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('all');
const isCategoryDropdownOpen = ref(false);

// Active dossier shoe modal state
const selectedDossierShoe = ref<ShoeDisplayItem | null>(null);
const isDossierOpen = ref(false);

// Legacy Fallback shoes if backend / mock returns empty
const FALLBACK_SHOES: ShoeDisplayItem[] = [
  {
    id: 101,
    title: 'اکسفورد کلاسیک هریتیج (Classic Heritage Oxford)',
    category: 'لاین رسمی و اداری (Formal & Dress)',
    categories: ['لاین رسمی و اداری', 'لاین چرم لوکس دست‌دوز'],
    image: '/assets/images/craft-formal.jpeg',
    coverImage: '/assets/images/craft-formal.jpeg',
    gallery: ['/assets/images/craft-formal.jpeg', '/assets/images/shoes.jpeg'],
    description: 'شاهکار دوخت سنتی با برش‌های دست‌ساز و پرداخت واکس زنبور عسل. مناسب مراسم‌های دیپلماتیک و استایل‌های اداری فاخر.',
    colors: [
      { name: 'مشکی واکس‌خورده', hex: '#1a1918' },
      { name: 'قهوه‌ای شکلاتی سوخته', hex: '#4a2c1b' },
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    model3d: '/assets/models/emblem_3d.glb',
  },
  {
    id: 102,
    title: 'دربی بروژ دست‌دوز دیفندر (Defender Brogue Derby)',
    category: 'لاین رسمی و اداری (Formal & Dress)',
    categories: ['لاین رسمی و اداری'],
    image: '/assets/images/shoes.jpeg',
    coverImage: '/assets/images/shoes.jpeg',
    gallery: ['/assets/images/shoes.jpeg', '/assets/images/craft-formal.jpeg'],
    description: 'طراحی وینتیج با سوراخ‌کاری‌های ظریف بروژینگ روی سرپنجه مدالیون و حاشیه‌ها. راحتی استثنایی برای تردد روزمره مدیران.',
    colors: [
      { name: 'عسلی پتینه‌شده', hex: '#a66e38' },
      { name: 'بلوطی تیره', hex: '#3d2415' },
    ],
    sizes: [39, 40, 41, 42, 43, 44],
    model3d: '/assets/models/emblem_3d.glb',
  },
  {
    id: 103,
    title: 'اسنیکر لوکس چرم نپا (Minimal Craft Sneaker)',
    category: 'لاین اسپرت و کژوال (Sport & Casual)',
    categories: ['لاین اسپرت و کژوال'],
    image: '/assets/images/shoes.jpeg',
    coverImage: '/assets/images/shoes.jpeg',
    gallery: ['/assets/images/shoes.jpeg'],
    description: 'تلاقی متانت چرم دست‌ساز با ارگونومی کفش‌های مدرن شهری. ایده‌آل برای ست‌های اسمارت‌کژوال و ساعات کاری طولانی.',
    colors: [
      { name: 'سفید عاجی استخوانی', hex: '#f0ece1' },
      { name: 'مشکی کربن مات', hex: '#222222' },
    ],
    sizes: [40, 41, 42, 43, 44],
    model3d: '/assets/models/emblem_3d.glb',
  },
  {
    id: 104,
    title: 'نیم‌بوت چلسی اشپالت هریتیج (Heritage Chelsea Boot)',
    category: 'لاین چرم لوکس دست‌دوز (Handmade Atelier)',
    categories: ['لاین چرم لوکس دست‌دوز', 'نیم‌بوت و پوتین کلاسیک'],
    image: '/assets/images/craft-formal.jpeg',
    coverImage: '/assets/images/craft-formal.jpeg',
    gallery: ['/assets/images/craft-formal.jpeg', '/assets/images/shoes.jpeg'],
    description: 'نیم‌بوت اسلیپ‌آن دست‌دوز با کش باکیفیت و ارگونومی فوق‌العاده. طراحی مینیمال و متریال درجه‌یک برای فصول سرد.',
    colors: [
      { name: 'قهوه‌ای تیره', hex: '#3b2219' },
      { name: 'طوسی فیلی اشپالت', hex: '#635e59' },
    ],
    sizes: [41, 42, 43, 44],
    model3d: '/assets/models/emblem_3d.glb',
  },
];

function normalizeShoe(s: any): ShoeDisplayItem {
  const id = s.ID || s.id || 0;
  const title = s.title || '';
  const desc = s.description || '';
  const primary = s.coverImage || s.image || (s.images && s.images[0]) || (s.gallery && s.gallery[0]) || '/assets/images/craft-formal.jpeg';
  const gallery = s.images?.length
    ? s.images
    : s.gallery?.length
    ? s.gallery
    : [primary];

  let rawCats: string[] = [];
  if (Array.isArray(s.categories)) {
    rawCats = s.categories.map((c: any) => (typeof c === 'string' ? c : c.title || ''));
  } else if (s.category) {
    rawCats = [s.category];
  } else {
    rawCats = ['کفش چرم دست‌دوز'];
  }

  const colors = s.colors || [{ name: 'مشکی' }, { name: 'قهوه‌ای' }];
  const sizes = s.sizes || [40, 41, 42, 43, 44];

  return {
    id,
    title,
    description: desc,
    category: rawCats[0] || 'کفش چرم',
    categories: rawCats,
    image: primary,
    coverImage: primary,
    gallery,
    images: gallery,
    colors,
    sizes,
    model3d: s.model3d || '/assets/models/emblem_3d.glb',
  };
}

async function loadShoes() {
  isLoading.value = true;
  try {
    const linkToken = accessStore.token.value;
    let res: { success: boolean; data?: { items: ShoeItemResponse[] } };

    if (linkToken) {
      res = await catalogService.getShoes(linkToken);
    } else {
      res = await catalogService.getCustomerShoes();
    }

    if (res.success && res.data && res.data.items && res.data.items.length > 0) {
      shoes.value = res.data.items.map(normalizeShoe);
    } else {
      shoes.value = FALLBACK_SHOES;
    }
  } catch {
    shoes.value = FALLBACK_SHOES;
  } finally {
    isLoading.value = false;
  }
}

// Categories extraction
const uniqueCategories = computed(() => {
  const catSet = new Set<string>();
  shoes.value.forEach((s) => {
    (s.categories || [s.category || 'کفش چرم']).forEach((c) => {
      if (c) catSet.add(c);
    });
  });
  return Array.from(catSet);
});

function getCategoryCount(cat: string): number {
  if (cat === 'all') return shoes.value.length;
  return shoes.value.filter((s) => (s.categories || [s.category]).includes(cat)).length;
}

const selectedCategoryLabel = computed(() => {
  if (selectedCategory.value === 'all') {
    return `همه مدل‌های مجاز (${shoes.value.length})`;
  }
  const count = getCategoryCount(selectedCategory.value);
  return `${selectedCategory.value} (${count} مدل)`;
});

// Filtered shoes
const filteredShoes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const cat = selectedCategory.value;

  return shoes.value.filter((shoe) => {
    if (q) {
      const matchTitle = (shoe.title || '').toLowerCase().includes(q);
      const matchDesc = (shoe.description || '').toLowerCase().includes(q);
      const matchId = String(shoe.id).includes(q);
      const matchCats = (shoe.categories || []).some((c) => c.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchId && !matchCats) return false;
    }

    if (cat !== 'all') {
      const shoeCats = shoe.categories || [shoe.category];
      if (!shoeCats.includes(cat)) return false;
    }

    return true;
  });
});

function setCategoryFilter(cat: string) {
  selectedCategory.value = cat;
  isCategoryDropdownOpen.value = false;
  analyticsTracker.trackCategoryFilter(cat);
}

function toggleCategoryDropdown() {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
}

function handleResetFilters() {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  isCategoryDropdownOpen.value = false;
}

function handleOpenDossier(shoe: ShoeDisplayItem) {
  selectedDossierShoe.value = shoe;
  isDossierOpen.value = true;
  analyticsTracker.startShoeView(shoe.id, shoe.title);
}

function handleCloseDossier() {
  isDossierOpen.value = false;
  analyticsTracker.endActiveShoeView();
}

// Helpers for card display
function getShoePrimaryImage(shoe: ShoeDisplayItem): string {
  return shoe.coverImage || shoe.image || (shoe.gallery && shoe.gallery[0]) || '/assets/images/craft-formal.jpeg';
}

function getShoeCategories(shoe: ShoeDisplayItem): string[] {
  return shoe.categories || (shoe.category ? [shoe.category] : ['کفش چرم دست‌دوز']);
}

function getShoeColorCount(shoe: ShoeDisplayItem): number {
  return (shoe.colors || []).length;
}

function getShoeSizeCount(shoe: ShoeDisplayItem): number {
  return (shoe.sizes || []).length;
}

// Outside click handler for category dropdown
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('#catCategoryDropdown')) {
    isCategoryDropdownOpen.value = false;
  }
}

// Search debounce tracking
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, (newQuery) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    analyticsTracker.trackSearch(newQuery);
  }, 600);
});

// Watch session expiry: if store reaches EXPIRED, redirect to expired screen
watch(
  () => accessStore.status.value,
  (newStatus) => {
    if (newStatus === 'EXPIRED') {
      router.push('/expired');
    }
  }
);

onMounted(() => {
  analyticsTracker.init(accessStore.token.value);
  loadShoes();
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<template>
  <!-- ======================================================================
       ۲. نمای اصلی کاتالوگ خریدار (#catAppView)
       مطابق ۱۰۰٪ ساختار legacy کاتالوگ خریدار
       ====================================================================== -->
  <div id="catAppView" style="min-height: 100vh; display: flex; flex-direction: column; position: relative;">
    <!-- واترمارک اختصاصی ملایم از نام مشتری جهت محافظت از افشای غیرمجاز (FE-023) -->
    <div
      v-if="accessStore.recipientName.value"
      aria-hidden="true"
      style="position: fixed; inset: 0; pointer-events: none; z-index: 50; display: flex; align-items: center; justify-content: center; opacity: 0.025; transform: rotate(-25deg); font-size: 5rem; font-weight: 900; color: #fff; user-select: none;"
    >
      {{ accessStore.recipientName.value }} • DYF ATELIER
    </div>

    <!-- نوار چسبان ناوبری آتلیه (#catSessionTimerPill, #catRecipientGreetingName, logout buttons) -->
    <SessionHeader />

    <!-- نوار فیلتر و جست‌وجو -->
    <section class="dyf-cat-toolbar">
      <div class="dyf-cat-filter-wrapper">
        <!-- دراپ‌داون انتخابی دسته‌بندی برای موبایل -->
        <div
          id="catCategoryDropdown"
          class="dyf-cat-category-dropdown"
          :class="{ 'is-open': isCategoryDropdownOpen }"
        >
          <button
            id="catDropdownTrigger"
            type="button"
            class="dyf-cat-dropdown-trigger"
            aria-haspopup="listbox"
            :aria-expanded="isCategoryDropdownOpen"
            @click.stop="toggleCategoryDropdown"
          >
            <div class="dyf-cat-dropdown-trigger-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-light); flex-shrink: 0;">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              <span id="catDropdownSelectedLabel">{{ selectedCategoryLabel }}</span>
            </div>
            <svg class="dyf-cat-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <!-- لیست گزینه‌های دراپ‌داون -->
          <div id="catDropdownMenu" class="dyf-cat-dropdown-menu" role="listbox" tabindex="-1">
            <button
              type="button"
              class="dyf-cat-dropdown-item"
              :class="{ 'is-active': selectedCategory === 'all' }"
              data-cat="all"
              @click="setCategoryFilter('all')"
            >
              <span class="dyf-cat-dropdown-item-title">همه مدل‌های مجاز</span>
              <span class="dyf-cat-dropdown-item-count">{{ shoes.length }} مدل</span>
            </button>

            <button
              v-for="cat in uniqueCategories"
              :key="cat"
              type="button"
              class="dyf-cat-dropdown-item"
              :class="{ 'is-active': selectedCategory === cat }"
              :data-cat="cat"
              @click="setCategoryFilter(cat)"
            >
              <span class="dyf-cat-dropdown-item-title">{{ cat }}</span>
              <span class="dyf-cat-dropdown-item-count">{{ getCategoryCount(cat) }} مدل</span>
            </button>
          </div>
        </div>

        <!-- تب‌های افقی دسته‌بندی برای دسکتاپ -->
        <div id="catCategoryFilterTabs" class="dyf-cat-filter-tabs">
          <button
            type="button"
            class="dyf-cat-filter-btn"
            :class="{ 'is-active': selectedCategory === 'all' }"
            data-cat="all"
            @click="setCategoryFilter('all')"
          >
            همه مدل‌های مجاز ({{ shoes.length }})
          </button>

          <button
            v-for="cat in uniqueCategories"
            :key="cat"
            type="button"
            class="dyf-cat-filter-btn"
            :class="{ 'is-active': selectedCategory === cat }"
            :data-cat="cat"
            @click="setCategoryFilter(cat)"
          >
            {{ cat }} ({{ getCategoryCount(cat) }})
          </button>
        </div>
      </div>

      <!-- جست‌وجو -->
      <div class="dyf-cat-search-group">
        <div class="dyf-toolbar-search">
          <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="catSearchInput"
            v-model="searchQuery"
            type="text"
            class="dyf-quick-search-input"
            placeholder="جست‌وجوی مدل، سبک زیره، چرم..."
          >
        </div>
      </div>
    </section>

    <!-- شبکه کارت‌های کفش و وضعیت لودینگ / خالی -->
    <main style="flex: 1;">
      <!-- حالت در حال بارگذاری -->
      <div v-if="isLoading" style="text-align: center; padding: 4rem 1.5rem;">
        <div class="dyf-spinner" style="width: 40px; height: 40px; border-width: 3px; margin: 0 auto 1.25rem;"></div>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">در حال آماده‌سازی کلکسیون اختصاصی...</p>
      </div>

      <!-- شبکه کارت‌های کفش -->
      <div
        v-else-if="filteredShoes.length > 0"
        id="catShoesGrid"
        class="dyf-cat-grid"
      >
        <article
          v-for="shoe in filteredShoes"
          :key="shoe.id"
          class="dyf-cat-card"
          :data-shoe-id="shoe.id"
          title="مشاهده جزئیات مدل"
          @click="handleOpenDossier(shoe)"
        >
          <div class="dyf-cat-media">
            <img :src="getShoePrimaryImage(shoe)" :alt="shoe.title" loading="lazy">
            <div class="dyf-cat-code-badge">DYF-{{ shoe.id }}</div>
          </div>

          <div class="dyf-cat-body">
            <h3 class="dyf-cat-title">{{ shoe.title }}</h3>
            <div class="dyf-cat-categories">
              <span
                v-for="cat in getShoeCategories(shoe)"
                :key="cat"
                class="dyf-category-pill"
                style="font-size: 0.72rem; padding: 0.15rem 0.55rem; background: rgba(61, 36, 21, 0.45); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); color: var(--gold-light);"
              >
                {{ cat }}
              </span>
            </div>

            <div class="dyf-cat-specs-row">
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span>تعداد رنگ:</span>
                <span style="color: var(--text-main); font-weight: 700;">{{ getShoeColorCount(shoe) }}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span>تعداد سایز:</span>
                <span style="color: var(--gold-light); font-weight: 700;">{{ getShoeSizeCount(shoe) }}</span>
              </div>
            </div>

            <div class="dyf-cat-footer-actions">
              <button
                type="button"
                class="dyf-btn dyf-btn-primary dyf-btn-sm js-view-dossier"
                :data-shoe-id="shoe.id"
                style="width: 100%; justify-content: center;"
                @click.stop="handleOpenDossier(shoe)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>مشاهده جزئیات</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- وضعیت خالی بدون نتیجه (#catEmptyState) -->
      <div
        v-else
        id="catEmptyState"
        class="dyf-panel-card dyf-empty-state"
        style="max-width: 600px; margin: 3rem auto;"
      >
        <svg class="dyf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="m9 9 4 4" />
          <path d="m13 9-4 4" />
        </svg>
        <h3 class="dyf-empty-title">مدلی با این مشخصات یافت نشد</h3>
        <p class="dyf-empty-desc">لطفاً عبارت جست‌وجو را تغییر داده یا از تب دسته‌بندی دیگری استفاده فرمایید.</p>
        <button
          id="catResetFilterBtn"
          type="button"
          class="dyf-btn dyf-btn-outline"
          @click="handleResetFilters"
        >
          نمایش همه مدل‌های مجاز
        </button>
      </div>
    </main>

    <!-- فوتر باوقار آتلیه مطابق ۱۰۰٪ کاتالوگ legacy -->
    <footer style="background: rgba(15, 13, 11, 0.95); border-top: 1px solid var(--border-subtle); padding: 2rem 1.5rem; text-align: center; font-size: 0.8rem; color: var(--text-dim);">
      <p style="margin-bottom: 0.5rem; color: var(--gold-light); font-weight: 700;">تولیدی کفش چرم طبیعی DYF(Defender Your Foot)</p>
      <p style="margin: 0;">کلیه حقوق معنوی طرح‌ها و مدل‌های انحصاری این کاتالوگ محفوظ و مختص همکاران مجاز می‌باشد.</p>
    </footer>

    <!-- مودال پرونده تخصصی کفش و لایت‌باکس بزرگنمایی (FE-022) -->
    <ShoeDetailLightbox
      :shoe="selectedDossierShoe"
      :is-open="isDossierOpen"
      @close="handleCloseDossier"
    />
  </div>
</template>
