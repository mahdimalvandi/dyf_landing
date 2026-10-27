<template>
  <div>
    <!-- ۱. صفحه ورود مدیر (Auth View) -->
    <AdminAuth
      v-if="!isAuthenticated"
      @login-success="handleLoginSuccess"
    />

    <!-- ۲. پوسته اصلی پنل مدیریت (Admin App Shell) -->
    <div v-else id="adminApp" class="dyf-admin-app">
      <!-- سایدبار منو -->
      <AdminSidebar
        :admin-name="admin ? `${admin.firstName} ${admin.lastName}` : 'مدیر کارگاه'"
        :is-open="isSidebarOpen"
        :active-route="activeRoute"
        :total-shoes="shoes.length"
        :total-categories="categories.length"
        :total-customers="customers.length"
        :active-links="stats.activeLinks"
        @navigate="navigateTo"
        @close="isSidebarOpen = false"
        @logout="confirmLogout"
      />

      <!-- بدنه اصلی پیشخوان و محتوا -->
      <div class="dyf-admin-main-wrap">
        <!-- هدر بالای صفحه -->
        <AdminHeader
          :current-title="currentRouteTitle"
          @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
          @navigate="navigateTo"
          @open-create-link="openLinkWizard()"
        />

        <!-- محتوای صفحات بر اساس روت -->
        <main class="dyf-admin-content">
          <!-- ویو ۱: داشبورد -->
          <DashboardView
            v-if="activeRoute === '#dashboard'"
            :stats="stats"
            :links="links"
            :customers="customers"
            @open-link-wizard="openLinkWizard()"
            @view-link-detail="openLinkDetails"
            @navigate="navigateTo"
          />

          <!-- ویو ۲: مدل‌های کفش -->
          <ShoesView
            :initial-category="shoeCategoryFilter"
            v-else-if="activeRoute === '#shoes'"
            :shoes="shoes"
            :categories="categories"
            @create="openShoeCreate"
            @edit="openShoeEdit"
            @delete="confirmDeleteShoe"
            @open-dossier="openShoeDossier"
            @open-lightbox="openLightbox"
          />

          <!-- ویو ۳: دسته‌بندی‌ها -->
          <CategoriesView
            v-else-if="activeRoute === '#categories'"
            :categories="categories"
            :shoes="shoes"
            @create="openCategoryCreate"
            @edit="openCategoryEdit"
            @delete="confirmDeleteCategory"
            @view-shoes="handleViewCategoryShoes"
          />

          <!-- ویو ۴: خریداران و همکاران -->
          <CustomersView
            v-else-if="activeRoute === '#customers'"
            :customers="customers"
            @create="openCustomerCreate"
            @edit="openCustomerEdit"
            @delete="confirmDeleteCustomer"
            @open-details="openCustomerDetails"
            @generate-link="openLinkWizardPrefilled"
          />

          <!-- ویو ۵: لینک‌های اختصاصی -->
          <AccessLinksView
            v-else-if="activeRoute === '#access-links'"
            :links="links"
            @create="openLinkWizard()"
            @edit="openEditLink"
            @delete="confirmDeleteLink"
            @view-detail="openLinkDetails"
            @change-status="handleChangeLinkStatus"
          />

          <!-- ویو ۶: کیت کامپوننت‌های مشترک -->
          <ComponentsDemoView
            v-else-if="activeRoute === '#components'"
          />
        </main>
      </div>
    </div>

    <!-- ۳. مودال‌های فرم و محتوا -->
    <!-- مودال افزودن / ویرایش مدل کفش -->
    <ShoeFormModal
      :is-open="isShoeFormOpen"
      :shoe="editingShoe"
      :categories="categories"
      @close="isShoeFormOpen = false"
      @save="handleSaveShoe"
    />

    <!-- مودال شناسنامه تخصصی محصول -->
    <ShoeDossierModal
      :is-open="isDossierOpen"
      :shoe="selectedDossierShoe"
      @close="handleCloseDossier"
      @edit="handleEditFromDossier"
      @open-lightbox="openLightbox"
    />

    <!-- مودال بزرگنمایی لایت‌باکس تصویر کفش (مشترک با کاتالوگ با قابلیت zoom to point) -->
    <LightboxModal
      :is-open="isLightboxOpen"
      :src="lightboxSrc"
      :caption="lightboxCaption"
      @close="isLightboxOpen = false"
    />

    <!-- مودال افزودن / ویرایش دسته‌بندی -->
    <CategoryFormModal
      :is-open="isCategoryFormOpen"
      :category="editingCategory"
      @close="isCategoryFormOpen = false"
      @save="handleSaveCategory"
    />

    <!-- مودال ثبت / ویرایش مشتری -->
    <CustomerFormModal
      :is-open="isCustomerFormOpen"
      :customer="editingCustomer"
      @close="isCustomerFormOpen = false"
      @save="handleSaveCustomer"
    />

    <!-- مودال پروفایل و دسترسی مستقیم مشتری -->
    <CustomerDetailsModal
      :is-open="isCustomerDetailsOpen"
      :customer="selectedCustomer"
      :total-shoes-count="shoes.length"
      :all-shoes="shoes"
      @close="isCustomerDetailsOpen = false"
      @save="handleSaveCustomerDirectAccess"
      @open-picker="handleOpenPickerFromModal"
    />

    <!-- مودال انتخاب محصولات دو‌بخشی (Split-Pane Product Picker) -->
    <ProductPickerModal
      :is-open="isProductPickerOpen"
      :initial-shoe-ids="pickerInitialIds"
      :shoes="shoes"
      :categories="categories"
      @close="isProductPickerOpen = false"
      @confirm="handleConfirmProductPicker"
    />

    <!-- مودال ویزارد صدور لینک اختصاصی ۴ مرحله‌ای -->
    <LinkWizardModal
      :is-open="isLinkWizardOpen"
      :customers="customers"
      :shoes="shoes"
      :prefill-customer="wizardPrefillCustomer"
      @close="isLinkWizardOpen = false"
      @link-created="handleLinkCreated"
      @open-picker="handleOpenPickerFromModal"
    />

    <!-- مودال ویرایش لینک اختصاصی -->
    <EditLinkModal
      :is-open="isEditLinkOpen"
      :link="editingLink"
      :total-shoes-count="shoes.length"
      @close="isEditLinkOpen = false"
      @save="handleSaveEditLink"
      @open-picker="handleOpenPickerFromModal"
    />

    <!-- مودال جزئیات لینک اختصاصی -->
    <LinkDetailsModal
      :is-open="isLinkDetailsOpen"
      :link="selectedLink"
      @close="isLinkDetailsOpen = false"
      @edit="openEditLinkFromDetails"
      @revoke="handleRevokeLink"
      @extend="handleExtendLink"
      @view-permitted="openPermittedShoesViewer"
    />

    <!-- مودال نمایش مدل‌های مجاز -->
    <PermittedShoesViewerModal
      :is-open="isPermittedViewerOpen"
      :target-title="permittedViewerTarget"
      :permitted-shoe-ids="permittedViewerIds"
      :all-shoes="shoes"
      @close="isPermittedViewerOpen = false"
      @back-to-details="handleBackToDetailsFromViewer"
      @edit-permitted="handleEditPermittedFromViewer"
      @open-dossier="handleOpenDossierFromViewer"
      @open-lightbox="openLightbox"
    />

    <!-- مودال سراسری تأیید عملیات (Confirm Modal) -->
    <ConfirmModal
      :is-open="confirmState.isOpen"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      :is-danger="confirmState.isDanger"
      @confirm="handleConfirmAction"
      @cancel="confirmState.isOpen = false"
    />

    <!-- کانتینر اعلان‌های Toast (مشترک) -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onErrorCaptured } from 'vue';
