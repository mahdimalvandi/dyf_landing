export function allowsWorkshopAutoplay(reducedMotion, saveData) {
  return !reducedMotion && !saveData;
}

export function initWorkshopVideo() {
  const section = document.querySelector('.workshop-film');
  const video = section?.querySelector('video');
  if (!video) return;

  video.muted = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let inView = false;
  let userPaused = false;
  let userRequested = false;
  let failed = false;
  const shouldPlay = () => inView && !document.hidden && !userPaused && !failed
    && (userRequested || allowsWorkshopAutoplay(reducedMotion.matches, connection?.saveData));

  async function updatePlayback() {
    if (!shouldPlay()) { video.pause(); return; }
    if (!video.hasAttribute('src')) video.setAttribute('src', video.dataset.src);
    try {
      await video.play();
      if (!shouldPlay()) video.pause();
    } catch {
      // Autoplay may be denied; clicking the frame can still start playback.
    }
  }

  video.addEventListener('loadeddata', () => section.classList.add('is-ready'));
  video.addEventListener('playing', () => { if (!shouldPlay()) video.pause(); });
  video.addEventListener('error', () => {
    failed = true;
    section.classList.add('has-error');
  });

  function togglePlayback() {
    if (!video.paused && !failed) {
      userPaused = true;
      userRequested = false;
      video.pause();
      return;
    }
    if (failed) {
      failed = false;
      section.classList.remove('has-error', 'is-ready');
      video.removeAttribute('src');
      video.load();
    }
    userPaused = false;
    userRequested = true;
    updatePlayback();
  }
  video.addEventListener('click', togglePlayback);
  video.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      togglePlayback();
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      updatePlayback();
    }, { threshold: [0, 0.2] }).observe(video);
  } else {
    inView = true;
    userPaused = true;
  }
  const updatePreferences = () => { userRequested = false; updatePlayback(); };
  reducedMotion.addEventListener('change', updatePreferences);
  connection?.addEventListener('change', updatePreferences);
  document.addEventListener('visibilitychange', updatePlayback);
}
