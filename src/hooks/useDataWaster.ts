import { useCallback, useEffect, useRef, useState } from "react";
import { rand } from "@util/random";
import { sleep } from "@util/async";
import { logOnce } from "@util/logging";

/* ---------- public types ---------- */
export interface Metrics {
  downloadedMB: number;
  uploadedMB: number;
  totalMB: number;
  speedMBps: number;
  downloadPct: number;
  uploadPct: number;
  totalPct: number;
  status: string;
}

export interface Options {
  sizeMB: number; // 0 = infinite
  threads: number; // 1–32
  download: boolean;
  upload: boolean;
}

/* ---------- constants ---------- */
const BYTES_PER_MB = 1_048_576;
const DOWNLOAD_SOURCE_FILE = "./data-waste.bin";
const UPLOAD_ENDPOINT_URL = "./wastebin.html";
const QUERY_STRING_LENGTH = 2000; // 2KB query string - safe for browsers and servers
const HEADERS_PER_REQUEST = 64; // Reasonable number of headers
const HEADER_VALUE_LENGTH = 1000; // 1KB per header value
const HEADER_NAME_PREFIX_LENGTH = 10; // Length of random suffix for "X-Random-" headers
const HEADER_OVERHEAD_BYTES = 2; // Bytes for ": " separator in HTTP headers

// Timing constants
const UI_UPDATE_INTERVAL_MS = 50; // How often to update metrics display
const DOWNLOAD_RETRY_DELAY_MS = 50; // Delay between download attempts
const UPLOAD_RETRY_DELAY_MS = 30; // Delay between upload attempts

// Performance monitoring
const SLOW_NETWORK_THRESHOLD_SECONDS = 30; // Time before showing slow network warning
const SLOW_NETWORK_SPEED_MBPS = 1; // Speed threshold for slow network warning

// Thread management
const MIN_THREAD_COUNT = 1; // Minimum threads to ensure at least one worker
const DEFAULT_THREAD_COUNT = 8; // Default number of concurrent connections

// Math constants
const PERCENT_MULTIPLIER = 100; // Convert decimal to percentage
const MS_PER_SECOND = 1000; // Milliseconds in a second

