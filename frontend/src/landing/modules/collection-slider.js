export function initCollectionSlider() {
  const track = document.querySelector('.collection-preview__models');
  if (!track) return;
  const cards = [...track.querySelectorAll('.collection-model')];
  const controls = document.querySelector('.collection-controls');
  const pages = controls.querySelector('.collection-pages');
  const previous = controls.querySelector('[data-collection-prev]');
  const next = controls.querySelector('[data-collection-next]');
  const status = controls.querySelector('.collection-status');
  const mobile = window.matchMedia('(max-width: 760px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let page = 0;
  const size = () => mobile.matches ? 1 : 3;
  const count = () => Math.ceil(cards.length / size());
  function update() {
    previous.disabled = page === 0;
    next.disabled = page === count() - 1;
    [...pages.children].forEach((button, index) => {
      button.setAttribute('aria-current', String(index === page));
    });
    status.textContent = `${(page + 1).toLocaleString('fa-IR')} از ${count().toLocaleString('fa-IR')}`;
  }
  function goTo(index) {
    page = Math.max(0, Math.min(index, count() - 1));
    const card = cards[page * size()];
    const delta = card.getBoundingClientRect().right - track.getBoundingClientRect().right;
    track.scrollBy({ left: delta, behavior: reduced.matches ? 'instant' : 'smooth' });
    update();
  }
  function rebuild() {
    pages.replaceChildren();
    for (let index = 0; index < count(); index++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `نمایش صفحه ${(index + 1).toLocaleString('fa-IR')}`);
      button.addEventListener('click', () => goTo(index));
      pages.append(button);
    }
    goTo(0);
  }
  previous.addEventListener('click', () => goTo(page - 1));
  next.addEventListener('click', () => goTo(page + 1));
  track.addEventListener('keydown', (event) => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    goTo(page + (event.key === 'ArrowLeft' ? 1 : -1));
  });
  track.addEventListener('scroll', () => {
    const right = track.getBoundingClientRect().right;
    const nearest = cards.reduce((best, card, index) =>
      Math.abs(card.getBoundingClientRect().right - right) < Math.abs(cards[best].getBoundingClientRect().right - right) ? index : best, 0);
    page = Math.min(Math.floor(nearest / size()), count() - 1);
    update();
  }, { passive: true });
  mobile.addEventListener('change', rebuild);
  rebuild();
}
