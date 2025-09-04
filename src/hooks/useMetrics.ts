import { useState, useCallback } from "react";
import {
  BYTES_PER_MB,
  PERCENT_MULTIPLIER,
  MS_PER_SECOND
} from "@/constants";
import { useDataWasterSettings } from "./useSettings";

/* ---------- public types ---------- */
export interface Metrics {
  downloadedSize: number;
  currentSpeed: number;
  downloadedPercent: number;
}

export interface MetricsOptions {
  bytesDownloaded: number;
  startTime: number;
  isRunning: boolean;
}

/* -------------------------------------------------------------------- */
export function useMetrics() {
  const { targetDownloadSize, infiniteDownload } = useDataWasterSettings();
  const [metrics, setMetrics] = useState<Metrics>({
    downloadedSize: 0,
    currentSpeed: 0,
    downloadedPercent: 0,
  });

  const updateMetrics = useCallback(
    ({
      bytesDownloaded,
      startTime,
      isRunning,
    }: MetricsOptions): {
      isComplete: boolean;
      shouldStop: boolean;
    } => {
      const downloadedSize = bytesDownloaded / BYTES_PER_MB;
      const targetSize = infiniteDownload ? Infinity : targetDownloadSize;
      
      const calculatePercentage = (valueMB: number) =>
        targetSize === Infinity
          ? 0
          : (valueMB / targetSize) * PERCENT_MULTIPLIER;
      
      const elapsedSeconds = (Date.now() - startTime) / MS_PER_SECOND;
      const currentSpeed = elapsedSeconds ? downloadedSize / elapsedSeconds : 0;

      let shouldStop = false;

      // Check if download is complete
      const isComplete = targetDownloadSize > 0 && downloadedSize >= targetDownloadSize;
      
      if (isComplete && isRunning) {
        shouldStop = true;
      } 

      setMetrics({
        downloadedSize,
        currentSpeed,
        downloadedPercent: calculatePercentage(downloadedSize),
      });

      return { isComplete, shouldStop };
    },
    [infiniteDownload, targetDownloadSize]
  );

  const resetMetrics = useCallback(() => {
    setMetrics({
      downloadedSize: 0,
      currentSpeed: 0,
      downloadedPercent: 0,
    });
  }, []);

  const setStatus = useCallback((status: string) => {
    setMetrics((prev) => ({ ...prev, status }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setMetrics((prev) => ({ ...prev, currentSpeed: speed }));
  }, []);

  return {
    metrics,
    updateMetrics,
    resetMetrics,
    setStatus,
    setSpeed,
  };
}
