import { useEffect } from "react";

export default function LegacyUI({ onSwitchToModern }: { onSwitchToModern?: () => void }) {
  useEffect(() => {
    // Load the legacy script
    const script = document.createElement("script");
    script.src = "/legacy.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup when component unmounts
      document.body.removeChild(script);
      
      // Also clean up the global dataWaster object
      if ((window as any).dataWaster) {
        // Stop any running operations
        if ((window as any).dataWaster.stop) {
          (window as any).dataWaster.stop();
        }
        delete (window as any).dataWaster;
      }
    };
  }, []);

  return (
    <div className="legacy-container">
      <style dangerouslySetInnerHTML={{ __html: legacyStyles }} />
      
      <div className="container">
        <header className="text-center mb-5">
          <h1 id="title" className="display-4 fw-bold">Data Waster</h1>
          <p id="desc" className="lead text-muted">
            Burn bandwidth for tests or throttling detection.
          </p>
          {onSwitchToModern && (
            <button
              onClick={onSwitchToModern}
              className="btn btn-link"
              style={{ color: '#0d6efd', textDecoration: 'none', marginTop: '1rem' }}
            >
              ← Switch to Modern UI
            </button>
          )}
        </header>

        <div className="card shadow-sm">
          <div className="card-body">
            {/* Operation Mode Selection */}
            <div className="mb-4">
              <div className="d-flex justify-content-center gap-3">
                <button
                  id="downloadOption"
                  className="btn btn-outline-primary mode-toggle active"
                  data-active="true"
                >
                  <span id="downloadLabel">Download</span>
                </button>
                <button
                  id="uploadOption"
                  className="btn btn-outline-primary mode-toggle active"
                  data-active="true"
                >
                  <span id="uploadLabel">Upload</span>
                </button>
              </div>
              <small id="toggleHint" className="text-muted d-block text-center mt-2">
                Click to toggle download/upload modes
              </small>
            </div>

            {/* Data Size Input */}
            <div className="mb-4">
              <label htmlFor="dataSize" className="form-label">
                <span id="sizeLabel">Target size (MB, 0 = ∞)</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="dataSize"
                defaultValue="100"
                min="0"
              />
            </div>

            {/* Thread Count Slider */}
            <div className="mb-4">
              <label htmlFor="threadCount" className="form-label">
                <span id="threadLabel">Threads</span>: <span id="threadValue">8</span>
              </label>
              <input
                type="range"
                className="form-range"
                id="threadCount"
                min="1"
                max="64"
                defaultValue="8"
              />
            </div>

            {/* Start/Stop Button */}
            <button id="startButton" className="btn btn-primary w-100 mb-4">
              Start
            </button>

            {/* Progress Bars */}
            <div className="mb-3">
              <label className="form-label">
                <span id="downloadProgressLabel">Download Progress</span>
              </label>
              <div className="progress">
                <div
                  id="downloadProgress"
                  className="progress-bar bg-info"
                  role="progressbar"
                  style={{ width: "0%" }}
                  aria-valuenow={0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">
                <span id="uploadProgressLabel">Upload Progress</span>
              </label>
              <div className="progress">
                <div
                  id="uploadProgress"
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: "0%" }}
                  aria-valuenow={0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="row text-center">
              <div className="col-md-3 mb-3">
                <div className="stat-box">
                  <h5 className="text-muted mb-1">
                    <span id="totalProgressLabel">Total (MB)</span>
                  </h5>
                  <p className="h4 mb-0">
                    <span id="totalBytesProcessed">0.00</span>
                  </p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="stat-box">
                  <h5 className="text-muted mb-1">Downloaded (MB)</h5>
                  <p className="h4 mb-0">
                    <span id="bytesDownloaded">0.00</span>
                  </p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="stat-box">
                  <h5 className="text-muted mb-1">Uploaded (MB)</h5>
                  <p className="h4 mb-0">
                    <span id="bytesUploaded">0.00</span>
                  </p>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="stat-box">
                  <h5 className="text-muted mb-1">
                    <span id="totalSpeedLabel">Speed (MB/s)</span>
                  </h5>
                  <p className="h4 mb-0">
                    <span id="totalTransferSpeed">0.00</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div id="statusMessage" className="text-center mt-3 text-warning"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const legacyStyles = `
  .legacy-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .container {
    width: 100%;
  }

  .display-4 {
    font-size: 2.5rem;
    font-weight: 700;
  }

  .lead {
    font-size: 1.25rem;
    font-weight: 300;
  }

  .text-muted {
    color: #6c757d !important;
  }

  .text-center {
    text-align: center !important;
  }

  .text-warning {
    color: #ffc107 !important;
  }

  .text-success {
    color: #28a745 !important;
  }

  .text-info {
    color: #17a2b8 !important;
  }

  .mb-1 { margin-bottom: 0.25rem !important; }
  .mb-3 { margin-bottom: 1rem !important; }
  .mb-4 { margin-bottom: 1.5rem !important; }
  .mb-5 { margin-bottom: 3rem !important; }
  .mt-2 { margin-top: 0.5rem !important; }
  .mt-3 { margin-top: 1rem !important; }

  .card {
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;
  }

  .shadow-sm {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  }

  .card-body {
    padding: 2rem;
  }

  .form-label {
    margin-bottom: 0.5rem;
    display: inline-block;
  }

  .form-control {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
  }

  .form-range {
    width: 100%;
    height: 1.5rem;
    padding: 0;
    background-color: transparent;
    appearance: none;
  }

  .form-range::-webkit-slider-track {
    width: 100%;
    height: 0.5rem;
    color: transparent;
    cursor: pointer;
    background-color: #dee2e6;
    border-color: transparent;
    border-radius: 1rem;
  }

  .form-range::-webkit-slider-thumb {
    width: 1rem;
    height: 1rem;
    margin-top: -0.25rem;
    background-color: #0d6efd;
    border: 0;
    border-radius: 1rem;
    appearance: none;
  }

  .btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: all 0.15s ease-in-out;
    cursor: pointer;
  }

  .btn-primary {
    color: #fff;
    background-color: #0d6efd;
    border-color: #0d6efd;
  }

  .btn-primary:hover {
    background-color: #0b5ed7;
    border-color: #0a58ca;
  }

  .btn-primary:disabled {
    background-color: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
  }

  .btn-outline-primary {
    color: #0d6efd;
    border-color: #0d6efd;
    background-color: transparent;
  }

  .btn-outline-primary:hover,
  .btn-outline-primary.active {
    color: #fff;
    background-color: #0d6efd;
    border-color: #0d6efd;
  }

  .btn-link {
    font-weight: 400;
    color: #0d6efd;
    text-decoration: none;
    background-color: transparent;
    border: none;
    padding: 0.375rem 0.75rem;
    cursor: pointer;
  }

  .btn-link:hover {
    color: #0a58ca;
    text-decoration: underline;
  }

  .w-100 {
    width: 100% !important;
  }

  .d-flex {
    display: flex !important;
  }

  .d-block {
    display: block !important;
  }

  .justify-content-center {
    justify-content: center !important;
  }

  .gap-3 {
    gap: 1rem !important;
  }

  .progress {
    display: flex;
    height: 1rem;
    overflow: hidden;
    font-size: 0.75rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
  }

  .progress-bar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    background-color: #0d6efd;
    transition: width 0.6s ease;
  }

  .bg-info {
    background-color: #0dcaf0 !important;
  }

  .bg-success {
    background-color: #198754 !important;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -0.75rem;
    margin-left: -0.75rem;
  }

  .col-md-3 {
    flex: 0 0 auto;
    width: 25%;
    padding-right: 0.75rem;
    padding-left: 0.75rem;
  }

  @media (max-width: 768px) {
    .col-md-3 {
      width: 50%;
    }
  }

  .stat-box {
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }

  .h4 {
    font-size: 1.5rem;
  }

  .h5 {
    font-size: 1.25rem;
  }

  .fw-bold {
    font-weight: 700 !important;
  }
`;
