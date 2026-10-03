import React from 'react';

export default function FlowVisualization({ metrics }) {
  const {
    producerRate = 0,
    consumerRate = 0,
    queueSize = 0,
    bufferCapacity = 2000,
    backpressureActive = false,
    isRunning = false,
    droppedEvents = 0
  } = metrics || {};

  const queuePct = Math.min(100, Math.round((queueSize / bufferCapacity) * 100));

  // Determine queue bar color based on level
  let queueColor = '#10b981'; // Green
  if (queuePct > 80) {
    queueColor = '#f43f5e'; // Red
  } else if (queuePct > 50) {
    queueColor = '#f59e0b'; // Amber
  }

  return (
    <div className="flow-container">
      {/* 1. Producer Box */}
      <div className={`flow-node producer-node ${isRunning ? 'active' : ''}`}>
        <div className="node-badge">PRODUCER</div>
        <div className="node-rate">{producerRate.toLocaleString()}</div>
        <div className="node-unit">events / giây</div>
        {backpressureActive && (
          <div className="throttle-warning">
            ⚠️ Throttled by Backpressure
          </div>
        )}
      </div>

      {/* Stream Line 1 */}
      <div className="stream-connector">
        <div className={`stream-arrow ${isRunning ? 'flowing' : ''}`}>
          <span>➔</span>
        </div>
        <div className="stream-rate">
          {backpressureActive ? `Throttled (~${consumerRate}/s)` : `${producerRate}/s`}
        </div>
      </div>

      {/* 2. Queue / Buffer Box */}
      <div className={`flow-node queue-node ${queuePct > 80 ? 'warning' : ''}`}>
        <div className="node-badge">BUFFER / QUEUE</div>
        <div className="queue-metric">
          <span className="queue-size">{queueSize.toLocaleString()}</span>
          <span className="queue-capacity">/ {bufferCapacity.toLocaleString()}</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="buffer-bar-track">
          <div
            className="buffer-bar-fill"
            style={{ width: `${queuePct}%`, backgroundColor: queueColor }}
          />
        </div>
        <div className="buffer-info">
          <span>{queuePct}% dung lượng</span>
          {droppedEvents > 0 && (
            <span className="dropped-badge">Drop: {droppedEvents.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Stream Line 2 */}
      <div className="stream-connector">
        <div className={`stream-arrow ${isRunning && queueSize > 0 ? 'flowing' : ''}`}>
          <span>➔</span>
        </div>
        <div className="stream-rate">
          {queueSize > 0 ? `${consumerRate}/s` : '0/s (Empty)'}
        </div>
      </div>

      {/* 3. Consumer Box */}
      <div className={`flow-node consumer-node ${isRunning && queueSize > 0 ? 'active' : ''}`}>
        <div className="node-badge">CONSUMER</div>
        <div className="node-rate">{consumerRate.toLocaleString()}</div>
        <div className="node-unit">events / giây</div>
        <div className="consumer-status">
          {queueSize > consumerRate ? 'Đang tải tối đa' : 'Ổn định'}
        </div>
      </div>
    </div>
  );
}
