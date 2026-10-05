import React, { useState, useEffect, useRef, useCallback } from 'react';
import FlowVisualization from './components/FlowVisualization';
import MetricCards from './components/MetricCards';
import QueueChart from './components/QueueChart';
import { ModeSelector, RateSliders } from './components/ControlPanel';
import './App.css';

const WS_URL = 'ws://localhost:8080/ws/stream';
const MAX_HISTORY_POINTS = 50;

export default function App() {
  const [metrics, setMetrics] = useState({
    producerRate: 1000,
    consumerRate: 200,
    queueSize: 0,
    bufferCapacity: 2000,
    processedEvents: 0,
    droppedEvents: 0,
    backpressureActive: false,
    mode: 'NO_BACKPRESSURE',
    isRunning: false,
  });

  const [history, setHistory] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  // Send WebSocket command safely
  const sendCommand = useCallback((cmdObj) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(cmdObj));
    } else {
      // Fallback to REST API
      fetch('http://localhost:8080/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmdObj),
      }).catch((e) => console.error('REST fallback failed:', e));
    }
  }, []);

  // Initialize and maintain WebSocket connection
  useEffect(() => {
    let reconnectTimer = null;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMetrics(data);

          // Update chart history
          setHistory((prev) => {
            const next = [...prev, { time: data.timestamp, queueSize: data.queueSize }];
            return next.length > MAX_HISTORY_POINTS ? next.slice(-MAX_HISTORY_POINTS) : next;
          });
        } catch (e) {
          console.error('Parse metrics error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Handlers
  const handleStart = () => sendCommand({ action: 'START' });
  const handleStop = () => sendCommand({ action: 'STOP' });
  const handleReset = () => {
    setHistory([]);
    sendCommand({ action: 'RESET' });
  };

  const handleModeChange = (newMode) => {
    sendCommand({
      action: 'UPDATE_CONFIG',
      mode: newMode,
      producerRate: metrics.producerRate,
      consumerRate: metrics.consumerRate,
    });
  };

  const handleRateChange = (newProducer, newConsumer) => {
    sendCommand({
      action: 'UPDATE_CONFIG',
      producerRate: newProducer,
      consumerRate: newConsumer,
      mode: metrics.mode,
    });
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-branding">
          <span className="subject-tag">T53 • LẬP TRÌNH MẠNG</span>
          <h1 className="header-title">Backpressure Stream</h1>
        </div>

        <div className="connection-badge">
          <span className={`status-dot ${wsConnected ? 'online' : 'offline'}`} />
          <span className="status-text">{wsConnected ? 'Connected' : 'Offline'}</span>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="dashboard-grid">
        {/* 1. Chế độ (Mode Selection & Actions) */}
        <section className="dashboard-card mode-card">
          <ModeSelector
            mode={metrics.mode}
            isRunning={metrics.isRunning}
            onModeChange={handleModeChange}
            onStart={handleStart}
            onStop={handleStop}
            onReset={handleReset}
          />
        </section>

        {/* 2. Kéo trượt & Biểu đồ (Sliders & Queue Chart) */}
        <div className="hero-grid">
          <section className="dashboard-card sliders-card">
            <div className="card-header">
              <h2>ĐIỀU CHỈNH TỐC ĐỘ</h2>
            </div>
            <RateSliders
              producerRate={metrics.producerRate}
              consumerRate={metrics.consumerRate}
              onRateChange={handleRateChange}
            />
          </section>

          <section className="dashboard-card chart-card">
            <div className="card-header">
              <h2>BIỂU ĐỒ QUEUE</h2>
            </div>
            <QueueChart history={history} bufferCapacity={metrics.bufferCapacity} />
          </section>
        </div>

        {/* 3. Dòng dữ liệu (Pipeline Flow) */}
        <section className="dashboard-card">
          <div className="card-header">
            <h2>DÒNG DỮ LIỆU</h2>
          </div>
          <FlowVisualization metrics={metrics} />
        </section>

        {/* 4. Chỉ số (Real-time Metrics) */}
        <section className="dashboard-card">
          <div className="card-header">
            <h2>CHỈ SỐ</h2>
          </div>
          <MetricCards metrics={metrics} />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span>T53 • Backpressure Control</span>
        <span>Spring Boot & React</span>
      </footer>
    </div>
  );
}
