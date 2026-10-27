<template>
  <div
    v-if="isOpen"
    id="modalCreateLinkWizard"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 760px; max-height: 92vh; display: flex; flex-direction: column;"
      @click.stop
    >
      <div class="dyf-modal-header" style="border-bottom: none; padding-bottom: 0.5rem;">
        <div>
          <h3 class="dyf-modal-title">صدور لینک اختصاصی کاتالوگ</h3>
        </div>
        <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">&times;</button>
      </div>

      <!-- نوار استپ‌های ویزارد ۴ مرحله‌ای -->
      <div class="dyf-wizard-steps" id="linkWizardStepsBar">
        <div
          class="dyf-wizard-step"
          :class="{ 'is-active': currentStep === 1, 'is-done': currentStep > 1 }"
          data-step="1"
        >
          <div class="dyf-wizard-step-circle">۱</div>
          <span>مشخصات گیرنده</span>
        </div>
        <div
          class="dyf-wizard-step"
          :class="{ 'is-active': currentStep === 2, 'is-done': currentStep > 2 }"
          data-step="2"
        >
          <div class="dyf-wizard-step-circle">۲</div>
          <span>محصولات مجاز</span>
        </div>
        <div
          class="dyf-wizard-step"
          :class="{ 'is-active': currentStep === 3, 'is-done': currentStep > 3 }"
          data-step="3"
        >
          <div class="dyf-wizard-step-circle">۳</div>
          <span>زمان و اعتبار</span>
        </div>
        <div
          class="dyf-wizard-step"
          :class="{ 'is-active': currentStep === 4, 'is-done': currentStep === 4 }"
          data-step="4"
        >
          <div class="dyf-wizard-step-circle">۴</div>
          <span>دریافت لینک</span>
        </div>
      </div>

      <!-- محتوای مراحل -->
      <div style="flex: 1; overflow-y: auto;">
        <!-- مرحله اول: مشخصات گیرنده -->
        <div class="dyf-wizard-panel" :class="{ 'is-active': currentStep === 1 }" id="wizardPanel1">
          <div class="dyf-form-group" style="margin-bottom: 1.5rem;">
            <label class="dyf-form-label dyf-form-label-required">نام و نام خانوادگی گیرنده (شخص یا بنکدار)</label>
            <input
              v-model="recipientFa"
              type="text"
              id="wizardRecipientFa"
              class="dyf-input"
              placeholder="مثال: حاج مصطفی کمالی یا همکار گرامی"
              required
            >
            <p class="dyf-form-hint">این نام در بالای کاتالوگ به عنوان خوش‌آمدگویی اختصاصی برای مخاطب نمایش داده می‌شود.</p>
          </div>
        </div>

        <!-- مرحله دوم: تعیین محصولات مجاز -->
        <div class="dyf-wizard-panel" :class="{ 'is-active': currentStep === 2 }" id="wizardPanel2">
          <div id="wizardProductsWrap">
            <div class="dyf-cust-products-trigger-card">
              <div class="dyf-cust-products-trigger-info">
                <div class="dyf-cust-products-trigger-line">
                  <span id="wizardProductsBadge" class="dyf-badge dyf-badge-active">{{ allowedShoeIds.length }} مدل مجاز انتخاب شده</span>
                  <span id="wizardCategoriesSummary" style="font-size: 0.78rem; color: var(--gold-light);">{{ allowedShoeIds.length === totalShoesCount ? 'همه دسته‌بندی‌ها' : 'محدوده انتخابی' }}</span>
                </div>
              </div>
              <button
                type="button"
                id="btnOpenWizardProductPicker"
                class="dyf-btn dyf-btn-primary dyf-btn-sm"
                style="flex-shrink: 0;"
                @click="$emit('open-picker', { initialShoeIds: allowedShoeIds, onConfirm: handlePickerConfirm })"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="7" height="7" x="3" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/>
                  <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
                <span>انتخاب محصولات</span>
              </button>
            </div>
          </div>
        </div>

        <!-- مرحله سوم: زمان و اعتبار -->
        <div class="dyf-wizard-panel" :class="{ 'is-active': currentStep === 3 }" id="wizardPanel3">
          <div class="dyf-form-row-2col dyf-form-row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
            <div class="dyf-form-group" style="margin: 0;">
              <label class="dyf-form-label dyf-form-label-required">مهلت شروع دسترسی (انقضای ورود)</label>
              <div class="dyf-time-input-group">
                <input
                  v-model.number="deadlineValue"
                  type="number"
                  id="wizardDeadlineValue"
                  class="dyf-input dyf-time-val"
                  min="1"
                  max="999"
                  placeholder="مقدار"
                  :disabled="deadlineUnit === 'none'"
                >
                <select v-model="deadlineUnit" id="wizardDeadlineUnit" class="dyf-select dyf-time-unit">
                  <option value="d">روز</option>
                  <option value="h">ساعت</option>
                  <option value="m">دقیقه</option>
                  <option value="none">بدون مهلت (نامحدود)</option>
                </select>
              </div>
            </div>

            <div class="dyf-form-group" style="margin: 0;">
              <label class="dyf-form-label dyf-form-label-required">مدت مجاز مشاهده (پس از اولین ورود)</label>
              <div class="dyf-time-input-group">
                <input
                  v-model.number="durationValue"
                  type="number"
                  id="wizardDurationValue"
                  class="dyf-input dyf-time-val"
                  min="1"
                  max="999"
                  placeholder="مقدار"
                  :disabled="durationUnit === 'unlimited'"
                >
                <select v-model="durationUnit" id="wizardDurationUnit" class="dyf-select dyf-time-unit">
                  <option value="m">دقیقه</option>
                  <option value="h">ساعت</option>
                  <option value="d">روز</option>
                  <option value="unlimited">نامحدود</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- مرحله چهارم: صدور و دریافت لینک -->
        <div class="dyf-wizard-panel" :class="{ 'is-active': currentStep === 4 }" id="wizardPanel4">
          <!-- بخش نتیجه پس از صدور موفق لینک -->
          <div id="wizardSuccessResult" style="text-align: center; padding: 1rem 0;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(76, 217, 100, 0.2); border: 2px solid #4cd964; color: #4cd964; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style="font-family: var(--font-title); font-size: 1.2rem; font-weight: 800; color: var(--text-ivory); margin-bottom: 0.35rem;">لینک اختصاصی با موفقیت صادر شد!</h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem;">این لینک را کپی کرده و در اختیار خریدار یا بنکدار موردنظر قرار دهید.</p>

            <div class="dyf-link-url-box" style="margin-bottom: 1.25rem; padding: 0.75rem 1rem;">
              <span id="wizardGeneratedUrl" class="dyf-link-url-text" style="font-size: 0.82rem;">{{ fullGeneratedUrl }}</span>
              <button type="button" id="wizardCopyBtn" class="dyf-btn dyf-btn-primary dyf-btn-sm" @click="copyUrl">
                <span>کپی لینک</span>
              </button>
            </div>

            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-md); padding: 1.15rem; font-size: 0.82rem; display: flex; flex-direction: column; gap: 0.65rem; text-align: right;" id="wizardSummaryDetails">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">مخاطب لینک:</span>
                <span style="color: var(--text-ivory); font-weight: 700;">{{ recipientFa }}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">تعداد مدل‌های مجاز:</span>
                <span style="color: var(--gold-light); font-weight: 700;">{{ allowedShoeIds.length }} مدل</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">مهلت ورود اولیه:</span>
                <span style="color: var(--text-ivory);">{{ formatDeadlineText }}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">مدت جلسه مشاهده:</span>
                <span style="color: var(--text-ivory);">{{ formatDurationText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dyf-modal-footer dyf-wizard-footer" id="wizardModalFooter">
        <button
          v-if="currentStep > 1 && currentStep < 4"
          type="button"
          id="wizardPrevBtn"
          class="dyf-btn dyf-btn-outline"
          @click="prevStep"
        >
          مرحله قبل
        </button>
        <div class="dyf-wizard-footer-actions">
          <button type="button" class="dyf-btn dyf-btn-outline" @click="close">
            {{ currentStep === 4 ? 'بستن' : 'انصراف' }}
          </button>
          <button
            v-if="currentStep < 3"
            type="button"
            id="wizardNextBtn"
            class="dyf-btn dyf-btn-primary"
            :disabled="currentStep === 1 && !recipientFa.trim()"
            @click="nextStep"
          >
            مرحله بعد
          </button>
          <button
            v-else-if="currentStep === 3"
            type="button"
            id="wizardNextBtn"
            class="dyf-btn dyf-btn-primary"
            @click="generateLink"
          >
            صدور لینک اختصاصی
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  customers: {
    type: Array,
    default: () => [],
  },
  shoes: {
    type: Array,
    default: () => [],
  },
  prefillCustomer: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'link-created', 'open-picker']);

