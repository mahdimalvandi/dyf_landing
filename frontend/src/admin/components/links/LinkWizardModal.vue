<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { linksService, shoesService, customersService, categoriesService } from '@/shared/api/services';
import type {
  ShoeItemResponse,
  CustomerResponse,
  CategoryResponse,
  CreateLinkRequest,
  LinkItemResponse,
} from '@/shared/api/types';

const props = defineProps<{
  show: boolean;
  preselectedCustomerId?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', link: LinkItemResponse): void;
}>();

const step = ref<1 | 2 | 3 | 4 | 5>(1);
const isSubmitting = ref(false);
const wizardError = ref<string | null>(null);
const isCopied = ref(false);

// External data
const customers = ref<CustomerResponse[]>([]);
const shoes = ref<ShoeItemResponse[]>([]);
const categories = ref<CategoryResponse[]>([]);
const isDataLoading = ref(false);

// Form Wizard State
const selectedCustomerId = ref<number | ''>('');
const recipientName = ref('');
const phoneNumber = ref('');
const selectedShoeIds = ref<number[]>([]);
const shoeCategoryFilter = ref<number | 'all'>('all');
const shoeSearch = ref('');

// Step 3: Timing
const deadlineValue = ref<number>(3);
const deadlineUnit = ref<'d' | 'h' | 'none'>('d');
const durationValue = ref<number>(24);
const durationUnit = ref<'h' | 'd' | 'unlimited'>('h');

// Step 4: Security
const authMethod = ref<'DIRECT' | 'OTP'>('DIRECT');

// Step 5: Result
const generatedLink = ref<LinkItemResponse | null>(null);
const generatedUrl = ref('');

onMounted(async () => {
  await loadWizardDependencies();
});

watch(
  () => props.show,
  async (isOpen) => {
    if (isOpen) {
      resetWizard();
      if (!shoes.value.length) {
        await loadWizardDependencies();
      }
      if (props.preselectedCustomerId) {
        selectedCustomerId.value = props.preselectedCustomerId;
        onCustomerSelect();
      }
    }
  }
);

async function loadWizardDependencies() {
  isDataLoading.value = true;
  try {
    const [cRes, sRes, catRes] = await Promise.all([
      customersService.getAll({ page: 1, limit: 100 }),
      shoesService.getAll({ page: 1, limit: 100 }),
      categoriesService.getAll(),
    ]);
    if (cRes.success && cRes.data?.items) customers.value = cRes.data.items;
    if (sRes.success && sRes.data?.items) {
      shoes.value = sRes.data.items;
      // Select all shoes by default
      selectedShoeIds.value = sRes.data.items.map((s) => s.ID);
    }
    if (catRes.success && catRes.data) categories.value = catRes.data;
  } catch (err) {
    console.error('Failed to load wizard dependencies:', err);
  } finally {
    isDataLoading.value = false;
  }
}

function resetWizard() {
  step.value = 1;
  wizardError.value = null;
  selectedCustomerId.value = '';
  recipientName.value = '';
  phoneNumber.value = '';
  deadlineValue.value = 3;
  deadlineUnit.value = 'd';
  durationValue.value = 24;
  durationUnit.value = 'h';
  authMethod.value = 'DIRECT';
  generatedLink.value = null;
  generatedUrl.value = '';
  isCopied.value = false;
  if (shoes.value.length) {
    selectedShoeIds.value = shoes.value.map((s) => s.ID);
  }
}

function onCustomerSelect() {
  if (!selectedCustomerId.value) return;
  const cust = customers.value.find((c) => c.ID === Number(selectedCustomerId.value));
  if (cust) {
    recipientName.value = `${cust.firstNameFa} ${cust.lastNameFa} (${cust.storeName || 'همکار'})`;
    phoneNumber.value = cust.phoneNumber || '';
  }
}

// Shoe selection helpers
const filteredShoes = computed(() => {
  return shoes.value.filter((s) => {
    const matchCat =
      shoeCategoryFilter.value === 'all' ||
      s.categories.some((c) => c.ID === shoeCategoryFilter.value);
    const q = shoeSearch.value.trim().toLowerCase();
    const matchQ = !q || s.title.toLowerCase().includes(q) || String(s.modelID || s.ID).includes(q);
    return matchCat && matchQ;
  });
});

