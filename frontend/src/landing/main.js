import '../styles/style.css';
import { initMobileMenu, closeMobileMenu, bindLenis } from './modules/mobile-menu.js';
import { initSpecularHighlight } from './modules/specular.js';
import { initInquiryForm } from './modules/inquiry-form.js';
import { initModelViewerControl } from './modules/model-viewer.js';
import { initScrollAnimations } from './modules/scroll-animations.js';
import { initWorkshopVideo } from './modules/workshop-video.js';

function bootstrapLanding() {
  initMobileMenu();

  initSpecularHighlight();

  initInquiryForm();

  initModelViewerControl();
  initWorkshopVideo();

  const { lenis } = initScrollAnimations({
    onNavClick: () => {
      closeMobileMenu();
    },
  });

  if (lenis) {
    bindLenis(lenis);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapLanding);
} else {
  bootstrapLanding();
}