const currentStep = ref(1);
const recipientFa = ref('');
const recipientPhone = ref('');
const allowedShoeIds = ref([]);
const deadlineValue = ref(3);
const deadlineUnit = ref('d');
const durationValue = ref(15);
const durationUnit = ref('m');
const generatedToken = ref('');

const totalShoesCount = computed(() => props.shoes.length);

const fullGeneratedUrl = computed(() => {
  if (!generatedToken.value) return '';
  return `${window.location.origin}/catalog?token=${generatedToken.value}`;
});

const formatDeadlineText = computed(() => {
  if (deadlineUnit.value === 'none') return 'نامحدود (همیشگی)';
  const unitMap = { d: 'روز', h: 'ساعت', m: 'دقیقه' };
  return `${deadlineValue.value} ${unitMap[deadlineUnit.value] || 'روز'}`;
});

const formatDurationText = computed(() => {
  if (durationUnit.value === 'unlimited') return 'نامحدود';
  const unitMap = { m: 'دقیقه', h: 'ساعت', d: 'روز' };
  return `${durationValue.value} ${unitMap[durationUnit.value] || 'دقیقه'}`;
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      currentStep.value = 1;
      generatedToken.value = '';
      allowedShoeIds.value = props.shoes.map((s) => s.id);
      deadlineValue.value = 3;
      deadlineUnit.value = 'd';
      durationValue.value = 15;
      durationUnit.value = 'm';

      if (props.prefillCustomer) {
        recipientFa.value = props.prefillCustomer.nameFa || '';
        recipientPhone.value = props.prefillCustomer.phone || '';
      } else {
        recipientFa.value = '';
        recipientPhone.value = '';
      }
    }
  }
);

