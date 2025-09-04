import { DataWasterOptions, useDataWaster } from "@hooks/useDataWaster";
import { useDataWasterSettings } from "@hooks/useSettings";
import { Stat } from "@components/Stat";

export default function DataWasterPage() {
  /* Settings with cookie persistence ----------------------------------- */
  const {
    targetDownloadSize,
    threadCount,
    infiniteDownload,
    setTargetDownloadSize,
    setThreadCount,
    setInfiniteDownload,
  } = useDataWasterSettings();

  /* engine -------------------------------------------------------------- */
  const { metrics, start, stop, running } = useDataWaster();

  const handleStartStop = () => {
    if (running) {
      stop();
      return;
    }

    const opts: DataWasterOptions = {
      targetDownloadSize,
      threadCount,
      infiniteDownload,
    };
    start(opts);
  };

  return (
    <main className={"max-w-md mx-auto p-6 flex flex-col gap-8 font-sans"}>
      {/* title */}
      <header className={"text-center"}>
        <h1 className={"text-3xl font-bold"}>Data Waster</h1>
        <p className={"text-gray-500"}>
          Burn bandwidth for tests or throttling detection.
        </p>
      </header>

      {/* inputs */}
      <div className={"mb-4 flex gap-2"}>
        <div className={"flex flex-row items-center gap-3"}>
          <label className={"items-center flex flex-row gap-2"}>
            <span className={"text-sm"}>Target size (MB)</span>
            <input
              name={"targetDownloadSize"}
              type={"number"}
              min={1}
              value={infiniteDownload ? "" : targetDownloadSize}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 0) {
                  setTargetDownloadSize(value);
                }
              }}
              disabled={infiniteDownload || running}
              placeholder={infiniteDownload ? "∞" : ""}
              className={`w-28 px-2 py-1 border rounded ${
                infiniteDownload ? "bg-gray-100 text-gray-400" : ""
              }`}
            />
          </label>
        </div>
        <label className={"flex items-center gap-2"}>
          <input
            name={"infiniteDownload"}
            type={"checkbox"}
            checked={infiniteDownload}
            disabled={running}
            onChange={(e) => {
              const checked = e.target.checked;
              setInfiniteDownload(checked);
            }}
            className={"w-4 h-4"}
          />
          <span className={"text-sm"}>Infinite download</span>
        </label>
      </div>

      <label className={"flex items-center gap-2"}>
        <span className={"text-sm"}>Threads</span>
        <input
          name={"threadCount"}
          type={"range"}
          min={1}
          max={32}
          disabled={running}
          value={threadCount}
          onChange={(e) => setThreadCount(Number(e.target.value))}
          className={"flex-1 accent-blue-600"}
        />
        <span className={"w-6 text-right"}>{threadCount}</span>
      </label>

      {/* start / stop */}
      <button
        onClick={handleStartStop}
        name={"startStop"}
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
      {infiniteDownload ? null : (
        <div className={"flex flex-col gap-1"}>
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
      )}

      {/* stats */}
      <section className={"grid grid-cols-2 gap-4 text-center text-sm"}>
        <Stat label={"Downloaded (MB)"} value={metrics.downloadedSize} />
        <Stat label={"Speed (MB/s)"} value={metrics.currentSpeed} />
      </section>
    </main>
  );
}
