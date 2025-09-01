/**
 * Creates a rate-limited logger that only logs errors once per second
 * @returns A function that logs errors with rate limiting
 */
export const createRateLimitedLogger = () => {
  let lastLogTime = 0;
  const LOG_INTERVAL_MS = 1000;

  return (error: unknown): void => {
    const now = Date.now();
    if (now - lastLogTime > LOG_INTERVAL_MS) {
      console.error(error);
      lastLogTime = now;
    }
  };
};

/**
 * Default rate-limited logger instance
 * Logs errors at most once per second
 */
export const logOnce = createRateLimitedLogger();
