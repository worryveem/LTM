// Test script for Spring Boot WebSocket and REST API
const url = 'ws://localhost:8080/ws/stream';

console.log('Testing WebSocket connection to ' + url + '...');

try {
  const ws = new WebSocket(url);

  let messageCount = 0;

  ws.onopen = () => {
    console.log('[PASS] WebSocket connection opened successfully!');
    // Send a start command
    const cmd = JSON.stringify({
      action: 'START'
    });
    console.log('Sending command:', cmd);
    ws.send(cmd);
  };

  ws.onmessage = (event) => {
    messageCount++;
    const data = JSON.parse(event.data);
    console.log(`[PASS] Received metrics tick #${messageCount}:`, {
      mode: data.mode,
      running: data.running,
      queueSize: data.queueSize,
      producerRate: data.producerRate,
      consumerRate: data.consumerRate,
      processed: data.processedEvents,
      dropped: data.droppedEvents,
      backpressure: data.backpressureActive
    });

    if (messageCount >= 4) {
      console.log('All tests passed! Closing connection...');
      ws.close();
      process.exit(0);
    }
  };

  ws.onerror = (err) => {
    console.error('[FAIL] WebSocket error:', err.message || err);
    process.exit(1);
  };

  setTimeout(() => {
    console.error('[TIMEOUT] Did not receive enough metrics within 6s');
    process.exit(1);
  }, 6000);
} catch (e) {
  console.error('Failed to create WebSocket:', e);
  process.exit(1);
}
