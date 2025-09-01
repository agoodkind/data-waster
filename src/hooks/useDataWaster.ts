/* useDataWaster.ts
   -- React/TS hook that spams up- & downloads while reporting live metrics.
   -- Header + query-string sizes were reduced (3 × 512 B instead of 16 × 4 KB)
      so every request is <6 KB, well below common limits. */

import { useCallback, useEffect, useRef, useState } from "react";

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
const MB = 1_048_576;
const SRC_DOWN = "./data-waste.bin";
const SRC_UP = "./wastebin.html";
const QS_LEN = 512; //  ↘  reduced from 4 000
const HDR_COUNT = 3; //  ↘  reduced from 16
const HDR_LEN = 512; //  ↘  reduced from 4 000

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
  const running = useRef(false);
  const bytesDown = useRef(0);
  const bytesUp = useRef(0);
  const epoch = useRef(0);
  const firstResp = useRef(false);
  const dlCtrl = useRef<AbortController[]>([]);
  const upCtrl = useRef<AbortController[]>([]);
  const timer = useRef<NodeJS.Timeout>(undefined);
  const opts = useRef<Options>({
    sizeMB: 0,
    threads: 8,
    download: true,
    upload: false,
  });
  const logGate = useRef(0); // rate-limit console errors

  /* helpers ----------------------------------------------------------- */
  const rand = (n: number) => {
    const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const a = new Uint32Array(n);
    crypto.getRandomValues(a);
    return Array.from(a, (x) => c[x % c.length]).join("");
  };
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const logOnce = (e: unknown) => {
    const now = Date.now();
    if (now - logGate.current > 1_000) {
      console.error(e);
      logGate.current = now;
    }
  };

  /* metric updater ---------------------------------------------------- */
  const pulse = () => {
    const o = opts.current;
    const dMB = bytesDown.current / MB;
    const uMB = bytesUp.current / MB;
    const tMB = dMB + uMB;
    const cap = o.sizeMB || Infinity;
    const pct = (v: number) => (cap === Infinity ? 0 : (v / cap) * 100);
    const secs = (Date.now() - epoch.current) / 1000;
    const vMB = secs ? tMB / secs : 0;

    setMetrics((m) => ({
      ...m,
      downloadedMB: dMB,
      uploadedMB: uMB,
      totalMB: tMB,
      speedMBps: vMB,
      downloadPct: pct(dMB),
      uploadPct: pct(uMB),
      totalPct: pct(tMB),
    }));

    /* auto-stop finite runs */
    if (o.sizeMB && tMB >= o.sizeMB && running.current) {
      stop();
      setMetrics((m) => ({ ...m, status: "Completed" }));
    }

    /* slow network warning */
    if (
      running.current &&
      secs > 30 &&
      vMB < 1 &&
      firstResp.current &&
      o.sizeMB
    ) {
      setMetrics((m) => ({
        ...m,
        status: "Network too slow to waste efficiently",
      }));
    }
  };

  /* start / stop public API ------------------------------------------ */
  const start = useCallback((o: Options) => {
    if (running.current) return;
    if (!o.download && !o.upload) {
      setMetrics((m) => ({ ...m, status: "Select at least one mode" }));
      return;
    }

    opts.current = o;
    bytesDown.current = 0;
    bytesUp.current = 0;
    dlCtrl.current = [];
    upCtrl.current = [];
    firstResp.current = false;
    epoch.current = Date.now();
    running.current = true;

    pulse();
    timer.current = setInterval(pulse, 50);

    if (o.download) spawnDownloads();
    if (o.upload) spawnUploads();
  }, []);

  const stop = useCallback(() => {
    if (!running.current) return;
    running.current = false;
    dlCtrl.current.forEach((c) => c.abort());
    upCtrl.current.forEach((c) => c.abort());
    if (timer.current) clearInterval(timer.current);
    setMetrics((m) => ({ ...m, status: "Stopped" }));
  }, []);

  /* workers ----------------------------------------------------------- */
  const spawnDownloads = () => {
    const n = opts.current.upload
      ? Math.max(1, opts.current.threads >> 1)
      : opts.current.threads;
    for (let i = 0; i < n; i++) downloadWorker(i);
  };
  const downloadWorker = async (id: number) => {
    const ac = new AbortController();
    dlCtrl.current[id] = ac;
    while (running.current) {
      try {
        const r = await fetch(`${SRC_DOWN}?t=${Date.now()}-${Math.random()}`, {
          headers: { "Accept-Encoding": "identity" },
          signal: ac.signal,
        });
        firstResp.current = true;
        const rd = r.body!.getReader();
        while (running.current) {
          const { done, value } = await rd.read();
          if (done) break;
          bytesDown.current += value!.length;
        }
      } catch (e) {
        logOnce(e);
      }
      await sleep(50);
    }
  };

  const spawnUploads = () => {
    const n = opts.current.download
      ? Math.max(1, opts.current.threads >> 1)
      : opts.current.threads;
    for (let i = 0; i < n; i++) uploadWorker(i);
  };
  const uploadWorker = async (id: number) => {
    const ac = new AbortController();
    upCtrl.current[id] = ac;
    while (running.current) {
      try {
        const qs = rand(QS_LEN);
        const hdr: Record<string, string> = {};
        let hdrBytes = 0;
        for (let i = 0; i < HDR_COUNT; i++) {
          const k = `X-${rand(6)}`,
            v = rand(HDR_LEN);
          hdr[k] = v;
          hdrBytes += k.length + v.length + 2;
        }
        await fetch(`${SRC_UP}?w=${qs}`, {
          method: "GET",
          headers: { "Content-Encoding": "identity", ...hdr },
          signal: ac.signal,
        }).catch(() => {});
        firstResp.current = true;
        bytesUp.current += qs.length + hdrBytes;
      } catch (e) {
        logOnce(e);
      }
      await sleep(30);
    }
  };

  /* cleanup ----------------------------------------------------------- */
  useEffect(() => stop, [stop]);

  return { metrics, start, stop, running: running.current };
}
