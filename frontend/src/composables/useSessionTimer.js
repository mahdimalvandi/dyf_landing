import { ref, computed, onUnmounted } from 'vue';

export function useSessionTimer() {
  const remainingSeconds = ref(0);
  const isWarning = ref(false);
  const isUnlimited = ref(false);
  const timerInterval = ref(null);
  let onExpireCallback = null;

  const formattedTime = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60);
    const secs = remainingSeconds.value % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  });

  function startTimer(session, onExpire) {
    stopTimer();
    onExpireCallback = onExpire;

    if (!session || session.duration === 'unlimited') {
      isUnlimited.value = true;
      return;
    }

    isUnlimited.value = false;

    let totalSeconds = 15 * 60;
    const match = String(session.duration || '').match(/^(\d+)([mhd])$/);
    if (match) {
      const val = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === 'm') totalSeconds = val * 60;
      else if (unit === 'h') totalSeconds = val * 3600;
      else if (unit === 'd') totalSeconds = val * 86400;
    }

    const elapsedSeconds = Math.floor((Date.now() - session.startTimestamp) / 1000);
    remainingSeconds.value = Math.max(0, totalSeconds - elapsedSeconds);
    isWarning.value = remainingSeconds.value < 120;

    const tick = () => {
      if (remainingSeconds.value <= 0) {
        stopTimer();
        if (typeof onExpireCallback === 'function') {
          onExpireCallback();
        }
        return;
      }

      remainingSeconds.value -= 1;
      isWarning.value = remainingSeconds.value < 120;
    };

    tick();
    timerInterval.value = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }

  onUnmounted(() => {
    stopTimer();
  });

  return {
    remainingSeconds,
    isWarning,
    isUnlimited,
    formattedTime,
    startTimer,
    stopTimer,
  };
}
