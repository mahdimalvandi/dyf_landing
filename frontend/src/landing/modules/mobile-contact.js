import '../../styles/mobile-contact.css';

export function initMobileContact() {
  const dock = document.querySelector('.mobile-bottom-dock');
  if (!dock) return;
  const menu = document.getElementById('hamburgerBtn');
  const contact = document.querySelector('.wh-direct-contact');
  let contactVisible = false;
  const isEditing = () => document.activeElement?.matches('input, textarea, select, [contenteditable="true"]');
  const update = () => {
    dock.hidden = menu?.getAttribute('aria-expanded') === 'true' || isEditing() || contactVisible;
  };
  if (menu) new MutationObserver(update).observe(menu, { attributes: true, attributeFilter: ['aria-expanded'] });
  if (contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      contactVisible = entry.isIntersecting;
      update();
    }).observe(contact);
  }
  document.addEventListener('focusin', update);
  document.addEventListener('focusout', () => queueMicrotask(update));
  update();
}
