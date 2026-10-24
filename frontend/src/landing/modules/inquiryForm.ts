/**
 * DYF Landing — B2B Inquiry Form Controller
 * Manages form submission, luxury success banner transition,
 * and form reset behavior.
 */

export function initInquiryForm(): void {
  const inquiryForm = document.getElementById('inquiryForm') as HTMLFormElement | null;
  const formSuccessBanner = document.getElementById('formSuccessBanner');
  const resetFormBtn = document.getElementById('resetFormBtn');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e: SubmitEvent) => {
      e.preventDefault();
      inquiryForm.style.display = 'none';
      if (formSuccessBanner) {
        formSuccessBanner.classList.add('active');
      }
    });
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
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
