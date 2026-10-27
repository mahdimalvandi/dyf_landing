export function initSpecularHighlight() {
  const buttons = document.querySelectorAll('.js-specular');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    const handlePointer = (clientX, clientY) => {
      const rect = button.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    };

    button.addEventListener('mousemove', (e) => handlePointer(e.clientX, e.clientY));
    button.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
  });
}
