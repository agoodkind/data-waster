import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { DataWasterOptions } from "./useDataWaster";
import { DEFAULT_TARGET_DOWNLOAD_SIZE_MB } from "@/constants";
import { DEFAULT_THREAD_COUNT } from "@/constants";

// Cookie keys for storing user preferences
const COOKIE_KEYS = {
  TARGET_DOWNLOAD_SIZE: 'data-waster-targetDownloadSize',
  THREAD_COUNT: 'data-waster-threadCount'
} as const;

// Cookie options
const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: 'lax' as const
};

export interface DataWasterSettings extends DataWasterOptions {
  setTargetDownloadSize: (value: number) => void;
  setThreadCount: (value: number) => void;
}

/**
 * Custom hook to manage Data Waster settings with cookie persistence
 * @returns Settings values and setters
 */
export function useDataWasterSettings(): DataWasterSettings {
  const [cookies, setCookie] = useCookies(Object.values(COOKIE_KEYS));

  const [targetDownloadSize, setTargetDownloadSizeState] = useState(() => 
    Number(cookies[COOKIE_KEYS.TARGET_DOWNLOAD_SIZE]) || DEFAULT_TARGET_DOWNLOAD_SIZE_MB  
  );
  
  const [threadCount, setThreadCountState] = useState(() => 
    Number(cookies[COOKIE_KEYS.THREAD_COUNT]) || DEFAULT_THREAD_COUNT
  );

  /* Save to cookies when values change ------------------------------------ */

  useEffect(() => {
      setCookie(COOKIE_KEYS.TARGET_DOWNLOAD_SIZE, String(targetDownloadSize), COOKIE_OPTIONS);
    }, [targetDownloadSize, setCookie]);

  useEffect(() => {
    setCookie(COOKIE_KEYS.THREAD_COUNT, String(threadCount), COOKIE_OPTIONS);
  }, [threadCount, setCookie]);

  /* Wrapper functions for setters ----------------------------------------- */
  const setTargetDownloadSize = (value: number) => setTargetDownloadSizeState(value);
  const setThreadCount = (value: number) => setThreadCountState(value);

  return {
    targetDownloadSize,
    threadCount,
    setTargetDownloadSize,
    setThreadCount,
  };
}
