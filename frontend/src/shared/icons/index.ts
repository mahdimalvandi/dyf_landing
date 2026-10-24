/**
 * DYF Design System — Shared SVG Icons Library
 * Standard Lucide/Feather stroke-based icons matching luxury atelier aesthetics.
 */

export interface IconOptions {
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  style?: string;
}

export const icons = {
  // Navigation & General
  search: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>`,

  filter: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>`,

  close: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`,

  check: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,

  plus: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

  edit: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 16}" height="${opts.size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>`,

  trash: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 16}" height="${opts.size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>`,

  eye: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 16}" height="${opts.size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>`,

  copy: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 16}" height="${opts.size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>`,

  link: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>`,

  externalLink: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>`,

  lock: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 24}" height="${opts.size || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`,

  logout: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 16}" height="${opts.size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>`,

  user: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>`,

  users: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,

  clock: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 16}" height="${opts.size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>`,

  chevronLeft: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="m15 18-6-6 6-6"/>
    </svg>`,

  chevronRight: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="m9 18 6-6-6-6"/>
    </svg>`,

  chevronDown: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 16}" height="${opts.size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="m6 9 6 6 6-6"/>
    </svg>`,

  // Feedback & Status
  alertCircle: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,

  alertTriangle: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>`,

  info: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>`,

  successCircle: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
    </svg>`,

  // Media & Actions
  upload: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 24}" height="${opts.size || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 1.5}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>`,

  zoomIn: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>`,

  zoomOut: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>`,

  rotateCcw: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 18}" height="${opts.size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
    </svg>`,

  empty: (opts: IconOptions = {}) => `
    <svg class="${opts.className || 'dyf-empty-icon'}" width="${opts.size || 24}" height="${opts.size || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 1.5}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m9 9 4 4"/><path d="m13 9-4 4"/>
    </svg>`,

  // Atelier Badges
  shield: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,

  award: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>`,

  briefcase: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>`,

  zap: (opts: IconOptions = {}) => `
    <svg class="${opts.className || ''}" width="${opts.size || 20}" height="${opts.size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="${opts.style || ''}">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>`,
};

export type IconName = keyof typeof icons;

export function renderIcon(name: IconName, options: IconOptions = {}): string {
  const iconFn = icons[name];
  if (!iconFn) {
    console.warn(`[DYF Icons] Unknown icon name: "${name}"`);
    return '';
  }
  return iconFn(options);
}
