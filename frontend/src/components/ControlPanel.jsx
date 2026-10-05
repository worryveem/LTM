import React from 'react';

export function ModeSelector({
  mode,
  isRunning,
  onModeChange,
  onStart,
  onStop,
  onReset
}) {
  const modes = [
    { id: 'NO_BACKPRESSURE', label: '1. No Backpressure' },
    { id: 'LIMITED_BUFFER', label: '2. Limited Buffer' },
    { id: 'BACKPRESSURE', label: '3. Backpressure' }
  ];

  return (
    <div className="mode-bar">
      <div className="mode-selector">
        {modes.map((m) => (
          <button
            key={m.id}
            className={`mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => onModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="action-buttons">
        {!isRunning ? (
          <button className="btn btn-start" onClick={onStart}>
            ▶ Bắt đầu
          </button>
        ) : (
          <button className="btn btn-stop" onClick={onStop}>
            ⏸ Tạm dừng
          </button>
        )}
        <button className="btn btn-reset" onClick={onReset}>
          ↺ Làm mới
        </button>
      </div>
    </div>
  );
}

export function RateSliders({ producerRate, consumerRate, onRateChange }) {
  return (
    <div className="sliders-panel">
      <div className="slider-card">
        <div className="slider-header">
          <span className="slider-name">Producer</span>
          <span className="slider-val text-cyan font-mono">{producerRate.toLocaleString()}/s</span>
        </div>
        <input
          type="range"
          min="50"
          max="2000"
          step="50"
          value={producerRate}
          onChange={(e) => onRateChange(parseInt(e.target.value, 10), consumerRate)}
        />
        <div className="slider-footer">
          <span>50/s</span>
          <span>2000/s</span>
        </div>
      </div>

      <div className="slider-card">
        <div className="slider-header">
          <span className="slider-name">Consumer</span>
          <span className="slider-val text-indigo font-mono">{consumerRate.toLocaleString()}/s</span>
        </div>
        <input
          type="range"
          min="50"
          max="1000"
          step="25"
          value={consumerRate}
          onChange={(e) => onRateChange(producerRate, parseInt(e.target.value, 10))}
        />
        <div className="slider-footer">
          <span>50/s</span>
          <span>1000/s</span>
        </div>
      </div>
    </div>
  );
}

export default function ControlPanel({
  isRunning,
  mode,
  producerRate,
  consumerRate,
  onStart,
  onStop,
  onReset,
  onModeChange,
  onRateChange
}) {
  return (
    <div className="control-panel">
      <ModeSelector
        mode={mode}
        isRunning={isRunning}
        onModeChange={onModeChange}
        onStart={onStart}
        onStop={onStop}
        onReset={onReset}
      />
      <RateSliders
        producerRate={producerRate}
        consumerRate={consumerRate}
        onRateChange={onRateChange}
      />
    </div>
  );
}
