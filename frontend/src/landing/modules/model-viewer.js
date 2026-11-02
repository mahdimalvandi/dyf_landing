export function supportsWebGL() {
  const canvas = document.createElement('canvas');
  try {
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export async function initModelViewerControl() {
  const viewer = document.querySelector('.hero-model-viewer');
  if (!viewer) return;
  const wrapper = viewer.closest('.hero-3d-wrapper');
  const fallback = wrapper?.querySelector('.hero-fallback-emblem');
  fallback?.setAttribute('aria-hidden', 'true');
  let observer;
  let failed = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function showFallback() {
    failed = true;
    observer?.disconnect();
    viewer.removeAttribute('auto-rotate');
    viewer.removeAttribute('src');
    wrapper?.classList.remove('is-model-loaded');
    wrapper?.classList.add('has-model-error');
    fallback?.removeAttribute('aria-hidden');
    viewer.setAttribute('aria-hidden', 'true');
  }

  // Register before importing the element: initialization can fail immediately.
  viewer.addEventListener('error', showFallback);
  viewer.addEventListener('load', () => {
    if (failed) return;
    wrapper?.classList.add('is-model-loaded');
    fallback?.setAttribute('aria-hidden', 'true');
  });

  if (!supportsWebGL()) {
    showFallback();
    return;
  }

  try {
    await import('../../../assets/js/model-viewer.min.js');
    await customElements.whenDefined('model-viewer');
    if (failed) return;
    viewer.setAttribute('src', viewer.dataset.src);
    let inView = true;
    const updateRotation = () => {
      viewer.toggleAttribute('auto-rotate', !failed && inView && !document.hidden && !reducedMotion.matches);
    };
    observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateRotation();
    });
    observer.observe(viewer);
    reducedMotion.addEventListener('change', updateRotation);
    document.addEventListener('visibilitychange', updateRotation);
    updateRotation();
  } catch {
    showFallback();
  }
}
