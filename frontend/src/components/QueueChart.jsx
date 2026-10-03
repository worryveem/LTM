import React, { useEffect, useRef } from 'react';

export default function QueueChart({ history, bufferCapacity }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 200;

    // Clear
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 30, bottom: 25, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Determine max Y scale
    const maxDataVal = history.reduce((max, d) => Math.max(max, d.queueSize), 0);
    const maxY = Math.max(bufferCapacity * 1.1, maxDataVal * 1.15, 500);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Label Y
      const val = Math.round(maxY - (maxY / gridLines) * i);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(val.toLocaleString(), padding.left - 8, y + 3);
    }

    // Draw Buffer Capacity Reference Line
    if (bufferCapacity > 0 && bufferCapacity <= maxY) {
      const capY = padding.top + chartH - (bufferCapacity / maxY) * chartH;
      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, capY);
      ctx.lineTo(width - padding.right, capY);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = '10px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Capacity (${bufferCapacity})`, padding.left + 5, capY - 5);
      ctx.restore();
    }

    if (history.length < 2) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '13px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Đang chờ dữ liệu stream...', width / 2, height / 2);
      return;
    }

    // Coordinate conversion
    const getX = (idx) => padding.left + (idx / (history.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - (Math.max(0, val) / maxY) * chartH;

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    gradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.15)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.beginPath();
    ctx.moveTo(getX(0), padding.top + chartH);
    ctx.lineTo(getX(0), getY(history[0].queueSize));

    for (let i = 1; i < history.length; i++) {
      ctx.lineTo(getX(i), getY(history[i].queueSize));
    }
    ctx.lineTo(getX(history.length - 1), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(history[0].queueSize));
    for (let i = 1; i < history.length; i++) {
      ctx.lineTo(getX(i), getY(history[i].queueSize));
    }
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Latest point indicator
    const lastIdx = history.length - 1;
    const lastX = getX(lastIdx);
    const lastY = getY(history[lastIdx].queueSize);

    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [history, bufferCapacity]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', borderRadius: '8px' }} />
    </div>
  );
}
