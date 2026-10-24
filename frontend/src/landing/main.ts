/**
 * DYF Landing Page — Pure Vanilla ES Module Entry Point (FE-006)
 * Zero heavy component framework overhead.
 * High-performance, luxury interaction orchestrator.
 */

import { initMobileMenu } from './modules/mobileMenu';
import { initSpecularButtons } from './modules/specular';
import { initInquiryForm } from './modules/inquiryForm';
import { initHeroModelViewer } from './modules/modelViewer';
import { initScrollAnimations } from './modules/scrollAnimations';

function initLandingApp(): void {
  // 1. Mobile navigation drawer controller
  const menuController = initMobileMenu();

  // 2. Specular pointer highlight on luxury action buttons
  initSpecularButtons();

  // 3. B2B Inquiry form and status transitions
  initInquiryForm();

  // 4. Hero 3D emblem keyboard accessibility
  initHeroModelViewer();

  // 5. Lenis smooth scroll and GSAP ScrollTrigger animations
  initScrollAnimations(menuController);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLandingApp);
} else {
  initLandingApp();
}
