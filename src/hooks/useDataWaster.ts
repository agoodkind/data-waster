import { useCallback, useEffect, useRef, useState } from "react";
import { sleep } from "@util/async";
import { logOnce } from "@util/logging";
import {
  BYTES_PER_MB,
  DOWNLOAD_SOURCE_FILE,
  UI_UPDATE_INTERVAL_MS,
  DOWNLOAD_RETRY_DELAY_MS,
  SLOW_NETWORK_THRESHOLD_SECONDS,
  SLOW_NETWORK_SPEED,
  DEFAULT_THREAD_COUNT,
  PERCENT_MULTIPLIER,
  MS_PER_SECOND,
  DEFAULT_TARGET_DOWNLOAD_SIZE_MB,
} from "@/constants";

/* ---------- public types ---------- */
export interface Metrics {
  downloadedSize: number;
  currentSpeed: number;
  downloadedPercent: number;
  status: string;
}

export interface DataWasterOptions {
  targetDownloadSize: number; // 0 = infinite
  threadCount: number; // 1–32
}

/* -------------------------------------------------------------------- */
export function useDataWaster() {
  /* live state -------------------------------------------------------- */
  const [metrics, setMetrics] = useState<Metrics>({
    downloadedSize: 0,
    currentSpeed: 0,
    downloadedPercent: 0,
    status: "",
  });

  /* refs that survive re-renders ------------------------------------- */
  const running = useRef(false); // Track if data wasting is active
  const bytesDown = useRef(0); // Total bytes downloaded
  const epoch = useRef(0); // Start time of the current operation
  const firstResp = useRef(false); // Whether first server response received
  const dlCtl = useRef<AbortController[]>([]); // Download thread controllers
  const timer = useRef<NodeJS.Timeout>(undefined); // UI update interval timer
  const opts = useRef<DataWasterOptions>({
    targetDownloadSize: DEFAULT_TARGET_DOWNLOAD_SIZE_MB, // 0 = infinite mode
    threadCount: DEFAULT_THREAD_COUNT, // Number of concurrent connections
  });

  /* helper functions ------------------------------------------------- */
  const isComplete = () => {
    if (opts.current.targetDownloadSize === 0) {
      return false;
    } // Infinite mode never completes

    const totalBytes = bytesDown.current;
    const targetBytes = opts.current.targetDownloadSize * BYTES_PER_MB;
    return totalBytes >= targetBytes;
  };

  /* metric updater ---------------------------------------------------- */
  const updateMetrics = () => {
    const currentOptions = opts.current;
    const downloadedSize = bytesDown.current / BYTES_PER_MB;
    const targetDownloadSize = currentOptions.targetDownloadSize || Infinity;
    const calculatePercentage = (valueMB: number) =>
      targetDownloadSize === Infinity
        ? 0
        : (valueMB / targetDownloadSize) * PERCENT_MULTIPLIER;
    const elapsedSeconds = (Date.now() - epoch.current) / MS_PER_SECOND;
    const currentSpeed = elapsedSeconds ? downloadedSize / elapsedSeconds : 0;

    setMetrics((previousMetrics) => ({
      ...previousMetrics,
      downloadedSize,
      currentSpeed,
      downloadedPercent: calculatePercentage(downloadedSize),
    }));

    /* auto-stop finite runs */
    if (
      currentOptions.targetDownloadSize &&
      downloadedSize >= currentOptions.targetDownloadSize &&
      running.current
    ) {
      stop();
      setMetrics((previousMetrics) => ({
        ...previousMetrics,
        status: "Completed",
      }));
    }

    /* slow network warning */
    if (
      running.current &&
      elapsedSeconds > SLOW_NETWORK_THRESHOLD_SECONDS &&
      currentSpeed < SLOW_NETWORK_SPEED &&
      firstResp.current &&
      currentOptions.targetDownloadSize
    ) {
      setMetrics((previousMetrics) => ({
        ...previousMetrics,
        status: "Network too slow to waste efficiently",
      }));
    }
  };

  /* start / stop public API ------------------------------------------ */
  const start = useCallback((options: DataWasterOptions) => {
    if (running.current) {
      return;
    }

    opts.current = options;
    bytesDown.current = 0;
    dlCtl.current = [];
    firstResp.current = false;
    epoch.current = Date.now();
    running.current = true;

    updateMetrics();
    timer.current = setInterval(updateMetrics, UI_UPDATE_INTERVAL_MS);

    spawnDownloads();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    if (!running.current) {
      return;
    }

    running.current = false;
    dlCtl.current.forEach((controller) => controller.abort());

    if (timer.current) {
      clearInterval(timer.current);
    }

    setMetrics((previousMetrics) => ({
      ...previousMetrics,
      status: "Stopped",
      currentSpeed: 0,
    }));
  }, []);

  /* workers ----------------------------------------------------------- */
  const spawnDownloads = () => {
    // Use all threads for downloads
    const threadCount = opts.current.threadCount;

    // Spawn download workers in parallel
    Array.from({ length: threadCount }, (_, threadId) =>
      downloadWorker(threadId)
    );
  };

  const downloadWorker = async (threadId: number) => {
    const abortController = new AbortController();

    dlCtl.current[threadId] = abortController;

    while (running.current && !isComplete()) {
      try {
        // Add timestamp and random value to prevent caching
        const cacheBustingParams = `${Date.now()}-${Math.random()}`;
        const response = await fetch(
          `${DOWNLOAD_SOURCE_FILE}?t=${cacheBustingParams}`,
          {
            headers: { "Accept-Encoding": "identity" }, // Prevent compression
            signal: abortController.signal,
          }
        );

        firstResp.current = true;

        const reader = response.body!.getReader();

        while (running.current && !isComplete()) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          // Count all bytes received
          bytesDown.current += value!.length;
        }
      } catch (error) {
        logOnce(error);
      }

      if (!isComplete() && running.current) {
        await sleep(DOWNLOAD_RETRY_DELAY_MS);
      }
    }
  };

  /* cleanup ----------------------------------------------------------- */
  useEffect(() => stop, [stop]);

  return { metrics, start, stop, running: running.current };
}
