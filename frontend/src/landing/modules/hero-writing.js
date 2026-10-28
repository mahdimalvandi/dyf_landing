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
    const timers = [];
    const finish = () => {
      timers.forEach(window.clearTimeout);
      brand.classList.remove('is-writing');
      overlay.remove();
      reducedMotion.removeEventListener('change', finish);
    };
    letters.forEach((letter, index) => {
      timers.push(window.setTimeout(() => {
        text.textContent += letter;
      }, 250 + index * 320));
    });
    timers.push(window.setTimeout(finish, 250 + letters.length * 320 + 600));
    reducedMotion.addEventListener('change', finish, { once: true });
  }, { threshold: 0.8 });
  observer.observe(brand);
}
