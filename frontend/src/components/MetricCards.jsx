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
        <span className="card-label">PRODUCER</span>
        <div className="card-value font-mono text-cyan">
          {producerRate.toLocaleString()}
          <span className="card-unit">/s</span>
        </div>
      </div>

      <div className="metric-card">
        <span className="card-label">CONSUMER</span>
        <div className="card-value font-mono text-indigo">
          {consumerRate.toLocaleString()}
          <span className="card-unit">/s</span>
        </div>
      </div>

      <div className="metric-card">
        <span className="card-label">QUEUE</span>
        <div className={`card-value font-mono ${queueSize > bufferCapacity * 0.8 ? 'text-rose' : 'text-amber'}`}>
          {queueSize.toLocaleString()}
        </div>
      </div>

      <div className="metric-card">
        <span className="card-label">CAPACITY</span>
        <div className="card-value font-mono text-gray">
          {bufferCapacity.toLocaleString()}
        </div>
      </div>

      <div className="metric-card">
        <span className="card-label">PROCESSED</span>
        <div className="card-value font-mono text-emerald">
          {processedEvents.toLocaleString()}
        </div>
      </div>

      <div className="metric-card">
        <span className="card-label">DROPPED</span>
        <div className={`card-value font-mono ${droppedEvents > 0 ? 'text-rose' : 'text-gray'}`}>
          {droppedEvents.toLocaleString()}
        </div>
      </div>

      <div className="metric-card highlight-card">
        <span className="card-label">BACKPRESSURE</span>
        <div className="card-value">
          {backpressureActive ? (
            <span className="status-pill active-pill">ACTIVE</span>
          ) : (
            <span className="status-pill inactive-pill">OFF</span>
          )}
        </div>
      </div>
    </div>
  );
}