function handlePickerConfirm(shoeIds) {
  allowedShoeIds.value = [...shoeIds];
}

function nextStep() {
  if (currentStep.value === 1 && !recipientFa.value.trim()) return;
  if (currentStep.value < 4) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function generateLink() {

  const durationStr = durationUnit.value === 'unlimited' ? 'unlimited' : `${durationValue.value}${durationUnit.value}`;
  const deadlineStr = deadlineUnit.value === 'none' ? 'none' : `${deadlineValue.value}${deadlineUnit.value}`;

  const linkData = {
    recipientFa: recipientFa.value.trim(),
    phone: recipientPhone.value.trim(),
    customerId: props.prefillCustomer?.id || null,
    startDeadline: deadlineStr,
    viewingDuration: durationStr,
    addModels: [...allowedShoeIds.value],
    status: 'pending',
    views: 0,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  emit('link-created', linkData, (link) => {
    generatedToken.value = link.token;
    currentStep.value = 4;
  });
}

function copyUrl() {
  if (!fullGeneratedUrl.value) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullGeneratedUrl.value).then(() => {
      alert('لینک اختصاصی کاتالوگ با موفقیت کپی شد.');
    });
  } else {
    prompt('لینک اختصاصی کاتالوگ:', fullGeneratedUrl.value);
  }
}

function close() {
  emit('close');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close();
  }
}
</script>
