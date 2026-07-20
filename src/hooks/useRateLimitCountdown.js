import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_RETRY_SECONDS = 60;

function parseRetryAfter(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0
    ? Math.ceil(seconds)
    : DEFAULT_RETRY_SECONDS;
}

export function useRateLimitCountdown() {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRateLimit = useCallback((retryAfter) => {
    stopTimer();
    setSecondsRemaining(parseRetryAfter(retryAfter));
    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          stopTimer();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => stopTimer, [stopTimer]);

  return {
    isRateLimited: secondsRemaining > 0,
    secondsRemaining,
    startRateLimit,
  };
}