import { useAdminData } from '../composables/useAdminData.js';
import { useToast } from '../composables/useToast.js';

// Components
import AdminAuth from './components/AdminAuth.vue';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import ConfirmModal from './components/ConfirmModal.vue';
import ToastContainer from '../components/ToastContainer.vue';
import LightboxModal from '../components/LightboxModal.vue';
import ShoeDossierModal from './modals/ShoeDossierModal.vue';

// Views
import DashboardView from './views/DashboardView.vue';
import ShoesView from './views/ShoesView.vue';
import CategoriesView from './views/CategoriesView.vue';
import CustomersView from './views/CustomersView.vue';
import AccessLinksView from './views/AccessLinksView.vue';
import ComponentsDemoView from './views/ComponentsDemoView.vue';

// Modals
import ShoeFormModal from './modals/ShoeFormModal.vue';
import CategoryFormModal from './modals/CategoryFormModal.vue';
import CustomerFormModal from './modals/CustomerFormModal.vue';
import CustomerDetailsModal from './modals/CustomerDetailsModal.vue';
import ProductPickerModal from './modals/ProductPickerModal.vue';
import LinkWizardModal from './modals/LinkWizardModal.vue';
import EditLinkModal from './modals/EditLinkModal.vue';
import LinkDetailsModal from './modals/LinkDetailsModal.vue';
import PermittedShoesViewerModal from './modals/PermittedShoesViewerModal.vue';

