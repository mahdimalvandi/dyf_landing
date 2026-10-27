<template>
  <div
    v-if="isOpen && link"
    id="modalLinkDetails"
    class="dyf-modal-backdrop is-open"
    aria-hidden="false"
    @click="handleBackdropClick"
  >
    <div
      class="dyf-modal-card"
      style="max-width: 650px; max-height: 90vh; overflow-y: auto;"
      @click.stop
    >
      <div class="dyf-modal-header">
        <div>
          <h3 class="dyf-modal-title" id="linkDetailsModalTitle">جزئیات و مشخصات لینک ({{ link.id }})</h3>
          <p style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.2rem;" id="linkDetailsModalSubtitle">توکن ورود: {{ link.token }}</p>
        </div>
        <button type="button" class="dyf-modal-close" aria-label="بستن" @click="close">&times;</button>
      </div>

      <div class="dyf-modal-body" id="linkDetailsBody" style="padding: 1.5rem;">
        <!-- هدر لینک و وضعیت -->
        <div class="dyf-link-details-summary" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--r-md); padding: 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-ivory); margin-bottom: 0.25rem;">
              {{ link.recipientFa }}
            </div>
            <div style="font-size: 0.78rem; color: var(--gold-light);">
              شناسه سیستمی: {{ link.id }}
            </div>
          </div>
          <div style="text-align: left;">
            <span
              class="dyf-badge"
              :class="{
                'dyf-badge-active': link.status === 'active',
                'dyf-badge-pending': link.status === 'pending',
                'dyf-badge-archived': link.status === 'expired',
                'dyf-badge-disabled': link.status === 'revoked' || link.status === 'disabled'
              }"
            >
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <!-- جعبه نشانی URL و توکن -->
        <div class="dyf-link-url-box" style="padding: 0.75rem 1rem; margin-bottom: 1.25rem;">
          <span class="dyf-link-url-text" style="font-size: 0.8rem;">{{ fullUrl }}</span>
          <button type="button" class="dyf-btn dyf-btn-primary dyf-btn-sm js-copy-url" @click="copyUrl">
            <span>کپی نشانی</span>
          </button>
        </div>

        <!-- متاداده و تنظیمات -->
        <div class="dyf-link-meta-grid" style="margin-bottom: 1.25rem;">
          <div class="dyf-link-meta-item">
            <span style="color: var(--text-dim);">مهلت شروع دسترسی:</span>
            <span style="color: var(--gold-primary); font-weight: 600;">{{ formatDeadline(link.startDeadline) }}</span>
          </div>
          <div class="dyf-link-meta-item">
            <span style="color: var(--text-dim);">مدت زمان مشاهده:</span>
            <span style="color: var(--gold-light); font-weight: 700;">{{ formatDuration(link.viewingDuration) }}</span>
          </div>
          <div class="dyf-link-meta-item">
            <span style="color: var(--text-dim);">تاریخ صدور لینک:</span>
            <span style="direction: ltr; text-align: right;">{{ link.createdAt }}</span>
          </div>
          <div class="dyf-link-meta-item">
            <span style="color: var(--text-dim);">وضعیت دسترسی:</span>
            <span style="color: #4cd964; font-weight: 700;">لینک مستقیم فعال</span>
          </div>
        </div>

        <!-- باکس تعاملی خلاصه مدل‌های قابل دیدن -->
        <div id="linkDetailsShoesBox" class="dyf-link-details-shoes-trigger" title="جهت مشاهده فهرست مدل‌های مجاز این لینک کلیک کنید" @click="$emit('view-permitted', link)">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-primary);"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span style="color: var(--text-muted); font-weight: 600;">تعداد مدل‌های قابل دیدن :</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-weight: 800; color: var(--gold-light); font-size: 1.05rem;">{{ (link.addModels || []).length || 'همه' }} مدل</span>
            <span style="color: var(--gold-primary); font-size: 0.8rem; font-weight: 600;">(مشاهده مدل‌ها ←)</span>
          </div>
        </div>
      </div>

      <div class="dyf-modal-footer">
        <button type="button" class="dyf-btn dyf-btn-outline" @click="close">بستن</button>
        <button type="button" id="linkDetailsEditBtn" class="dyf-btn dyf-btn-primary" @click="$emit('edit', link)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          <span>ویرایش لینک</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  link: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'edit', 'revoke', 'extend', 'view-permitted']);

const fullUrl = computed(() => {
  if (!props.link) return '';
  return props.link.url || `${window.location.origin}/catalog?token=${props.link.token}`;
});

const statusLabel = computed(() => {
  if (!props.link) return '';
  const map = {
    active: 'فعال و آماده ورود',
    pending: 'در انتظار ورود خریدار',
    expired: 'منقضی‌شده',
    revoked: 'باطل‌شده',
    disabled: 'غیرفعال توسط مدیر',
  };
  return map[props.link.status] || props.link.status;
});

const formatDeadline = (dl) => {
  if (!dl || dl === 'none') return 'نامحدود';
  if (dl === '24h') return '۲۴ ساعت';
  if (dl === '3d') return '۳ روز';
  if (dl === '7d') return '۷ روز';
  return dl;
};

const formatDuration = (dur) => {
  if (!dur || dur === 'unlimited') return 'نامحدود';
  if (dur === '15m') return '۱۵ دقیقه';
  if (dur === '10m') return '۱۰ دقیقه';
  if (dur === '1h') return '۱ ساعت';
  return dur;
};

function copyUrl() {
  if (!fullUrl.value) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullUrl.value).then(() => {
      alert('نشانی لینک کپی شد');
    });
  } else {
    prompt('نشانی لینک:', fullUrl.value);
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
