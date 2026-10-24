/**
 * DYF Mock Initializer
 * Conditionally loads and installs mock interceptor in development.
 * Statically eliminated from production bundles via tree-shaking.
 */

export async function initMocks(): Promise<void> {
  // Guaranteed tree-shaking in production: import.meta.env.DEV is replaced with false
  if (
    import.meta.env.DEV &&
    (import.meta.env.VITE_ENABLE_MOCK === 'true' || import.meta.env.VITE_ENABLE_MOCK === true)
  ) {
    const { setupMockServer } = await import('./browser');
    setupMockServer();
  }
}