const {
  admin,
  shoes,
  categories,
  customers,
  links,
  stats,
  isAuthenticated,
  initData,
  login,
  logout,
  clearAuth,
  addShoe,
  updateShoe,
  deleteShoe,
  addCategory,
  updateCategory,
  deleteCategory,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerDirectAccess,
  createLink,
  updateLink,
  revokeLink,
  extendLink,
  deleteLink,
} = useAdminData();

const { showToast } = useToast();
onErrorCaptured((error) => {
  showToast({ type: 'error', title: 'عملیات انجام نشد', message: error.message });
  return false;
});

const isSidebarOpen = ref(false);
const shoeCategoryFilter = ref('all');
const activeRoute = ref('#dashboard');

const routesMap = {
  '#dashboard': 'داشبورد',
  '#shoes': 'مدیریت مدل‌های کفش',
  '#categories': 'مدیریت دسته‌بندی‌ها',
  '#customers': 'مشتریان و همکاران',
  '#access-links': 'لینک‌های دسترسی اختصاصی',
  '#components': 'کامپوننت‌های مشترک دیزاین سیستم',
};

const currentRouteTitle = computed(() => {
  return routesMap[activeRoute.value] || 'داشبورد';
});

// Confirm Modal State
const confirmState = ref({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'تأیید',
  cancelText: 'انصراف',
  isDanger: false,
  onConfirm: null,
});

function openConfirm({ title, message, confirmText = 'تأیید', cancelText = 'انصراف', isDanger = false, onConfirm }) {
  confirmState.value = {
    isOpen: true,
    title,
    message,
    confirmText,
    cancelText,
    isDanger,
    onConfirm,
  };
}

async function handleConfirmAction() {
  confirmState.value.isOpen = false;
  if (confirmState.value.onConfirm) {
    await confirmState.value.onConfirm();
  }
}

// Modals State
const isShoeFormOpen = ref(false);
const editingShoe = ref(null);

const isDossierOpen = ref(false);
const selectedDossierShoe = ref(null);

const isLightboxOpen = ref(false);
const lightboxSrc = ref('');
const lightboxCaption = ref('');

const isCategoryFormOpen = ref(false);
const editingCategory = ref(null);

const isCustomerFormOpen = ref(false);
const editingCustomer = ref(null);

const isCustomerDetailsOpen = ref(false);
const selectedCustomer = ref(null);

const isProductPickerOpen = ref(false);
const pickerInitialIds = ref([]);
let currentPickerCallback = null;

const isLinkWizardOpen = ref(false);
const wizardPrefillCustomer = ref(null);

const isEditLinkOpen = ref(false);
const editingLink = ref(null);

const isLinkDetailsOpen = ref(false);
const selectedLink = ref(null);

const isPermittedViewerOpen = ref(false);
const permittedViewerTarget = ref('');
const permittedViewerIds = ref([]);
let currentPermittedLink = null;

// Routing logic
function handleHashChange() {
  const hash = window.location.hash || '#dashboard';
  if (routesMap[hash]) {
    activeRoute.value = hash;
  } else {
    activeRoute.value = '#dashboard';
  }
}

function navigateTo(route) {
  if (route === '#shoes') shoeCategoryFilter.value = 'all';
  window.location.hash = route;
  activeRoute.value = route;
}

async function handleLoginSuccess() {
  await login();
  handleHashChange();
}

function confirmLogout() {
  openConfirm({
    title: 'خروج از حساب مدیریت',
    message: 'آیا برای خروج از پنل مدیریت کاتالوگ اطمینان دارید؟',
    confirmText: 'خروج از پنل',
    cancelText: 'انصراف',
    isDanger: true,
    onConfirm: async () => {
      await logout();
      showToast({
        type: 'info',
        title: 'خروج موفق',
        message: 'جلسه کاری شما با موفقیت به پایان رسید.',
      });
    },
  });
}

