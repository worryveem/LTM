import React from 'react';

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
  const modes = [
    {
      id: 'NO_BACKPRESSURE',
      label: 'Mode 1: No Backpressure',
      desc: 'Queue tăng liên tục không giới hạn khi P > C'
    },
    {
      id: 'LIMITED_BUFFER',
      label: 'Mode 2: Limited Buffer (Drop)',
      desc: 'Queue bị chặn ở dung lượng tối đa, Drop các event dư'
    },
    {
      id: 'BACKPRESSURE',
      label: 'Mode 3: Backpressure Control',
      desc: 'Producer bị hãm theo Consumer, Queue được kiểm soát an toàn'
    }
  ];

  const presets = [
    { label: 'Demo Mặc Định (1000 → 200)', p: 1000, c: 200 },
    { label: 'Cân Bằng (500 → 500)', p: 500, c: 500 },
    { label: 'Consumer Xả Queue (200 → 500)', p: 200, c: 500 }
  ];

  return (
    <div className="control-panel">
      {/* 1. Mode Selection */}
      <div className="panel-section">
        <label className="section-title">CHỌN CHẾ ĐỘ MÔ PHỎNG (SCENARIO)</label>
        <div className="mode-selector">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`mode-btn ${mode === m.id ? 'active' : ''}`}
              onClick={() => onModeChange(m.id)}
            >
              <div className="mode-btn-title">{m.label}</div>
              <div className="mode-btn-desc">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Playback Action Buttons & Presets */}
      <div className="panel-row">
        <div className="action-buttons">
          {!isRunning ? (
            <button className="btn btn-start" onClick={onStart}>
              ▶ BẮT ĐẦU (START)
            </button>
          ) : (
            <button className="btn btn-stop" onClick={onStop}>
              ⏸ TẠM DỪNG (STOP)
            </button>
          )}
          <button className="btn btn-reset" onClick={onReset}>
            ↺ LÀM MỚI (RESET)
          </button>
        </div>

        <div className="presets-group">
          <span className="presets-label">Tình huống nhanh:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              className="btn btn-preset"
              onClick={() => onRateChange(preset.p, preset.c)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Realtime Sliders */}
      <div className="sliders-grid">
        <div className="slider-card">
          <div className="slider-header">
            <span className="slider-name">Producer Rate (P):</span>
            <span className="slider-val text-cyan font-mono">{producerRate} events/s</span>
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
            <span>1000/s</span>
            <span>2000/s</span>
          </div>
        </div>

        <div className="slider-card">
          <div className="slider-header">
            <span className="slider-name">Consumer Rate (C):</span>
            <span className="slider-val text-indigo font-mono">{consumerRate} events/s</span>
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
            <span>500/s</span>
            <span>1000/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
