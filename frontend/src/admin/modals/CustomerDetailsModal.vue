<template>
  <div
    v-if="isOpen && customer"
    id="modalCustomerDetails"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 740px; max-height: 90vh; display: flex; flex-direction: column;"
      @click.stop
    >
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title" id="custDetailsTitle">پروفایل و دسترسی مستقیم مشتری</h3>
        </div>
        <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">&times;</button>
      </div>

      <div class="dyf-modal-body" style="flex: 1; overflow-y: auto; padding: 1.5rem;">
        <!-- کارت خلاصه مشخصات هویتی -->
        <div class="dyf-cust-details-identity-card" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-md); padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div id="custDetailsAvatar" class="dyf-customer-avatar" style="width: 52px; height: 52px; font-size: 1.1rem;">{{ initials }}</div>
            <div>
              <div id="custDetailsNameFa" style="font-family: var(--font-title); font-size: 1.1rem; font-weight: 800; color: var(--text-ivory);">{{ customer.nameFa }}</div>
              <div id="custDetailsShop" style="font-size: 0.8rem; color: var(--leather-caramel); margin-top: 0.2rem;">{{ customer.shop || 'همکار کارگاه' }}</div>
            </div>
          </div>
          <div style="text-align: left;">
            <div id="custDetailsPhone" style="font-family: var(--font-title); font-size: 0.95rem; font-weight: 700; color: var(--gold-light); direction: ltr;">{{ customer.phone }}</div>
          </div>
        </div>

        <!-- پنل مستقل مدیریت دسترسی مستقیم مشتری -->
        <div class="dyf-direct-access-panel">
          <div class="dyf-direct-access-header">
            <div>
              <h4 style="font-family: var(--font-title); font-size: 0.98rem; font-weight: 800; color: var(--gold-light); margin-bottom: 0.2rem;">
                دسترسی مستقیم به کاتالوگ
              </h4>
            </div>
            <label class="dyf-switch-label">
              <input type="checkbox" id="directAccessToggle" v-model="accessEnabled" class="dyf-switch-input">
              <div class="dyf-switch-toggle"></div>
              <span id="directAccessStatusLabel" style="font-size: 0.82rem; font-weight: 700; color: var(--gold-primary);">
                {{ accessEnabled ? 'دسترسی فعال' : 'دسترسی غیرفعال' }}
              </span>
            </label>
          </div>

          <div id="directAccessControlsWrap" v-if="accessEnabled">
            <!-- محصولات و دسته‌بندی‌های مجاز مشتری -->
            <div class="dyf-form-group">
              <label class="dyf-form-label">محصولات و دسته‌بندی‌های مجاز مشتری</label>
              <div id="directAccessProductsWrap">
                <div class="dyf-cust-products-trigger-card">
                  <div class="dyf-cust-products-trigger-info">
                    <div class="dyf-cust-products-trigger-line">
                      <span id="custDirectProductsBadge" class="dyf-badge dyf-badge-active">{{ allowedShoeIds.length }} مدل مجاز انتخاب شده</span>
                      <span id="custDirectCategoriesSummary" style="font-size: 0.78rem; color: var(--gold-light);">{{ allowedShoeIds.length === totalShoesCount ? 'همه دسته‌بندی‌ها' : 'محدوده انتخابی' }}</span>
                    </div>
                  </div>
                  <button type="button" id="btnOpenProductPicker" class="dyf-btn dyf-btn-primary dyf-btn-sm" style="flex-shrink: 0;" @click="$emit('open-picker', { initialShoeIds: allowedShoeIds, onConfirm: handlePickerConfirm })">
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

            <!-- مدت مشاهده و مهلت شروع -->
            <div class="dyf-form-row-2col dyf-form-row-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
              <div class="dyf-form-group" style="margin: 0;">
                <label class="dyf-form-label">مدت مجاز مشاهده (پس از اولین ورود موفق)</label>
                <div class="dyf-time-input-group">
                  <input type="number" id="directAccessDurationValue" v-model.number="durationValue" class="dyf-input dyf-time-val" min="1" max="999" placeholder="مقدار" :disabled="durationUnit === 'unlimited'">
                  <select id="directAccessDurationUnit" v-model="durationUnit" class="dyf-select dyf-time-unit">
                    <option value="m">دقیقه</option>
                    <option value="h">ساعت</option>
                    <option value="d">روز</option>
                    <option value="unlimited">نامحدود</option>
                  </select>
                </div>
              </div>

              <div class="dyf-form-group" style="margin: 0;">
                <label class="dyf-form-label">آخرین مهلت شروع دسترسی (انقضای ورود)</label>
                <div class="dyf-time-input-group">
                  <input type="number" id="directAccessDeadlineValue" v-model.number="deadlineValue" class="dyf-input dyf-time-val" min="1" max="999" placeholder="مقدار" :disabled="deadlineUnit === 'none'">
                  <select id="directAccessDeadlineUnit" v-model="deadlineUnit" class="dyf-select dyf-time-unit">
                    <option value="d">روز</option>
                    <option value="h">ساعت</option>
                    <option value="m">دقیقه</option>
                    <option value="none">بدون مهلت (نامحدود)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" @click="close">بستن</button>
        <button type="button" id="saveDirectAccessBtn" class="dyf-btn dyf-btn-primary" @click="handleSave">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>ذخیره تنظیمات دسترسی مستقیم</span>
        </button>
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
  customer: {
    type: Object,
    default: null,
  },
  totalShoesCount: {
    type: Number,
    default: 18,
  },
  allShoes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'save', 'open-picker']);

const accessEnabled = ref(false);
const allowedShoeIds = ref([]);
const durationValue = ref(15);
const durationUnit = ref('m');
const deadlineValue = ref(3);
const deadlineUnit = ref('d');

const initials = computed(() => {
  if (!props.customer?.nameFa) return 'م‌ک';
  return props.customer.nameFa
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('‌');
});

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.customer) {
      const da = props.customer.directAccess || {};
      accessEnabled.value = !!da.enabled;
      allowedShoeIds.value = da.addModels && da.addModels.length
        ? [...da.addModels]
        : props.allShoes.map((s) => s.id);

      parseDuration(da.duration || '15m');
      parseDeadline(da.deadline || '3d');
    }
  }
);

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

function handlePickerConfirm(shoeIds) {
  allowedShoeIds.value = [...shoeIds];
}

function handleSave() {
  const durationStr = durationUnit.value === 'unlimited' ? 'unlimited' : `${durationValue.value}${durationUnit.value}`;
  const deadlineStr = deadlineUnit.value === 'none' ? 'none' : `${deadlineValue.value}${deadlineUnit.value}`;

  const directAccessSettings = {
    enabled: accessEnabled.value,
    addModels: [...allowedShoeIds.value],
    duration: durationStr,
    deadline: deadlineStr,
  };

  emit('save', {
    id: props.customer.id,
    directAccess: directAccessSettings,
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