// Shoe Actions
function openShoeCreate() {
  editingShoe.value = null;
  isShoeFormOpen.value = true;
}

function openShoeEdit(shoe) {
  editingShoe.value = shoe;
  isShoeFormOpen.value = true;
}

async function handleSaveShoe(shoeData) {
  if (editingShoe.value) {
    await updateShoe(editingShoe.value.id, shoeData);
    showToast({
      type: 'success',
      title: 'ویرایش مدل',
      message: 'مشخصات مدل کفش با موفقیت به‌روزرسانی شد.',
    });
  } else {
    await addShoe(shoeData);
    showToast({
      type: 'success',
      title: 'ثبت مدل کفش جدید',
      message: 'مدل کفش با موفقیت به فهرست محصولات افزوده شد.',
    });
  }
  isShoeFormOpen.value = false;
}

function confirmDeleteShoe(id) {
  const shoe = shoes.value.find((s) => s.id === id);
  openConfirm({
    title: 'حذف مدل کفش',
    message: `آیا از حذف دائمی مدل «${shoe?.title || id}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`,
    confirmText: 'حذف دائمی',
    cancelText: 'انصراف',
    isDanger: true,
    onConfirm: async () => {
      await deleteShoe(id);
      showToast({
        type: 'success',
        title: 'مدل حذف شد',
        message: 'مدل کفش با موفقیت از پایگاه داده حذف گردید.',
      });
    },
  });
}

function openShoeDossier(id) {
  const shoe = shoes.value.find((s) => s.id === Number(id) || s.id === id);
  if (!shoe) return;
  selectedDossierShoe.value = shoe;
  isDossierOpen.value = true;
}

function handleEditFromDossier(shoe) {
  isDossierOpen.value = false;
  const shoeObj = typeof shoe === 'object' && shoe !== null ? shoe : shoes.value.find((s) => s.id === Number(shoe));
  if (shoeObj) {
    openShoeEdit(shoeObj);
  }
}

let returnToPermittedViewer = false;

function handleCloseDossier() {
  isDossierOpen.value = false;
  if (returnToPermittedViewer && currentPermittedLink) {
    returnToPermittedViewer = false;
    isPermittedViewerOpen.value = true;
  }
}

function handleOpenDossierFromViewer(shoeId) {
  returnToPermittedViewer = true;
  isPermittedViewerOpen.value = false;
  openShoeDossier(shoeId);
}

function openLightbox(urlOrPayload, maybeCaption) {
  if (typeof urlOrPayload === 'object' && urlOrPayload !== null) {
    lightboxSrc.value = urlOrPayload.url || urlOrPayload.src || '';
    lightboxCaption.value = urlOrPayload.caption || urlOrPayload.title || '';
  } else {
    lightboxSrc.value = urlOrPayload || '';
    lightboxCaption.value = maybeCaption || '';
  }
  isLightboxOpen.value = true;
}

// Category Actions
function openCategoryCreate() {
  editingCategory.value = null;
  isCategoryFormOpen.value = true;
}

function openCategoryEdit(cat) {
  editingCategory.value = cat;
  isCategoryFormOpen.value = true;
}

async function handleSaveCategory(data) {
  if (editingCategory.value) {
    await updateCategory(editingCategory.value.id, data);
    showToast({
      type: 'success',
      title: 'ویرایش دسته‌بندی',
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد.',
    });
  } else {
    await addCategory(data);
    showToast({
      type: 'success',
      title: 'دسته‌بندی جدید',
      message: 'دسته‌بندی جدید به سیستم افزوده شد.',
    });
  }
  isCategoryFormOpen.value = false;
}

function confirmDeleteCategory(id) {
  const cat = categories.value.find((c) => c.id === id);
  openConfirm({
    title: 'حذف دسته‌بندی',
    message: `آیا برای حذف دسته‌بندی «${cat?.name || id}» اطمینان دارید؟`,
    confirmText: 'حذف دسته‌بندی',
    cancelText: 'انصراف',
    isDanger: true,
    onConfirm: async () => {
      await deleteCategory(id);
      showToast({
        type: 'success',
        title: 'دسته‌بندی حذف شد',
        message: 'دسته‌بندی با موفقیت حذف گردید.',
      });
    },
  });
}

