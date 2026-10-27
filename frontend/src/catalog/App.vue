<template>
  <div>
    <!-- ۱. نمای احراز هویت خریدار -->
    <CatalogAuth
      v-if="viewMode === 'auth'"
      :links="links"
      :customers="customers"
      @login-direct="handleLoginDirect"
      @login-customer="handleLoginCustomer"
      @login-otp-link="handleLoginOtpLink"
    />

    <!-- ۲. نمای اصلی کاتالوگ خریدار -->
    <div
      v-else-if="viewMode === 'catalog'"
      id="catAppView"
      style="display: flex; min-height: 100vh; flex-direction: column;"
    >
      <CatalogHeader
        :session="currentSession"
        :formatted-time="formattedTime"
        :is-warning="isWarning"
        :is-unlimited="isUnlimited"
        @logout="handleLogout"
      />

      <CatalogToolbar
        v-model:selected-category="selectedCategory"
        v-model:search-query="searchQuery"
        :unique-categories="uniqueCategories"
        :total-eligible-count="eligibleShoes.length"
      />

      <ShoeGrid
        :shoes="filteredShoes"
        @view-dossier="handleOpenDossier"
        @reset-filters="handleResetFilters"
      />

      <footer style="background: rgba(15, 13, 11, 0.95); border-top: 1px solid var(--border-subtle); padding: 2rem 1.5rem; text-align: center; font-size: 0.8rem; color: var(--text-dim);">
        <p style="margin-bottom: 0.5rem; color: var(--gold-light); font-weight: 700;">تولیدی کفش چرم طبیعی DYF(Defender Your Foot)</p>
        <p style="margin: 0;">کلیه حقوق معنوی طرح‌ها و مدل‌های انحصاری این کاتالوگ محفوظ و مختص همکاران مجاز می‌باشد.</p>
      </footer>
    </div>

    <!-- ۳. نمای پایان زمان یا ابطال دسترسی -->
    <CatalogExpired v-else-if="viewMode === 'expired'" />

    <!-- ۴. مودال پرونده تخصصی محصول -->
    <ShoeDossierModal
      :is-open="isDossierOpen"
      :shoe="selectedDossierShoe"
      @close="isDossierOpen = false"
      @open-lightbox="handleOpenLightbox"
    />

    <!-- ۵. مودال لایت‌باکس بزرگنمایی تصویر -->
    <LightboxModal
      :is-open="isLightboxOpen"
      :src="lightboxSrc"
      :caption="lightboxCaption"
      @close="isLightboxOpen = false"
    />

    <!-- ۶. کانتینر اعلان‌های Toast -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CatalogAuth from './components/CatalogAuth.vue';
import CatalogHeader from './components/CatalogHeader.vue';
import CatalogToolbar from './components/CatalogToolbar.vue';
import ShoeGrid from './components/ShoeGrid.vue';
import ShoeDossierModal from './components/ShoeDossierModal.vue';
import CatalogExpired from './components/CatalogExpired.vue';
import LightboxModal from '../components/LightboxModal.vue';
import ToastContainer from '../components/ToastContainer.vue';

import { useCatalogData } from '../composables/useCatalogData.js';
import { useSessionTimer } from '../composables/useSessionTimer.js';
import { useToast } from '../composables/useToast.js';

const viewMode = ref('auth');

const {
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
} = useCatalogData();

const {
  isWarning,
  isUnlimited,
  formattedTime,
  startTimer,
  stopTimer,
} = useSessionTimer();

const { showToast } = useToast();

const isDossierOpen = ref(false);
const selectedDossierShoe = ref(null);

const isLightboxOpen = ref(false);
const lightboxSrc = ref('');
const lightboxCaption = ref('');

function handleLoginDirect(link) {
  const session = createLinkSession(link);
  startCatalogSession(session);
}

function handleLoginOtpLink(link) {
  const session = createLinkSession(link);
  startCatalogSession(session);
}

function handleLoginCustomer(customer) {
  const session = createCustomerSession(customer);
  startCatalogSession(session);
}

function startCatalogSession(session) {
  viewMode.value = 'catalog';
  startTimer(session, () => {
    handleSessionExpired();
  });

  showToast({
    type: 'success',
    title: 'خوش آمدید',
    message: 'کاتالوگ خصوصی آتلیه DYF برای شما بارگذاری گردید.',
  });
}

function handleSessionExpired() {
  stopTimer();
  clearSession();
  viewMode.value = 'expired';
}

function handleLogout() {
  stopTimer();
  clearSession();
  window.location.href = '/catalog';
}

function handleResetFilters() {
  searchQuery.value = '';
  selectedCategory.value = 'all';
}

function handleOpenDossier(shoeId) {
  const shoe = shoes.value.find((s) => s.id === shoeId);
  if (!shoe) return;
  selectedDossierShoe.value = shoe;
  isDossierOpen.value = true;
}

function handleOpenLightbox({ url, caption }) {
  lightboxSrc.value = url;
  lightboxCaption.value = caption || '';
  isLightboxOpen.value = true;
}

onMounted(() => {
  loadStoreData();

  window.openShoeLightbox = (url, title) => {
    handleOpenLightbox({ url, caption: title });
  };
});
</script>
