import { DataWasterOptions, useDataWaster } from "@hooks/useDataWaster";
import { useDataWasterSettings } from "@hooks/useSettings";
import { Stat } from "@components/Stat";

export default function DataWasterPage() {
  /* Settings with cookie persistence ----------------------------------- */
  const {
    targetDownloadSize,
    threadCount,
    setTargetDownloadSize,
    setThreadCount
  } = useDataWasterSettings();

  /* engine -------------------------------------------------------------- */
  const { metrics, start, stop, running } = useDataWaster();

  const handleStartStop = () => {
    if (running) {
      stop();
      return;
    }
    const opts: DataWasterOptions = { targetDownloadSize, threadCount };
    start(opts);
  };

  return (
    <main className={"max-w-md mx-auto p-6 space-y-8 font-sans"}>
      {/* title */}
      <header className={"text-center"}>
        <h1 className={"text-3xl font-bold"}>Data Waster</h1>
        <p className={"text-gray-500"}>
          Burn bandwidth for tests or throttling detection.
        </p>
      </header>

      {/* inputs */}
      <label className={"block mb-4"}>
        <span className={"text-sm mr-2"}>Target size&nbsp;(MB, 0 = ∞)</span>
        <input
          type={"number"}
          min={0}
          value={targetDownloadSize}
          onChange={(e) => setTargetDownloadSize(Number(e.target.value))}
          className={"w-28 px-2 py-1 border rounded"}
        />
      </label>

      <label className={"flex items-center gap-2 mb-8"}>
        <span className={"text-sm"}>Threads</span>
        <input
          type={"range"}
          min={1}
          max={32}
          value={threadCount}
          onChange={(e) => setThreadCount(Number(e.target.value))}
          className={"flex-1 accent-blue-600"}
        />
        <span className={"w-6 text-right"}>{threadCount}</span>
      </label>

      {/* start / stop */}
      <button
        onClick={handleStartStop}
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
      <div className={"mt-8 space-y-1"}>
        <span className={"text-xs text-gray-600"}>
          {metrics.downloadedPercent.toFixed(1)}%
        </span>
        <div className={"w-full h-3 bg-gray-200 rounded overflow-hidden"}>
          <div
            className={"h-full bg-blue-600 transition-all"}
            style={{ width: `${metrics.downloadedPercent}%` }}
          />
        </div>
      </div>

      {/* stats */}
      <section className={"grid grid-cols-2 gap-4 text-center text-sm mt-6"}>
        <Stat label={"Downloaded (MB)"} value={metrics.downloadedSize} />
        <Stat label={"Speed (MB/s)"} value={metrics.currentSpeed} />
      </section>

      {/* status */}
      <p className={"text-center text-sm text-yellow-600 mt-4 h-5"}>
        {metrics.status}
      </p>
    </main>
  );
}
