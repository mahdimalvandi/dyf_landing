<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { customersService } from '@/shared/api/services';
import type { CustomerResponse, CreateCustomerRequest, UpdateCustomerRequest } from '@/shared/api/types';

const props = defineProps<{
  show: boolean;
  customerToEdit: CustomerResponse | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const form = ref({
  id: 0,
  firstNameFa: '',
  lastNameFa: '',
  storeName: '',
  phoneNumber: '',
  notes: '',
});

const isEditMode = computed(() => Boolean(props.customerToEdit && props.customerToEdit.ID > 0));

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      formError.value = null;
      if (props.customerToEdit) {
        form.value = {
          id: props.customerToEdit.ID,
          firstNameFa: props.customerToEdit.firstNameFa || '',
          lastNameFa: props.customerToEdit.lastNameFa || '',
          storeName: props.customerToEdit.storeName || '',
          phoneNumber: props.customerToEdit.phoneNumber || '',
          notes: props.customerToEdit.notes || '',
        };
      } else {
        form.value = {
          id: 0,
          firstNameFa: '',
          lastNameFa: '',
          storeName: '',
          phoneNumber: '',
          notes: '',
        };
      }
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  formError.value = null;
  const firstName = form.value.firstNameFa.trim();
  const lastName = form.value.lastNameFa.trim();
  const phone = form.value.phoneNumber.trim();

  if (!firstName || !lastName) {
    formError.value = 'نام و نام خانوادگی مشتری الزامی است.';
    return;
  }

  if (!/^09\d{9}$/.test(phone)) {
    formError.value = 'شماره تلفن همراه باید ۱۱ رقم بوده و با ۰۹ شروع شود.';
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      const payload: UpdateCustomerRequest = {
        firstNameFa: firstName,
        lastNameFa: lastName,
        storeName: form.value.storeName.trim() || undefined,
        phoneNumber: phone,
        notes: form.value.notes.trim() || undefined,
      };
      const res = await customersService.update(form.value.id, payload);
      if (res.success) {
        emit('saved');
        emit('close');
      } else {
        formError.value = res.message || 'خطا در ویرایش مشتری';
      }
    } else {
      const payload: CreateCustomerRequest = {
        firstNameFa: firstName,
        lastNameFa: lastName,
        storeName: form.value.storeName.trim() || undefined,
        phoneNumber: phone,
        notes: form.value.notes.trim() || undefined,
      };
      const res = await customersService.create(payload);
      if (res.success) {
        emit('saved');
        emit('close');
      } else {
        formError.value = res.message || 'خطا در ثبت مشتری جدید';
      }
    }
  } catch (err: any) {
    formError.value = err.message || 'خطای غیرمنتظره در ارتباط با سرور';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div v-if="show" class="dyf-modal-backdrop is-open" @click.self="emit('close')">
    <div class="dyf-modal-card" style="max-width: 580px; display: flex; flex-direction: column;">
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title">
            {{ isEditMode ? 'ویرایش مشخصات مشتری' : 'ثبت مشتری و همکار جدید' }}
          </h3>
        </div>
        <button type="button" class="dyf-modal-close" @click="emit('close')">&times;</button>
      </div>

      <form style="padding: 1.5rem;" @submit.prevent="handleSubmit">
        <div v-if="formError" class="dyf-alert dyf-alert-danger" style="margin-bottom: 1.25rem;">
          {{ formError }}
        </div>

        <!-- نام و نام خانوادگی -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label dyf-form-label-required">نام</label>
            <input
              v-model="form.firstNameFa"
              type="text"
              class="dyf-input"
              placeholder="مثال: مصطفی"
              required
            />
          </div>
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label dyf-form-label-required">نام خانوادگی</label>
            <input
              v-model="form.lastNameFa"
              type="text"
              class="dyf-input"
              placeholder="مثال: کمالی"
              required
            />
          </div>
        </div>

        <!-- نام فروشگاه و تلفن همراه -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label">فروشگاه / بنکداری</label>
            <input
              v-model="form.storeName"
              type="text"
              class="dyf-input"
              placeholder="مثال: بنکداری کفش سپهر"
            />
          </div>
          <div class="dyf-form-group" style="margin: 0;">
            <label class="dyf-form-label dyf-form-label-required">شماره تلفن همراه</label>
            <input
              v-model="form.phoneNumber"
              type="tel"
              class="dyf-input"
              placeholder="09121234567"
              dir="ltr"
              maxlength="11"
              required
            />
          </div>
        </div>

        <!-- یادداشت اختصاصی -->
        <div class="dyf-form-group" style="margin-bottom: 0;">
          <label class="dyf-form-label">یادداشت داخلی همکار</label>
          <textarea
            v-model="form.notes"
            class="dyf-textarea"
            rows="2"
            placeholder="شرایط تسویه، سابقه همکاری، نحوه ارسال و..."
          ></textarea>
        </div>
      </form>

      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" :disabled="isSubmitting" @click="emit('close')">
          انصراف
        </button>
        <button type="button" class="dyf-btn dyf-btn-primary" :disabled="isSubmitting" @click="handleSubmit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>{{ isSubmitting ? 'در حال ذخیره...' : (isEditMode ? 'بروزرسانی مشخصات' : 'ثبت مشتری') }}</span>
        </button>
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
