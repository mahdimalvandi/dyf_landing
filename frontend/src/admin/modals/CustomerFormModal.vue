<template>
  <div
    v-if="isOpen"
    id="modalCustomerForm"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 600px; display: flex; flex-direction: column;"
      @click.stop
    >
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title" id="customerFormModalTitle">
            {{ isEdit ? 'ویرایش اطلاعات مشتری' : 'ثبت مشتری و همکار جدید' }}
          </h3>
        </div>
        <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">
          &times;
        </button>
      </div>

      <form id="customerEditForm" style="padding: 1.5rem;" @submit.prevent="handleSubmit">
        <!-- نام و نام خانوادگی مشتری -->
        <div class="dyf-form-group" style="margin-bottom: 1.25rem;">
          <label class="dyf-form-label dyf-form-label-required">نام و نام خانوادگی مشتری</label>
          <input
            v-model="nameFa"
            type="text"
            id="customerFormNameFa"
            class="dyf-input"
            placeholder="مثال: حاج مصطفی کمالی"
            required
            autofocus
          />
        </div>

        <!-- نام فروشگاه / بنکداری و شماره تلفن -->
        <div
          class="dyf-form-row-2col dyf-form-row-grid"
          style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0;"
        >
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">عنوان فروشگاه / بنکداری</label>
            <input
              v-model="shop"
              type="text"
              id="customerFormShop"
              class="dyf-input"
              placeholder="مثال: بنکداری کفش کمالی (تهران)"
            />
          </div>
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label dyf-form-label-required">شماره تلفن همراه (ورود پیامکی)</label>
            <input
              v-model="phone"
              type="tel"
              id="customerFormPhone"
              class="dyf-input"
              placeholder="09121112233"
              style="direction: ltr; font-family: var(--font-title);"
              required
              @input="handlePhoneInput"
            />
          </div>
        </div>
      </form>

      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" @click="close">
          انصراف
        </button>
        <button
          type="button"
          id="saveCustomerBtn"
          class="dyf-btn dyf-btn-primary"
          :disabled="!nameFa.trim() || !phone.trim()"
          @click="handleSubmit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span id="saveCustomerBtnText">{{ isEdit ? 'ذخیره تغییرات مشتری' : 'ذخیره اطلاعات مشتری' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { toEnglishDigits } from '../../shared/utils/format.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  customer: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'save']);

const nameFa = ref('');
const shop = ref('');
const phone = ref('');

const isEdit = computed(() => !!props.customer);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.customer) {
        nameFa.value = props.customer.nameFa || '';
        shop.value = props.customer.shop || '';
        phone.value = props.customer.phone || '';
      } else {
        nameFa.value = '';
        shop.value = '';
        phone.value = '';
      }
    }
  }
);

function handlePhoneInput() {
  phone.value = toEnglishDigits(phone.value).replace(/\D/g, '');
}

function handleSubmit() {
  if (!nameFa.value.trim() || !phone.value.trim()) return;

  emit('save', {
    nameFa: nameFa.value.trim(),
    shop: shop.value.trim(),
    phone: toEnglishDigits(phone.value).trim(),
  });
}

function close() {
  emit('close');
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) close();
}
</script>
