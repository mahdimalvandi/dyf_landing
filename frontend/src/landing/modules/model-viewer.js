export function initModelViewerControl() {
  const heroModelViewer = document.querySelector('.hero-model-viewer');
  if (!heroModelViewer) return;

  const wrapper = heroModelViewer.closest('.hero-3d-wrapper');

  heroModelViewer.addEventListener('focus', () => {
    heroModelViewer.blur();
  });

  heroModelViewer.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      heroModelViewer.blur();
    }
  });

  heroModelViewer.addEventListener('error', (event) => {
    console.warn('ModelViewer: WebGL / 3D model load issue, fallback active.', event);
    if (wrapper) {
      wrapper.classList.add('has-model-error');
    }
  });

  heroModelViewer.addEventListener('load', () => {
    if (wrapper) {
      wrapper.classList.add('is-model-loaded');
    }
  });
}