function handleViewCategoryShoes(categoryName) {
  navigateTo('#shoes');
  shoeCategoryFilter.value = categoryName;
}

// Customer Actions
function openCustomerCreate() {
  editingCustomer.value = null;
  isCustomerFormOpen.value = true;
}

function openCustomerEdit(cust) {
  editingCustomer.value = cust;
  isCustomerFormOpen.value = true;
}

async function handleSaveCustomer(data) {
  if (editingCustomer.value) {
    await updateCustomer(editingCustomer.value.id, data);
    showToast({
      type: 'success',
      title: 'ویرایش مشتری',
      message: 'اطلاعات مشتری با موفقیت ذخیره شد.',
    });
  } else {
    await addCustomer(data);
    showToast({
      type: 'success',
      title: 'مشتری جدید',
      message: 'مشتری و همکار جدید با موفقیت ثبت گردید.',
    });
  }
  isCustomerFormOpen.value = false;
}

function confirmDeleteCustomer(id) {
  const cust = customers.value.find((c) => c.id === id);
  openConfirm({
    title: 'حذف خریدار',
    message: `آیا از حذف اطلاعات «${cust?.nameFa || id}» اطمینان دارید؟`,
    confirmText: 'حذف همکار',
    cancelText: 'انصراف',
    isDanger: true,
    onConfirm: async () => {
      await deleteCustomer(id);
      showToast({
        type: 'success',
        title: 'خریدار حذف شد',
        message: 'اطلاعات خریدار با موفقیت حذف گردید.',
      });
    },
  });
}

function openCustomerDetails(cust) {
  if (typeof cust === 'string' || typeof cust === 'number') {
    selectedCustomer.value = customers.value.find((c) => c.id === cust) || null;
  } else {
    selectedCustomer.value = cust;
  }
  isCustomerDetailsOpen.value = true;
}

async function handleSaveCustomerDirectAccess({ id, directAccess }) {
  await updateCustomerDirectAccess(id, directAccess);
  showToast({
    type: 'success',
    title: 'ذخیره دسترسی مستقیم',
    message: 'تنظیمات دسترسی مستقیم خریدار با موفقیت به‌روز شد.',
  });
  isCustomerDetailsOpen.value = false;
}

// Product Picker orchestration
function handleOpenPickerFromModal({ initialShoeIds, onConfirm }) {
  pickerInitialIds.value = [...(initialShoeIds || [])];
  currentPickerCallback = onConfirm;
  isProductPickerOpen.value = true;
}

function handleConfirmProductPicker(selectedIds) {
  if (currentPickerCallback) {
    currentPickerCallback(selectedIds);
  }
  isProductPickerOpen.value = false;
}

// Link Wizard Actions
function openLinkWizard() {
  wizardPrefillCustomer.value = null;
  isLinkWizardOpen.value = true;
}

function openLinkWizardPrefilled(cust) {
  wizardPrefillCustomer.value = cust;
  isLinkWizardOpen.value = true;
}

async function handleLinkCreated(data, done) {
  const newLink = await createLink(data);
  showToast({
    type: 'success',
    title: 'لینک صادر شد',
    message: 'لینک اختصاصی جدید با موفقیت صادر گردید.',
  });
  done(newLink);
}

// Edit Link Actions
function openEditLink(lnk) {
  if (typeof lnk === 'string') {
    editingLink.value = links.value.find((l) => l.id === lnk) || null;
  } else {
    editingLink.value = lnk;
  }
  isEditLinkOpen.value = true;
}

async function handleSaveEditLink(data) {
  await updateLink(data.id, data);
  showToast({
    type: 'success',
    title: 'ویرایش لینک',
    message: 'تنظیمات لینک اختصاصی با موفقیت به‌روزرسانی شد.',
  });
  isEditLinkOpen.value = false;
}

// Link Details Actions
function openLinkDetails(lnk) {
  if (typeof lnk === 'string') {
    selectedLink.value = links.value.find((l) => l.id === lnk) || null;
  } else {
    selectedLink.value = lnk;
  }
  isLinkDetailsOpen.value = true;
}

function openEditLinkFromDetails(lnk) {
  isLinkDetailsOpen.value = false;
  openEditLink(lnk);
}

