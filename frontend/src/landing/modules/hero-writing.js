export async function initHeroWriting() {
  const brand = document.querySelector('.hero-title-brand');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!brand || reducedMotion.matches) return;

  await document.fonts.ready;
  const letters = [...brand.textContent.trim()];
  const overlay = document.createElement('span');
  overlay.className = 'hero-brand-writing';
  overlay.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.className = 'hero-brand-typed';
  overlay.append(text);
  brand.append(overlay);

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if (reducedMotion.matches) {
      overlay.remove();
      return;
    }
    brand.classList.add('is-writing');
    let timer;
    let cancelled = false;
    const typeDelay = 320;
    const startDelay = 250;
    const visiblePause = 2000;
    const eraseDelay = 150;
    const clear = () => {
      cancelled = true;
      window.clearTimeout(timer);
      text.textContent = '';
      brand.classList.remove('is-writing');
      overlay.remove();
      reducedMotion.removeEventListener('change', clear);
    };
    const type = (index = 0) => {
      if (cancelled) return;
      if (index < letters.length) {
        text.textContent += letters[index];
        timer = window.setTimeout(() => type(index + 1), typeDelay);
        return;
      }
      timer = window.setTimeout(erase, visiblePause);
    };
    const erase = (index = letters.length) => {
      if (cancelled) return;
      if (index > 0) {
        text.textContent = letters.slice(0, index - 1).join('');
        timer = window.setTimeout(() => erase(index - 1), eraseDelay);
        return;
      }
      timer = window.setTimeout(() => type(0), 450);
    };
    timer = window.setTimeout(() => type(0), startDelay);
    reducedMotion.addEventListener('change', clear, { once: true });
  }, { threshold: 0.8 });
  observer.observe(brand);
}
