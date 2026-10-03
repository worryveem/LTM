import React from 'react';

export default function MetricCards({ metrics }) {
  const {
    producerRate = 0,
    consumerRate = 0,
    queueSize = 0,
    bufferCapacity = 2000,
    processedEvents = 0,
    droppedEvents = 0,
    backpressureActive = false,
  } = metrics || {};

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <span className="card-label">PRODUCER RATE</span>
        <div className="card-value font-mono text-cyan">
          {producerRate.toLocaleString()}
          <span className="card-unit">/s</span>
        </div>
        <div className="card-subtext">Tốc độ sinh dữ liệu</div>
      </div>

      <div className="metric-card">
        <span className="card-label">CONSUMER RATE</span>
        <div className="card-value font-mono text-indigo">
          {consumerRate.toLocaleString()}
          <span className="card-unit">/s</span>
        </div>
        <div className="card-subtext">Tốc độ xử lý tối đa</div>
      </div>

      <div className="metric-card">
        <span className="card-label">QUEUE SIZE</span>
        <div className={`card-value font-mono ${queueSize > bufferCapacity * 0.8 ? 'text-rose' : 'text-amber'}`}>
          {queueSize.toLocaleString()}
          <span className="card-unit">events</span>
        </div>
        <div className="card-subtext">Hàng đợi trong Buffer</div>
      </div>

      <div className="metric-card">
        <span className="card-label">BUFFER CAPACITY</span>
        <div className="card-value font-mono text-gray">
          {bufferCapacity.toLocaleString()}
          <span className="card-unit">events</span>
        </div>
        <div className="card-subtext">Ngưỡng tràn tối đa</div>
      </div>

      <div className="metric-card">
        <span className="card-label">PROCESSED EVENTS</span>
        <div className="card-value font-mono text-emerald">
          {processedEvents.toLocaleString()}
        </div>
        <div className="card-subtext">Tổng sự kiện đã xử lý</div>
      </div>

      <div className="metric-card">
        <span className="card-label">DROPPED EVENTS</span>
        <div className={`card-value font-mono ${droppedEvents > 0 ? 'text-rose' : 'text-gray'}`}>
          {droppedEvents.toLocaleString()}
        </div>
        <div className="card-subtext">Sự kiện bị mất do đầy buffer</div>
      </div>

      <div className="metric-card highlight-card">
        <span className="card-label">BACKPRESSURE STATUS</span>
        <div className="card-value">
          {backpressureActive ? (
            <span className="status-pill active-pill">ACTIVE (ĐIỀU TIẾT)</span>
          ) : (
            <span className="status-pill inactive-pill">OFF (TẮT)</span>
          )}
        </div>
        <div className="card-subtext">
          {backpressureActive 
            ? 'Hệ thống tự hãm tốc độ Producer' 
            : 'Producer tự do không kiểm soát'}
        </div>
      </div>
    </div>
  );
}
