import { useCallback, useEffect, useRef } from "react";
import { sleep } from "@util/async";
import { logOnce } from "@util/logging";
import { useMetrics } from "@hooks/useMetrics";
import {
  BYTES_PER_MB,
  DOWNLOAD_SOURCE_FILE,
  UI_UPDATE_INTERVAL_MS,
  DOWNLOAD_RETRY_DELAY_MS,
  DEFAULT_THREAD_COUNT,
  DEFAULT_TARGET_DOWNLOAD_SIZE_MB,
} from "@/constants";

/* ---------- public types ---------- */
export type { Metrics } from "@hooks/useMetrics";

export interface DataWasterOptions {
  targetDownloadSize: number; // 0 = infinite
  threadCount: number; // 1–32
  infiniteDownload: boolean;
}

/* -------------------------------------------------------------------- */
export function useDataWaster() {
  /* live state -------------------------------------------------------- */
  const { metrics, updateMetrics, resetMetrics, setStatus, setSpeed } = useMetrics();

  /* refs that survive re-renders ------------------------------------- */
  const running = useRef(false); // Track if data wasting is active
  const bytesDown = useRef(0); // Total bytes downloaded
  const startTime = useRef(0); // Start time of the current operation
  const dlCtl = useRef<AbortController[]>([]); // Download thread controllers
  const timer = useRef<NodeJS.Timeout>(undefined); // UI update interval timer
  const opts = useRef<DataWasterOptions>({
    targetDownloadSize: DEFAULT_TARGET_DOWNLOAD_SIZE_MB, // 0 = infinite mode
    threadCount: DEFAULT_THREAD_COUNT, // Number of concurrent connections
    infiniteDownload: false,
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

  /* stop internal helper ---------------------------------------------- */
  const stopInternal = () => {
    if (!running.current) {
      return;
    }

    running.current = false;
    dlCtl.current.forEach((controller) => controller.abort());

    if (timer.current) {
      clearInterval(timer.current);
    }
  };

  /* metric updater ---------------------------------------------------- */
  const updateMetricsCallback = () => {
    const { shouldStop } = updateMetrics({
      bytesDownloaded: bytesDown.current,
      startTime: startTime.current,
      isRunning: running.current,
    });

    if (shouldStop) {
      stopInternal();
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
    startTime.current = Date.now();
    running.current = true;
    resetMetrics();

    updateMetricsCallback();
    timer.current = setInterval(updateMetricsCallback, UI_UPDATE_INTERVAL_MS);

    spawnDownloads();
  }, [resetMetrics]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    stopInternal();
    setStatus("Stopped");
    setSpeed(0);
  }, [setStatus, setSpeed]);

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