function toggleShoe(id: number) {
  const idx = selectedShoeIds.value.indexOf(id);
  if (idx > -1) selectedShoeIds.value.splice(idx, 1);
  else selectedShoeIds.value.push(id);
}

function selectAllFilteredShoes() {
  filteredShoes.value.forEach((s) => {
    if (!selectedShoeIds.value.includes(s.ID)) {
      selectedShoeIds.value.push(s.ID);
    }
  });
}

function deselectAllFilteredShoes() {
  const ids = new Set(filteredShoes.value.map((s) => s.ID));
  selectedShoeIds.value = selectedShoeIds.value.filter((id) => !ids.has(id));
}

function nextStep() {
  wizardError.value = null;

  // Validation step 1
  if (step.value === 1) {
    if (!recipientName.value.trim()) {
      wizardError.value = 'لطفاً نام گیرنده یا مشتری را وارد نمایید.';
      return;
    }
    step.value = 2;
    return;
  }

  // Validation step 2
  if (step.value === 2) {
    if (!selectedShoeIds.value.length) {
      wizardError.value = 'حداقل یک مدل کفش باید برای دسترسی در کاتالوگ انتخاب شود.';
      return;
    }
    step.value = 3;
    return;
  }

  // Validation step 3
  if (step.value === 3) {
    step.value = 4;
    return;
  }

  // Step 4 -> Execute create
  if (step.value === 4) {
    createAccessLink();
  }
}

function prevStep() {
  if (step.value > 1 && step.value < 5) {
    step.value--;
    wizardError.value = null;
  }
}

async function createAccessLink() {
  isSubmitting.value = true;
  wizardError.value = null;

  // Calculate duration in minutes
  let viewingDurationMinutes: number | undefined;
  if (durationUnit.value === 'h') {
    viewingDurationMinutes = durationValue.value * 60;
  } else if (durationUnit.value === 'd') {
    viewingDurationMinutes = durationValue.value * 24 * 60;
  }

  // Calculate expiresAt timestamp
  let expiresAt: number | undefined;
  if (deadlineUnit.value === 'd') {
    expiresAt = Date.now() + deadlineValue.value * 24 * 60 * 60 * 1000;
  } else if (deadlineUnit.value === 'h') {
    expiresAt = Date.now() + deadlineValue.value * 60 * 60 * 1000;
  }

  const payload: CreateLinkRequest = {
    customerID: selectedCustomerId.value ? Number(selectedCustomerId.value) : undefined,
    recipientName: recipientName.value.trim(),
    phoneNumber: phoneNumber.value.trim() || undefined,
    shoeIDs: selectedShoeIds.value,
    viewingDurationMinutes,
    expiresAt,
    authMethod: authMethod.value,
  };

  try {
    const res = await linksService.create(payload);
    if (res.success && res.data) {
      generatedLink.value = res.data;
      generatedUrl.value = `${window.location.origin}/catalog.html?token=${res.data.token}`;
      step.value = 5;
      emit('created', res.data);
    } else {
      wizardError.value = res.message || 'خطا در صدور لینک اختصاصی';
    }
  } catch (err: any) {
    wizardError.value = err.message || 'خطای غیرمنتظره در ارتباط با سرور';
  } finally {
    isSubmitting.value = false;
  }
}

