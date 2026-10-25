<template>
  <!-- ==================================================================
       ویو ۶: آزمایشگاه کامپوننت‌های مشترک (#components — UI Kit مرجع کدها)
       این بخش در سایدبار نمایش داده نمی‌شود و به عنوان مرجع الگو و دیزاین سیستم در کدها حفظ شده است.
       ================================================================== -->
  <section id="viewComponents" class="dyf-view is-active">
    <div class="dyf-panel-card">
      <div class="dyf-panel-card-header">
        <div>
          <h2 class="dyf-panel-card-title">کیت کامپوننت‌های پایه و مشترک دیزاین سیستم DYF</h2>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">
            تمام المان‌های زیر با استانداردهای Design System v4 توسعه داده شده و آماده استفاده در تسک‌های ۲ تا ۷ هستند.
          </p>
        </div>
      </div>

      <div style="padding: 1.5rem;">
        <!-- ۱. دکمه‌ها -->
        <div class="dyf-demo-section">
          <h3 class="dyf-demo-title">۱. دکمه‌های کنترلی و اکشن‌ها (Buttons)</h3>
          <div class="dyf-demo-row">
            <button type="button" class="dyf-btn dyf-btn-primary">دکمه طلایی اصلی (Primary)</button>
            <button type="button" class="dyf-btn dyf-btn-specular">دکمه چرم تیره (Specular)</button>
            <button type="button" class="dyf-btn dyf-btn-outline">دکمه آوت‌لاین (Outline)</button>
            <button type="button" class="dyf-btn dyf-btn-danger">دکمه حذف/هشدار (Danger)</button>
            <button type="button" class="dyf-btn dyf-btn-primary" disabled>دکمه غیرفعال (Disabled)</button>
            <button
              type="button"
              id="demoBtnLoading"
              class="dyf-btn dyf-btn-primary"
              :class="{ 'is-loading': isLoadingBtn }"
              @click="toggleBtnLoading"
            >
              {{ isLoadingBtn ? 'در حال بارگذاری...' : 'تست لودینگ دکمه' }}
            </button>
          </div>
        </div>

        <!-- ۲. ورودی‌های فرم و کنترل‌ها -->
        <div class="dyf-demo-section">
          <h3 class="dyf-demo-title">۲. ورودی‌های فرم و سلکت‌باکس (Form Controls)</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
            <div class="dyf-form-group" style="margin: 0;">
              <label class="dyf-form-label dyf-form-label-required">عنوان مدل کفش</label>
              <input type="text" class="dyf-input" placeholder="مثال: کفش رسمی دربی چرم طبیعی" value="دیفندر هورس واکس دست‌دوز">
              <p class="dyf-form-hint">نام رسمی محصول جهت نمایش به بنکدار</p>
            </div>

            <div class="dyf-form-group" style="margin: 0;">
              <label class="dyf-form-label">دسته‌بندی مدل</label>
              <select class="dyf-select">
                <option>لاین رسمی و اداری (Formal & Dress)</option>
                <option>لاین اسپرت و کژوال (Sport & Casual)</option>
                <option>لاین چرم لوکس دست‌دوز (Handmade)</option>
              </select>
            </div>

            <div class="dyf-form-group" style="margin: 0;">
              <label class="dyf-form-label">حالت خطا (Validation Error)</label>
              <input type="text" class="dyf-input dyf-input-error" value="کد غیرمجاز">
              <p class="dyf-form-hint dyf-form-hint-error">شناسه واردشده قبلاً ثبت گردیده است.</p>
            </div>
          </div>

          <div class="dyf-demo-row" style="margin-top: 1.25rem;">
            <label class="dyf-switch-label">
              <input type="checkbox" class="dyf-switch-input" checked>
              <span class="dyf-switch-toggle"></span>
              <span>وضعیت انتشار در کاتالوگ عمومی همکاران</span>
            </label>

            <label class="dyf-switch-label" style="margin-right: 1.5rem;">
              <input type="checkbox" class="dyf-switch-input">
              <span class="dyf-switch-toggle"></span>
              <span>الزام ورود با پیامک کد تأیید (OTP)</span>
            </label>
          </div>
        </div>

        <!-- ۳. برچسب‌های وضعیت -->
        <div class="dyf-demo-section">
          <h3 class="dyf-demo-title">۳. برچسب‌های وضعیت داده (Status Badges)</h3>
          <div class="dyf-demo-row">
            <span class="dyf-badge dyf-badge-published">منتشرشده (Published)</span>
            <span class="dyf-badge dyf-badge-draft">پیش‌نویس کارگاه (Draft)</span>
            <span class="dyf-badge dyf-badge-archived">بایگانی‌شده (Archived)</span>
            <span class="dyf-badge dyf-badge-expired">منقضی‌شده (Expired)</span>
            <span class="dyf-badge dyf-badge-info">دسترسی مستقیم (Direct)</span>
          </div>
        </div>

        <!-- ۴. اعلان‌ها و دیالوگ تأیید -->
        <div class="dyf-demo-section">
          <h3 class="dyf-demo-title">۴. اعلان‌های سیستم و دیالوگ تأیید (Toasts & Modals)</h3>
          <div class="dyf-demo-row">
            <button type="button" id="demoToastSuccess" class="dyf-btn dyf-btn-outline dyf-btn-sm" @click="showToast('success')">تست اعلان موفقیت</button>
            <button type="button" id="demoToastError" class="dyf-btn dyf-btn-outline dyf-btn-sm" @click="showToast('error')">تست اعلان خطا</button>
            <button type="button" id="demoToastWarning" class="dyf-btn dyf-btn-outline dyf-btn-sm" @click="showToast('warning')">تست اعلان هشدار</button>
            <button type="button" id="demoToastInfo" class="dyf-btn dyf-btn-outline dyf-btn-sm" @click="showToast('info')">تست اعلان اطلاعات</button>
            <button type="button" id="demoConfirmModal" class="dyf-btn dyf-btn-danger dyf-btn-sm" @click="testConfirm">تست دیالوگ تأیید عملیات حساس</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const isLoadingBtn = ref(false);

const toggleBtnLoading = () => {
  isLoadingBtn.value = true;
  setTimeout(() => {
    isLoadingBtn.value = false;
  }, 2000);
};

const showToast = (type) => {
  alert(`اعلان دمو: ${type}`);
};

const testConfirm = () => {
  if (confirm('آیا از انجام این عملیات حساس اطمینان دارید؟')) {
    alert('عملیات تأیید شد.');
  }
};
</script>
