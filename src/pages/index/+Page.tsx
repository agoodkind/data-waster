import { Options, useDataWaster } from "@hooks/useDataWaster";
import { useState } from "react";

export default function DataWasterPage() {
  /* UI state ------------------------------------------------------------ */
  const [download, setDownload] = useState(true);
  const [upload, setUpload] = useState(true);
  const [sizeMB, setSizeMB] = useState(10000);
  const [threads, setThreads] = useState(16);

  /* engine -------------------------------------------------------------- */
  const { metrics, start, stop, running } = useDataWaster();

  const handleStartStop = () => {
    if (running) {
      stop();
      return;
    }
    const opts: Options = { sizeMB, threads, download, upload };
    start(opts);
  };

  /* render -------------------------------------------------------------- */
  return (
    <main className="max-w-md mx-auto p-6 space-y-8 font-sans">
      {/* title */}
      <header className="text-center">
        <h1 className="text-3xl font-bold">Data Waster</h1>
        <p className="text-gray-500">
          Burn bandwidth for tests or throttling detection.
        </p>
      </header>

      {/* mode toggles */}
      <div className="flex justify-center gap-4">
        <Toggle
          active={download}
          label="Download"
          onClick={() => setDownload(!download)}
        />
        <Toggle
          active={upload}
          label="Upload"
          onClick={() => setUpload(!upload)}
        />
      </div>

      {/* inputs */}
      <label className="block mb-4">
        <span className="text-sm mr-2">Target size&nbsp;(MB, 0 = ∞)</span>
        <input
          type="number"
          min={0}
          value={sizeMB}
          onChange={(e) => setSizeMB(Number(e.target.value))}
          className="w-28 px-2 py-1 border rounded"
        />
      </label>

      <label className="flex items-center gap-2 mb-8">
        <span className="text-sm">Threads</span>
        <input
          type="range"
          min={1}
          max={32}
          value={threads}
          onChange={(e) => setThreads(Number(e.target.value))}
          className="flex-1 accent-blue-600"
        />
        <span className="w-6 text-right">{threads}</span>
      </label>

      {/* start / stop */}
      <button
        onClick={handleStartStop}
        disabled={!download && !upload}
        className={`w-full py-2 rounded text-white transition
                    ${
                      running
                        ? "bg-red-600"
                        : "bg-blue-600 disabled:bg-gray-400"
                    }`}
      >
        {running ? "Stop" : "Start"}
      </button>

      {/* single progress bar */}
      <div className="mt-8 space-y-1">
        <span className="text-xs text-gray-600">
          {metrics.totalPct.toFixed(1)}%
        </span>
        <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${metrics.totalPct}%` }}
          />
        </div>
      </div>

      {/* stats */}
      <section className="grid grid-cols-2 gap-4 text-center text-sm mt-6">
        <Stat label="Downloaded (MB)" value={metrics.downloadedMB} />
        <Stat label="Uploaded (MB)" value={metrics.uploadedMB} />
        <Stat label="Total (MB)" value={metrics.totalMB} />
        <Stat label="Speed (MB/s)" value={metrics.speedMBps} />
      </section>

      {/* status */}
      <p className="text-center text-sm text-yellow-600 mt-4 h-5">
        {metrics.status}
      </p>
    </main>
  );
}

/* ---------------- helpers -------------------------------------------- */

function Toggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded border border-blue-600 transition
                  ${active ? "bg-blue-600 text-white" : "text-blue-600"}`}
    >
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="block text-gray-500">{label}</span>
      <span className="font-mono">{value.toFixed(2)}</span>
    </div>
  );
}
