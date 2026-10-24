/**
 * DYF Landing — Specular Lighting Effect
 * Adds dynamic leather specular sheen by updating --x and --y CSS properties
 * on pointer movement over interactive luxury buttons.
 */

export function initSpecularButtons(): void {
  const buttons = document.querySelectorAll<HTMLElement>('.js-specular');

  buttons.forEach((button) => {
    const handlePointer = (clientX: number, clientY: number) => {
      const rect = button.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    };

    button.addEventListener(
      'mousemove',
      (e: MouseEvent) => {
        handlePointer(e.clientX, e.clientY);
      },
      { passive: true }
    );

    button.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches && e.touches[0]) {
          handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: true }
    );
  });
}