/* -------------------------------------------------------------------- */
export function useDataWaster() {
  /* live state -------------------------------------------------------- */
  const [metrics, setMetrics] = useState<Metrics>({
    downloadedMB: 0,
    uploadedMB: 0,
    totalMB: 0,
    speedMBps: 0,
    downloadPct: 0,
    uploadPct: 0,
    totalPct: 0,
    status: "",
  });

  /* refs that survive re-renders ------------------------------------- */
  const running = useRef(false); // Track if data wasting is active
  const bytesDown = useRef(0); // Total bytes downloaded
  const bytesUp = useRef(0); // Total bytes uploaded
  const epoch = useRef(0); // Start time of the current operation
  const firstResp = useRef(false); // Whether first server response received
  const dlCtl = useRef<AbortController[]>([]); // Download thread controllers
  const ulCtl = useRef<AbortController[]>([]); // Upload thread controllers
  const timer = useRef<NodeJS.Timeout>(undefined); // UI update interval timer
  const opts = useRef<Options>({
    sizeMB: 0, // 0 = infinite mode
    threads: DEFAULT_THREAD_COUNT, // Number of concurrent connections
    download: true,
    upload: true,
  });
  
  /* helper functions ------------------------------------------------- */
  const isComplete = () => {
    if (opts.current.sizeMB === 0) { return false; } // Infinite mode never completes
    
    const totalBytes = bytesDown.current + bytesUp.current;
    const targetBytes = opts.current.sizeMB * BYTES_PER_MB;
    return totalBytes >= targetBytes;
  };

  /* metric updater ---------------------------------------------------- */
  const updateMetrics = () => {
    const currentOptions = opts.current;
    const downloadedMB = bytesDown.current / BYTES_PER_MB;
    const uploadedMB = bytesUp.current / BYTES_PER_MB;
    const totalMB = downloadedMB + uploadedMB;
    const targetCapacityMB = currentOptions.sizeMB || Infinity;
    const calculatePercentage = (valueMB: number) =>
      targetCapacityMB === Infinity
        ? 0
        : (valueMB / targetCapacityMB) * PERCENT_MULTIPLIER;
    const elapsedSeconds = (Date.now() - epoch.current) / MS_PER_SECOND;
    const speedMBps = elapsedSeconds ? totalMB / elapsedSeconds : 0;

    setMetrics((previousMetrics) => ({
      ...previousMetrics,
      downloadedMB: downloadedMB,
      uploadedMB: uploadedMB,
      totalMB: totalMB,
      speedMBps: speedMBps,
      downloadPct: calculatePercentage(downloadedMB),
      uploadPct: calculatePercentage(uploadedMB),
      totalPct: calculatePercentage(totalMB),
    }));

    /* auto-stop finite runs */
    if (
      currentOptions.sizeMB &&
      totalMB >= currentOptions.sizeMB &&
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
      speedMBps < SLOW_NETWORK_SPEED_MBPS &&
      firstResp.current &&
      currentOptions.sizeMB
    ) {
      setMetrics((previousMetrics) => ({
        ...previousMetrics,
        status: "Network too slow to waste efficiently",
      }));
    }
  };

  /* start / stop public API ------------------------------------------ */
  const start = useCallback((options: Options) => {
    if (running.current) { return; }
    
    if (!options.download && !options.upload) {
      setMetrics((previousMetrics) => ({
        ...previousMetrics,
        status: "Select at least one mode",
      }));
      return;
    }

    opts.current = options;
    bytesDown.current = 0;
    bytesUp.current = 0;
    dlCtl.current = [];
    ulCtl.current = [];
    firstResp.current = false;
    epoch.current = Date.now();
    running.current = true;

    updateMetrics();
    timer.current = setInterval(updateMetrics, UI_UPDATE_INTERVAL_MS);

    if (options.download) { spawnDownloads(); }
    if (options.upload) { spawnUploads(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    if (!running.current) { return; }

    running.current = false;
    dlCtl.current.forEach((controller) => controller.abort());
    ulCtl.current.forEach((controller) => controller.abort());

    if (timer.current) { clearInterval(timer.current); }

    setMetrics((previousMetrics) => ({
      ...previousMetrics,
      status: "Stopped",
      speedMBps: 0,
    }));
  }, []);

  /* workers ----------------------------------------------------------- */
  const spawnDownloads = () => {
    // Use half threads for downloads when also uploading, otherwise use all threads
    const threadCount = opts.current.upload
      ? Math.max(MIN_THREAD_COUNT, Math.floor(opts.current.threads / 2)) // Half threads when running both modes
      : opts.current.threads;
    
    // Spawn download workers in parallel
    Array.from({ length: threadCount }, (_, threadId) => downloadWorker(threadId));
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
          },
        );

        firstResp.current = true;

        const reader = response.body!.getReader();

        while (running.current && !isComplete()) {
          const { done, value } = await reader.read();
          if (done) { break; }
          
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

  const spawnUploads = () => {
    // Use half threads for uploads when also downloading, otherwise use all threads
    const threadCount = opts.current.download
      ? Math.max(MIN_THREAD_COUNT, Math.floor(opts.current.threads / 2)) // Half threads when running both modes
      : opts.current.threads;
    

    // Spawn upload workers in parallel
    Array.from({ length: threadCount }, (_, threadId) => uploadWorker(threadId));
  };

  const uploadWorker = async (threadId: number) => {
    const abortController = new AbortController();

    ulCtl.current[threadId] = abortController;

    while (running.current && !isComplete()) {
      try {
        const queryStringData = rand(QUERY_STRING_LENGTH);
        
        // Generate random headers to increase upload payload size
        const headerData = Array.from({ length: HEADERS_PER_REQUEST }, () => {
          const headerName = `X-Random-${rand(HEADER_NAME_PREFIX_LENGTH)}`;
          const headerValue = rand(HEADER_VALUE_LENGTH);
          const headerBytes = headerName.length + headerValue.length + HEADER_OVERHEAD_BYTES;
          return { name: headerName, value: headerValue, bytes: headerBytes };
        });
        
        const randomHeaders = headerData.reduce<Record<string, string>>((acc, { name, value }) => {
          acc[name] = value;
          return acc;
        }, {});
        
        const totalHeaderBytes = headerData.reduce((sum, { bytes }) => sum + bytes, 0);

        await fetch(`${UPLOAD_ENDPOINT_URL}?waste=${queryStringData}`, {
          method: "GET",
          headers: { "Content-Encoding": "identity", ...randomHeaders }, // Prevent compression
          signal: abortController.signal,
        });

        firstResp.current = true;
        bytesUp.current += queryStringData.length + totalHeaderBytes;
      } catch (error) {
        logOnce(error);
      }
      
      if (!isComplete() && running.current) {
        await sleep(UPLOAD_RETRY_DELAY_MS);
      }
    }
  };

  /* cleanup ----------------------------------------------------------- */
  useEffect(() => stop, [stop]);

  return { metrics, start, stop, running: running.current };
}
