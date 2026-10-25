/**
 * ماژول مدیریت فرم استعلام سفارش عمده B2B
 * شامل اعتبارسنجی اولیه، نمایش بنر موفقیت و بازنشانی فرم
 * @module landing/modules/inquiry-form
 */

export function initInquiryForm() {
  const inquiryForm = document.getElementById('inquiryForm');
  const formSuccessBanner = document.getElementById('formSuccessBanner');
  const resetFormBtn = document.getElementById('resetFormBtn');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      inquiryForm.style.display = 'none';
      if (formSuccessBanner) {
        formSuccessBanner.classList.add('active');
      }
    });
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      if (formSuccessBanner) {
        formSuccessBanner.classList.remove('active');
      }
      if (inquiryForm) {
        inquiryForm.reset();
        inquiryForm.style.display = 'flex';
      }
    });
  }
}
