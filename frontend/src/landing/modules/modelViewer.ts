/**
 * DYF Landing — 3D Emblem Model Viewer Controller (FE-008)
 * Manages 3D emblem rendering, WebGL feature detection, luxury loading skeleton,
 * high-resolution fallback on error or weak environments, and scroll-hijack prevention.
 */

export interface ModelViewerController {
  isLoaded(): boolean;
  isFallbackActive(): boolean;
  reload(): void;
  destroy(): void;
}

/**
 * Detects whether the current browser environment has functional WebGL support.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function initHeroModelViewer(): ModelViewerController {
  const wrapper = document.querySelector<HTMLElement>('.hero-3d-wrapper');
  const heroModelViewer = document.querySelector<HTMLElement & { dismissPoster?: () => void }>(
    '.hero-model-viewer'
  );

  let loaded = false;
  let fallbackActive = false;
  let loadTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  const switchToFallback = (reason: string) => {
    if (fallbackActive || !wrapper) return;
    fallbackActive = true;
    if (loadTimeoutTimer) clearTimeout(loadTimeoutTimer);

    console.info(`[DYF 3D Emblem] WebGL/Model fallback active (${reason}). Displaying high-res 2D emblem.`);

    wrapper.innerHTML = `
      <div class="hero-3d-fallback" role="img" aria-label="نشان رسمی کارگاه دیف">
        <picture>
          <source srcset="assets/images/logo.webp" type="image/webp">
          <img
            src="assets/images/logo.png"
            alt="نشان رسمی برند DYF"
            class="hero-fallback-emblem"
            width="380"
            height="380"
            loading="eager"
            decoding="async">
        </picture>
      </div>
    `;
  };

  // 1. Check for WebGL capability immediately
  if (!isWebGLAvailable()) {
    switchToFallback('WebGL not supported');
    return {
      isLoaded: () => true,
      isFallbackActive: () => true,
      reload: () => {},
      destroy: () => {},
    };
  }

  // 2. Set up event listeners on model-viewer element
  if (heroModelViewer) {
    // Keyboard accessibility: Prevent arrow/space keys from getting swallowed by 3D canvas
    const handleKeydown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        heroModelViewer.blur();
      }
    };

    const handleFocus = () => {
      heroModelViewer.blur();
    };

    heroModelViewer.addEventListener('focus', handleFocus);
    heroModelViewer.addEventListener('keydown', handleKeydown);

    // Load success handler
    const handleLoad = () => {
      loaded = true;
      if (loadTimeoutTimer) clearTimeout(loadTimeoutTimer);
      const skeleton = wrapper?.querySelector<HTMLElement>('.hero-3d-skeleton');
      if (skeleton) {
        skeleton.style.opacity = '0';
        setTimeout(() => skeleton.remove(), 400);
      }
    };

    // Error handler
    const handleError = (e: Event) => {
      console.warn('[DYF 3D Emblem] Failed to load 3D model:', e);
      switchToFallback('model loading error');
    };

    heroModelViewer.addEventListener('load', handleLoad, { once: true });
    heroModelViewer.addEventListener('error', handleError, { once: true });

    // Fallback timeout: If model takes more than 10 seconds to load, switch to crisp fallback
    loadTimeoutTimer = setTimeout(() => {
      if (!loaded && !fallbackActive) {
        switchToFallback('timeout exceeded (10s)');
      }
    }, 10000);

    return {
      isLoaded: () => loaded,
      isFallbackActive: () => fallbackActive,
      reload: () => {
        if (heroModelViewer && typeof (heroModelViewer as any).dismissPoster === 'function') {
          (heroModelViewer as any).dismissPoster();
        }
      },
      destroy: () => {
        if (loadTimeoutTimer) clearTimeout(loadTimeoutTimer);
        heroModelViewer.removeEventListener('focus', handleFocus);
        heroModelViewer.removeEventListener('keydown', handleKeydown);
        heroModelViewer.removeEventListener('load', handleLoad);
        heroModelViewer.removeEventListener('error', handleError);
      },
    };
  }

  return {
    isLoaded: () => false,
    isFallbackActive: () => false,
    reload: () => {},
    destroy: () => {},
  };
}
