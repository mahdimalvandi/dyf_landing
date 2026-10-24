/**
 * DYF Landing — 3D Emblem Model Viewer Controller
 * Manages accessibility and neutralizes scroll-intercepting keyboard keys (arrows, space)
 * on the hero <model-viewer> component.
 */

export function initHeroModelViewer(): void {
  const heroModelViewer = document.querySelector<HTMLElement>('.hero-model-viewer');

  if (heroModelViewer) {
    heroModelViewer.addEventListener('focus', () => {
      heroModelViewer.blur();
    });

    heroModelViewer.addEventListener('keydown', (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        heroModelViewer.blur();
      }
    });
  }
}