async function copyGeneratedUrl() {
  if (!generatedUrl.value) return;
  try {
    await navigator.clipboard.writeText(generatedUrl.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Copy failed:', err);
  }
}
</script>

<template>
  <div v-if="show" class="dyf-modal-backdrop is-open" @click.self="emit('close')">
    <div class="dyf-modal-card" style="max-width: 760px; max-height: 92vh; display: flex; flex-direction: column;">
      <!-- هدر مودال -->
      <div class="dyf-modal-header" style="border-bottom: none; padding-bottom: 0.5rem;">
        <div>
          <h3 class="dyf-modal-title">صدور لینک اختصاصی کاتالوگ VIP</h3>
        </div>
        <button type="button" class="dyf-modal-close" @click="emit('close')">&times;</button>
      </div>

      <!-- نوار استپ‌های ۵ مرحله‌ای ویزارد -->
      <div class="dyf-wizard-steps">
        <div class="dyf-wizard-step" :class="{ 'is-active': step === 1, 'is-completed': step > 1 }">
          <div class="dyf-wizard-step-circle">۱</div>
          <span>گیرنده</span>
        </div>
        <div class="dyf-wizard-step" :class="{ 'is-active': step === 2, 'is-completed': step > 2 }">
          <div class="dyf-wizard-step-circle">۲</div>
          <span>مدل‌ها</span>
        </div>
        <div class="dyf-wizard-step" :class="{ 'is-active': step === 3, 'is-completed': step > 3 }">
          <div class="dyf-wizard-step-circle">۳</div>
          <span>زمان</span>
        </div>
        <div class="dyf-wizard-step" :class="{ 'is-active': step === 4, 'is-completed': step > 4 }">
          <div class="dyf-wizard-step-circle">۴</div>
          <span>امنیت</span>
        </div>
        <div class="dyf-wizard-step" :class="{ 'is-active': step === 5 }">
          <div class="dyf-wizard-step-circle">۵</div>
          <span>صدور لینک</span>
        </div>
      </div>

      <!-- پیام خطای مراحل -->
      <div v-if="wizardError" class="dyf-alert dyf-alert-danger" style="margin: 0.5rem 1.5rem 0;">
        {{ wizardError }}
      </div>

      <!-- محتوای مراحل -->
      <div style="flex: 1; overflow-y: auto; padding: 1.5rem;">
        <!-- مرحله ۱: انتخاب یا ایجاد مشتری -->
        <div v-if="step === 1" class="dyf-wizard-panel is-active">
          <div class="dyf-form-group">
            <label class="dyf-form-label">انتخاب از فهرست مشتریان ذخیره‌شده (اختیاری)</label>
            <select
              v-model="selectedCustomerId"
              class="dyf-select"
              @change="onCustomerSelect"
            >
              <option value="">-- مشتری جدید یا مهمان آزاد --</option>
              <option v-for="c in customers" :key="c.ID" :value="c.ID">
                {{ c.firstNameFa }} {{ c.lastNameFa }} ({{ c.storeName || c.phoneNumber }})
              </option>
            </select>
          </div>

          <div class="dyf-form-group">
            <label class="dyf-form-label dyf-form-label-required">نام و عنوان گیرنده لینک</label>
            <input
              v-model="recipientName"
              type="text"
              class="dyf-input"
              placeholder="مثال: حاج مصطفی کمالی، فروشگاه سپهر یا همکار گرامی"
              required
            />
            <p class="dyf-form-hint">
              این نام در بالای کاتالوگ به عنوان خوش‌آمدگویی اختصاصی برای خریدار نمایش داده می‌شود.
            </p>
          </div>

          <div class="dyf-form-group">
            <label class="dyf-form-label">شماره تلفن همراه گیرنده</label>
            <input
              v-model="phoneNumber"
              type="tel"
              class="dyf-input"
              dir="ltr"
              placeholder="09121234567"
            />
          </div>
        </div>

        <!-- مرحله ۲: انتخاب مدل‌های مجاز کفش -->
        <div v-else-if="step === 2" class="dyf-wizard-panel is-active">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span class="dyf-badge dyf-badge-active" style="font-size: 0.82rem;">
                {{ selectedShoeIds.length }} از {{ shoes.length }} مدل انتخاب شده
              </span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-xs" @click="selectAllFilteredShoes">
                انتخاب همه
              </button>
              <button type="button" class="dyf-btn dyf-btn-outline dyf-btn-xs" @click="deselectAllFilteredShoes">
                لغو همه
              </button>
            </div>
          </div>

          <!-- فیلتر و جست‌وجوی مدل‌ها -->
          <div style="display: grid; grid-template-columns: 1fr 180px; gap: 0.75rem; margin-bottom: 1rem;">
            <input
              v-model="shoeSearch"
              type="text"
              class="dyf-input"
              placeholder="جست‌وجوی مدل یا شناسه..."
            />
            <select v-model="shoeCategoryFilter" class="dyf-select">
              <option value="all">همه دسته‌ها</option>
              <option v-for="cat in categories" :key="cat.ID" :value="cat.ID">
                {{ cat.title }}
              </option>
            </select>
          </div>

          <!-- گرید مدل‌ها جهت انتخاب -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; max-height: 340px; overflow-y: auto; padding: 4px;">
            <div
              v-for="shoe in filteredShoes"
              :key="shoe.ID"
              class="dyf-picker-item"
              style="border: 2px solid; border-radius: var(--r-sm); cursor: pointer; overflow: hidden; background: rgba(36, 30, 25, 0.4); transition: border-color 0.2s;"
              :style="selectedShoeIds.includes(shoe.ID) ? 'border-color: var(--gold-primary);' : 'border-color: var(--border-subtle);'"
              @click="toggleShoe(shoe.ID)"
            >
              <img
                :src="shoe.coverImage || '/assets/images/craft-formal.jpeg'"
                :alt="shoe.title"
                style="width: 100%; height: 95px; object-fit: cover;"
              />
              <div style="padding: 0.45rem;">
                <div style="font-size: 0.76rem; font-weight: 700; color: var(--text-ivory); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {{ shoe.title }}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
                  <span class="dyf-code-tag" style="font-size: 0.65rem;">#{{ shoe.modelID || shoe.ID }}</span>
                  <span
                    :style="selectedShoeIds.includes(shoe.ID) ? 'color: var(--gold-primary); font-weight: 700;' : 'color: var(--text-muted);'"
                    style="font-size: 0.8rem;"
                  >
                    {{ selectedShoeIds.includes(shoe.ID) ? '✓' : '○' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- مرحله ۳: زمان و انقضا -->
        <div v-else-if="step === 3" class="dyf-wizard-panel is-active">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
            <!-- مهلت باز کردن لینک -->
            <div class="dyf-form-group" style="margin: 0;">
              <label class="dyf-form-label dyf-form-label-required">مهلت اعتبار لینک (قبل از اولین ورود)</label>
              <div style="display: grid; grid-template-columns: 1fr 110px; gap: 0.5rem;">
                <input
                  v-model.number="deadlineValue"
                  type="number"
                  class="dyf-input"
                  min="1"
                  max="365"
                  :disabled="deadlineUnit === 'none'"
                />
                <select v-model="deadlineUnit" class="dyf-select">
                  <option value="d">روز</option>
                  <option value="h">ساعت</option>
                  <option value="none">نامحدود</option>
                </select>
              </div>
              <p class="dyf-form-hint">پس از این مدت، در صورت عدم ورود، لینک باطل خواهد شد.</p>
            </div>

            <!-- مدت سشن مشاهده -->
            <div class="dyf-form-group" style="margin: 0;">
              <label class="dyf-form-label dyf-form-label-required">مدت مجاز مشاهده (پس از شروع سشن)</label>
              <div style="display: grid; grid-template-columns: 1fr 110px; gap: 0.5rem;">
                <input
                  v-model.number="durationValue"
                  type="number"
                  class="dyf-input"
                  min="1"
                  max="720"
                  :disabled="durationUnit === 'unlimited'"
                />
                <select v-model="durationUnit" class="dyf-select">
                  <option value="h">ساعت</option>
                  <option value="d">روز</option>
                  <option value="unlimited">نامحدود</option>
                </select>
              </div>
              <p class="dyf-form-hint">از لحظه اولین باز شدن کاتالوگ تا پایان دسترسی.</p>
            </div>
          </div>
        </div>

        <!-- مرحله ۴: امنیت و احراز هویت -->
        <div v-else-if="step === 4" class="dyf-wizard-panel is-active">
          <div class="dyf-form-group">
            <label class="dyf-form-label dyf-form-label-required">شیوه احراز هویت ورود به کاتالوگ</label>

            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
              <label
                class="dyf-panel-card"
                style="padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.85rem; border: 2px solid;"
                :style="authMethod === 'DIRECT' ? 'border-color: var(--gold-primary);' : 'border-color: var(--border-subtle);'"
              >
                <input v-model="authMethod" type="radio" value="DIRECT" style="accent-color: var(--gold-primary);" />
                <div>
                  <div style="font-weight: 700; color: var(--text-ivory);">ورود مستقیم VIP (توصیه‌شده برای همکاران نزدیک)</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">
                    بدون نیاز به وارد کردن رمز یا پیامک؛ مشتری با کلیک روی لینک مستقیماً وارد کاتالوگ می‌شود.
                  </div>
                </div>
              </label>

              <label
                class="dyf-panel-card"
                style="padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.85rem; border: 2px solid;"
                :style="authMethod === 'OTP' ? 'border-color: var(--gold-primary);' : 'border-color: var(--border-subtle);'"
              >
                <input v-model="authMethod" type="radio" value="OTP" style="accent-color: var(--gold-primary);" />
                <div>
                  <div style="font-weight: 700; color: var(--text-ivory);">تأیید پیامکی دو مرحله‌ای (SMS OTP)</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">
                    هنگام ورود، کد تأیید یکبارمصرف به شماره موبایل گیرنده ارسال می‌گردد.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- مرحله ۵: صدور موفق، لینک و QR Code -->
        <div v-else-if="step === 5" class="dyf-wizard-panel is-active" style="text-align: center; padding: 1rem 0;">
          <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(76, 217, 100, 0.2); border: 2px solid #4cd964; color: #4cd964; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h3 style="font-family: var(--font-title); font-size: 1.25rem; font-weight: 800; color: var(--text-ivory); margin-bottom: 0.35rem;">
            لینک اختصاصی با موفقیت صادر گردید!
          </h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            لینک اختصاصی زیر را کپی نموده یا از طریق پیام‌رسان‌ها برای خریدار ارسال فرمایید.
          </p>

          <!-- کادر آدرس لینک و کپی -->
          <div
            style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 1.5rem;"
          >
            <span style="font-family: monospace; font-size: 0.85rem; color: var(--gold-light); direction: ltr; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ generatedUrl }}
            </span>
            <button
              type="button"
              class="dyf-btn dyf-btn-primary dyf-btn-sm"
              style="flex-shrink: 0;"
              @click="copyGeneratedUrl"
            >
              <span>{{ isCopied ? 'کپی شد!' : 'کپی لینک' }}</span>
            </button>
          </div>

          <!-- خلاصه پارامترهای لینک صادرشده -->
          <div
            style="background: rgba(36, 30, 25, 0.5); border: 1px solid var(--border-subtle); border-radius: var(--r-sm); padding: 1.25rem; text-align: right; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.84rem;"
          >
            <div>
              <span style="color: var(--text-muted);">گیرنده:</span>
              <strong style="color: var(--text-ivory); margin-right: 0.5rem;">{{ generatedLink?.recipientName }}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted);">تعداد مدل مجاز:</span>
              <strong style="color: var(--gold-primary); margin-right: 0.5rem;">{{ selectedShoeIds.length }} مدل</strong>
            </div>
            <div>
              <span style="color: var(--text-muted);">شیوه احراز:</span>
              <strong style="color: var(--text-ivory); margin-right: 0.5rem;">{{ authMethod === 'DIRECT' ? 'مستقیم VIP' : 'پیامکی OTP' }}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted);">وضعیت:</span>
              <span class="dyf-badge dyf-badge-active" style="margin-right: 0.5rem;">فعال</span>
            </div>
          </div>
        </div>
      </div>

      <!-- فوتر و دکمه‌های ناوبری مراحل -->
      <div class="dyf-modal-footer" style="display: flex; justify-content: space-between;">
        <button
          v-if="step > 1 && step < 5"
          type="button"
          class="dyf-btn dyf-btn-outline"
          :disabled="isSubmitting"
          @click="prevStep"
        >
          مرحله قبل
        </button>
        <div v-else></div>

        <div style="display: flex; gap: 0.5rem;">
          <button type="button" class="dyf-btn dyf-btn-outline" @click="emit('close')">
            {{ step === 5 ? 'بستن' : 'انصراف' }}
          </button>
          <button
            v-if="step < 4"
            type="button"
            class="dyf-btn dyf-btn-primary"
            @click="nextStep"
          >
            <span>مرحله بعد</span>
          </button>
          <button
            v-else-if="step === 4"
            type="button"
            class="dyf-btn dyf-btn-primary"
            :disabled="isSubmitting"
            @click="nextStep"
          >
            <span>{{ isSubmitting ? 'در حال صدور لینک...' : 'صدور و دریافت لینک کاتالوگ' }}</span>
          </button>
          <a
            v-else-if="step === 5"
            :href="generatedUrl"
            target="_blank"
            class="dyf-btn dyf-btn-primary"
            rel="noopener noreferrer"
          >
            مشاهده زنده کاتالوگ
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dyf-modal-backdrop.is-open {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