async function handleRevokeLink(id) {
  await revokeLink(id);
  showToast({
    type: 'warning',
    title: 'ابطال دسترسی',
    message: 'دسترسی این لینک با موفقیت باطل شد.',
  });
  if (selectedLink.value && selectedLink.value.id === id) {
    selectedLink.value = links.value.find((l) => l.id === id);
  }
}

async function handleExtendLink(id) {
  await extendLink(id);
  showToast({
    type: 'success',
    title: 'تمدید دسترسی',
    message: 'لینک مجدداً فعال شد؛ مهلت‌های قبلی مطابق قوانین سرور برقرارند.',
  });
  if (selectedLink.value && selectedLink.value.id === id) {
    selectedLink.value = links.value.find((l) => l.id === id);
  }
}

function confirmDeleteLink(id) {
  openConfirm({
    title: 'حذف لینک اختصاصی',
    message: 'آیا از حذف این لینک اطمینان دارید؟ خریدار دیگر به کاتالوگ دسترسی نخواهد داشت.',
    confirmText: 'حذف لینک',
    cancelText: 'انصراف',
    isDanger: true,
    onConfirm: async () => {
      await deleteLink(id);
      showToast({
        type: 'success',
        title: 'لینک حذف شد',
        message: 'لینک اختصاصی با موفقیت حذف گردید.',
      });
    },
  });
}

function openPermittedShoesViewer(lnk) {
  currentPermittedLink = lnk;
  isLinkDetailsOpen.value = false;
  permittedViewerTarget.value = `لینک اختصاصی ${lnk.recipientFa}`;
  permittedViewerIds.value = lnk.addModels || [];
  isPermittedViewerOpen.value = true;
}

function handleBackToDetailsFromViewer() {
  isPermittedViewerOpen.value = false;
  if (currentPermittedLink) {
    selectedLink.value = currentPermittedLink;
    isLinkDetailsOpen.value = true;
  }
}

function handleChangeLinkStatus({ link, action }) {
  if (!link) return;

  if (action === 'deactivate') {
    openConfirm({
      title: 'غیرفعال‌سازی لینک اختصاصی',
      message: `آیا از غیرفعال‌سازی لینک «${link.id}» متعلق به «${link.recipientFa}» اطمینان دارید؟`,
      confirmText: 'غیرفعال‌سازی لینک',
      cancelText: 'انصراف',
      isDanger: true,
      onConfirm: async () => {
        await revokeLink(link.id);
        showToast({
          type: 'info',
          title: 'لینک غیرفعال شد',
          message: `لینک ${link.id} مسدود گردید و امکان ورود با توکن آن وجود ندارد.`,
        });
      },
    });
  } else if (action === 'activate') {
    openConfirm({
      title: 'فعال‌سازی مجدد لینک',
      message: `آیا از فعال‌سازی مجدد لینک «${link.id}» متعلق به «${link.recipientFa}» اطمینان دارید؟`,
      confirmText: 'فعال‌سازی مجدد',
      cancelText: 'انصراف',
      isDanger: false,
      onConfirm: async () => {
        await extendLink(link.id);
        showToast({
          type: 'success',
          title: 'لینک فعال شد',
          message: `لینک ${link.id} مجدداً در دسترس قرار گرفت.`,
        });
      },
    });
  }
}

function handleEditPermittedFromViewer() {
  isPermittedViewerOpen.value = false;
  if (!currentPermittedLink) return;

  const currentLink = currentPermittedLink;
  handleOpenPickerFromModal({
    initialShoeIds: currentLink.addModels || [],
    onConfirm: async (selectedIds) => {
      await updateLink(currentLink.id, { addModels: selectedIds });
      permittedViewerIds.value = selectedIds;
      showToast({
        type: 'success',
        title: 'مدل‌های مجاز لینک',
        message: 'فهرست مدل‌های مجاز برای این لینک با موفقیت به‌روزرسانی شد.',
      });
      openPermittedShoesViewer(links.value.find((link) => link.id === currentLink.id));
    },
  });
}

onMounted(async () => {
  window.addEventListener('dyf:unauthorized', clearAuth);
  try { await initData(); } catch (error) { showToast({ type: 'error', title: 'اتصال ناموفق', message: error.message }); }
  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
});

onUnmounted(() => {
  window.removeEventListener('dyf:unauthorized', clearAuth);
  window.removeEventListener('hashchange', handleHashChange);
});
</script>
