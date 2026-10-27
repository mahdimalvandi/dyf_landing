<template>
  <div
    v-if="isOpen && link"
    id="modalEditLink"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 760px; max-height: 92vh; display: flex; flex-direction: column;"
      @click.stop
    >
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title" id="editLinkModalTitle">ویرایش لینک اختصاصی</h3>
          <p style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.2rem;">ویرایش نام گیرنده، محصولات مجاز و تنظیمات زمان‌بندی</p>
        </div>
        <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">&times;</button>
      </div>

      <div class="dyf-modal-body" style="flex: 1; overflow-y: auto; padding: 1.5rem;">
        <input type="hidden" id="editLinkId" :value="link.id">

        <!-- نام گیرنده -->
        <div class="dyf-form-group" style="margin-bottom: 1.25rem;">
          <label class="dyf-form-label dyf-form-label-required">نام گیرنده لینک</label>
          <input
            v-model="recipientFa"
            type="text"
            id="editLinkRecipientFa"
            class="dyf-input"
            placeholder="نام گیرنده..."
            required
            autofocus
          >
        </div>

        <!-- انتخاب محصولات مجاز -->
        <div class="dyf-form-group" style="margin-bottom: 1.25rem;">
          <label class="dyf-form-label">محصولات و مدل‌های مجاز این لینک</label>
          <div id="editLinkProductsWrap">
            <div class="dyf-cust-products-trigger-card">
              <div class="dyf-cust-products-trigger-info">
                <div class="dyf-cust-products-trigger-line">
                  <span id="editLinkProductsBadge" class="dyf-badge dyf-badge-active">{{ allowedShoeIds.length }} مدل مجاز انتخاب شده</span>
                  <span id="editLinkCategoriesSummary" style="font-size: 0.78rem; color: var(--gold-light);">{{ allowedShoeIds.length === totalShoesCount ? 'همه دسته‌بندی‌ها' : 'محدوده انتخابی' }}</span>
                </div>
              </div>
              <button
                type="button"
                id="btnOpenEditLinkProductPicker"
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

        <!-- تنظیمات زمان‌بندی -->
        <div class="dyf-form-row-2col dyf-form-row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">مهلت شروع دسترسی (انقضای ورود)</label>
            <div class="dyf-time-input-group">
              <input
                v-model.number="deadlineValue"
                type="number"
                id="editLinkDeadlineValue"
                class="dyf-input dyf-time-val"
                min="1"
                max="999999"
                placeholder="مقدار"
                :disabled="deadlineUnit === 'none'"
              >
              <select v-model="deadlineUnit" id="editLinkDeadlineUnit" class="dyf-select dyf-time-unit">
                <option value="d">روز</option>
                <option value="h">ساعت</option>
                <option value="m">دقیقه</option>
                <option value="none">بدون مهلت (نامحدود)</option>
              </select>
            </div>
          </div>

          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">مدت مجاز مشاهده (پس از اولین ورود)</label>
            <div class="dyf-time-input-group">
              <input
                v-model.number="durationValue"
                type="number"
                id="editLinkDurationValue"
                class="dyf-input dyf-time-val"
                min="1"
                max="999999"
                placeholder="مقدار"
                :disabled="durationUnit === 'unlimited'"
              >
              <select v-model="durationUnit" id="editLinkDurationUnit" class="dyf-select dyf-time-unit">
                <option value="m">دقیقه</option>
                <option value="h">ساعت</option>
                <option value="d">روز</option>
                <option value="unlimited">نامحدود</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" @click="close">انصراف</button>
        <button type="button" id="saveEditLinkBtn" class="dyf-btn dyf-btn-primary" @click="handleSave">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>ذخیره تغییرات لینک</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  link: {
    type: Object,
    default: null,
  },
  totalShoesCount: {
    type: Number,
    default: 18,
  },
});

const emit = defineEmits(['close', 'save', 'open-picker']);

const recipientFa = ref('');
const allowedShoeIds = ref([]);
const deadlineValue = ref(3);
const deadlineUnit = ref('d');
const durationValue = ref(15);
const durationUnit = ref('m');

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.link) {
      recipientFa.value = props.link.recipientFa || '';
      allowedShoeIds.value = props.link.addModels && props.link.addModels.length > 0
        ? [...props.link.addModels]
        : [];

      parseDeadline(props.link.startDeadline || '3d');
      parseDuration(props.link.viewingDuration || '15m');
    }
  }
);

function parseDeadline(val) {
  if (val === 'none') {
    deadlineUnit.value = 'none';
    deadlineValue.value = 1;
  } else {
    const unit = val.slice(-1);
    const num = parseInt(val, 10);
    deadlineUnit.value = ['d', 'h', 'm'].includes(unit) ? unit : 'd';
    deadlineValue.value = isNaN(num) ? 3 : num;
  }
}

function parseDuration(val) {
  if (val === 'unlimited') {
    durationUnit.value = 'unlimited';
    durationValue.value = 1;
  } else {
    const unit = val.slice(-1);
    const num = parseInt(val, 10);
    durationUnit.value = ['m', 'h', 'd'].includes(unit) ? unit : 'm';
    durationValue.value = isNaN(num) ? 15 : num;
  }
}

function handlePickerConfirm(shoeIds) {
  allowedShoeIds.value = [...shoeIds];
}

function handleSave() {
  if (!recipientFa.value.trim()) return;

  const deadlineStr = deadlineUnit.value === 'none' ? 'none' : `${deadlineValue.value}${deadlineUnit.value}`;
  const durationStr = durationUnit.value === 'unlimited' ? 'unlimited' : `${durationValue.value}${durationUnit.value}`;

  emit('save', {
    ...props.link,
    recipientFa: recipientFa.value.trim(),
    addModels: [...allowedShoeIds.value],
    startDeadline: deadlineStr,
    expiresAt: deadlineUnit.value === 'none' ? 0 : Math.floor(Date.now() / 1000) + deadlineValue.value * (deadlineUnit.value === 'd' ? 86400 : deadlineUnit.value === 'h' ? 3600 : 60),
    viewingDuration: durationStr,
  });
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
