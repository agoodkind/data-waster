/* ---------- constants ---------- */
const BYTES_PER_MB = 1_048_576;
const DOWNLOAD_SOURCE_FILE = "./data-waste.bin";
const DEFAULT_TARGET_DOWNLOAD_SIZE_MB = 10000;

// Timing constants
const UI_UPDATE_INTERVAL_MS = 50; // How often to update metrics display
const DOWNLOAD_RETRY_DELAY_MS = 50; // Delay between download attempts

// Performance monitoring
const SLOW_NETWORK_THRESHOLD_SECONDS = 30; // Time before showing slow network warning
const SLOW_NETWORK_SPEED = 1; // Speed threshold for slow network warning

// Thread management
const DEFAULT_THREAD_COUNT = 8; // Default number of concurrent connections

// Math constants
const PERCENT_MULTIPLIER = 100; // Convert decimal to percentage
const MS_PER_SECOND = 1000; // Milliseconds in a second

export {
  BYTES_PER_MB,
  DOWNLOAD_SOURCE_FILE,
  DEFAULT_TARGET_DOWNLOAD_SIZE_MB,
  UI_UPDATE_INTERVAL_MS,
  DOWNLOAD_RETRY_DELAY_MS,
  SLOW_NETWORK_THRESHOLD_SECONDS,
  SLOW_NETWORK_SPEED,
  DEFAULT_THREAD_COUNT,
  PERCENT_MULTIPLIER,
  MS_PER_SECOND,
};
