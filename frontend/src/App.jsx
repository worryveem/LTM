import React, { useState, useEffect, useRef, useCallback } from 'react';
import FlowVisualization from './components/FlowVisualization';
import MetricCards from './components/MetricCards';
import QueueChart from './components/QueueChart';
import ControlPanel from './components/ControlPanel';
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
          <span className="subject-tag">LẬP TRÌNH MẠNG • ĐỀ TÀI T53</span>
          <h1 className="header-title">Real-time Data Streaming với Backpressure Control</h1>
        </div>

        <div className="connection-badge">
          <span className={`status-dot ${wsConnected ? 'online' : 'offline'}`} />
          <span className="status-text">
            {wsConnected ? 'WebSocket: Connected (ws://localhost:8080)' : 'WebSocket: Reconnecting...'}
          </span>
        </div>
      </header>

      {/* Scenario Explanation Banner */}
      <div className={`scenario-banner ${metrics.mode.toLowerCase()}`}>
        <div className="banner-title">
          {metrics.mode === 'NO_BACKPRESSURE' && '🛑 Chế độ 1: No Backpressure (Không kiểm soát)'}
          {metrics.mode === 'LIMITED_BUFFER' && '⚠️ Chế độ 2: Limited Buffer (Tràn bộ đệm & Bỏ rơi gói tin - Drop)'}
          {metrics.mode === 'BACKPRESSURE' && '🛡️ Chế độ 3: Backpressure Control (Tự động hãm Producer theo sức Consumer)'}
        </div>
        <div className="banner-desc">
          {metrics.mode === 'NO_BACKPRESSURE' &&
            `Producer phát ${metrics.producerRate}/s trong khi Consumer chỉ xử lý ${metrics.consumerRate}/s. Vì không có cơ chế điều tiết, hàng đợi Queue tăng nhanh ~${Math.max(0, metrics.producerRate - metrics.consumerRate)} events mỗi giây, đe dọa làm tràn bộ nhớ (Out-Of-Memory).`}
          {metrics.mode === 'LIMITED_BUFFER' &&
            `Bộ đệm có giới hạn dung lượng ${metrics.bufferCapacity} events. Khi Producer gửi quá nhanh làm Queue chạm trần, toàn bộ dữ liệu mới không thể chứa sẽ bị DROP làm mất mát thông tin.`}
          {metrics.mode === 'BACKPRESSURE' &&
            `Hàng đợi phát tín hiệu phản hồi ngược (Reactive Demand Feedback). Khi Queue tiệm cận ngưỡng an toàn, Producer tự động giảm nhịp gửi bằng với tốc độ tiếp nhận của Consumer (${metrics.consumerRate}/s). Queue luôn ổn định, không có gói tin nào bị mất (Dropped = 0).`}
        </div>
      </div>

      {/* Main Dashboard Body */}
      <main className="dashboard-grid">
        {/* Row 1: Pipeline Flow Visualization */}
        <section className="dashboard-card">
          <div className="card-header">
            <h2>MÔ HÌNH DÒNG DỮ LIỆU (STREAMING PIPELINE)</h2>
            <span className="card-hint">Mô phỏng Producer ➔ Queue ➔ Consumer</span>
          </div>
          <FlowVisualization metrics={metrics} />
        </section>

        {/* Row 2: Realtime Metrics */}
        <section className="dashboard-card">
          <div className="card-header">
            <h2>CHỈ SỐ THỜI GIAN THỰC (REAL-TIME METRICS)</h2>
            <span className="card-hint">Cập nhật liên tục qua WebSocket</span>
          </div>
          <MetricCards metrics={metrics} />
        </section>

        {/* Row 3: Realtime Queue Chart */}
        <section className="dashboard-card">
          <div className="card-header">
            <h2>BIỂU ĐỒ DIỄN BIẾN QUEUE SIZE THEO THỜI GIAN</h2>
            <span className="card-hint">Quan sát độ dốc tích tụ của hàng đợi</span>
          </div>
          <QueueChart history={history} bufferCapacity={metrics.bufferCapacity} />
        </section>

        {/* Row 4: Controls & Simulator Inputs */}
        <section className="dashboard-card">
          <div className="card-header">
            <h2>BẢNG ĐIỀU KHIỂN & KỊCH BẢN DEMO (CONTROLS)</h2>
            <span className="card-hint">Tùy biến tốc độ Producer & Consumer trực tiếp</span>
          </div>
          <ControlPanel
            isRunning={metrics.isRunning}
            mode={metrics.mode}
            producerRate={metrics.producerRate}
            consumerRate={metrics.consumerRate}
            onStart={handleStart}
            onStop={handleStop}
            onReset={handleReset}
            onModeChange={handleModeChange}
            onRateChange={handleRateChange}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span>Đề tài: T53 – Real-time Data Streaming với Backpressure Control</span>
        <span>Công nghệ: Java 17, Spring Boot, Spring WebSocket, Project Reactor, React, Vite</span>
      </footer>
    </div>
  );
}
