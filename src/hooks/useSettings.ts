import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";

// Cookie keys for storing user preferences
const COOKIE_KEYS = {
  DOWNLOAD: 'data-waster-download',
  UPLOAD: 'data-waster-upload',
  SIZE_MB: 'data-waster-sizeMB',
  THREADS: 'data-waster-threads'
} as const;

// Cookie options
const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: 'lax' as const
};

export interface DataWasterSettings {
  download: boolean;
  upload: boolean;
  sizeMB: number;
  threads: number;
  setDownload: (value: boolean) => void;
  setUpload: (value: boolean) => void;
  setSizeMB: (value: number) => void;
  setThreads: (value: number) => void;
}

/**
 * Custom hook to manage Data Waster settings with cookie persistence
 * @returns Settings values and setters
 */
export function useDataWasterSettings(): DataWasterSettings {
  const [cookies, setCookie] = useCookies(Object.values(COOKIE_KEYS));

  /* Initialize state from cookies or defaults ----------------------------- */
  const [download, setDownloadState] = useState(() => 
    cookies[COOKIE_KEYS.DOWNLOAD] === 'true' || 
    cookies[COOKIE_KEYS.DOWNLOAD] === undefined ? true : false
  );
  
  const [upload, setUploadState] = useState(() => 
    cookies[COOKIE_KEYS.UPLOAD] === 'true' || 
    cookies[COOKIE_KEYS.UPLOAD] === undefined ? true : false
  );
  
  const [sizeMB, setSizeMBState] = useState(() => 
    Number(cookies[COOKIE_KEYS.SIZE_MB]) || 10000
  );
  
  const [threads, setThreadsState] = useState(() => 
    Number(cookies[COOKIE_KEYS.THREADS]) || 16
  );

  /* Save to cookies when values change ------------------------------------ */
  useEffect(() => {
    setCookie(COOKIE_KEYS.DOWNLOAD, String(download), COOKIE_OPTIONS);
  }, [download, setCookie]);

  useEffect(() => {
    setCookie(COOKIE_KEYS.UPLOAD, String(upload), COOKIE_OPTIONS);
  }, [upload, setCookie]);

  useEffect(() => {
    setCookie(COOKIE_KEYS.SIZE_MB, String(sizeMB), COOKIE_OPTIONS);
  }, [sizeMB, setCookie]);

  useEffect(() => {
    setCookie(COOKIE_KEYS.THREADS, String(threads), COOKIE_OPTIONS);
  }, [threads, setCookie]);

  /* Wrapper functions for setters ----------------------------------------- */
  const setDownload = (value: boolean) => setDownloadState(value);
  const setUpload = (value: boolean) => setUploadState(value);
  const setSizeMB = (value: number) => setSizeMBState(value);
  const setThreads = (value: number) => setThreadsState(value);

  return {
    download,
    upload,
    sizeMB,
    threads,
    setDownload,
    setUpload,
    setSizeMB,
    setThreads
  };
}
