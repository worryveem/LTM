package com.LTM.LTM.model;

public class StreamingMetrics {
    private long timestamp;
    private int producerRate;
    private int consumerRate;
    private int queueSize;
    private int bufferCapacity;
    private long processedEvents;
    private long droppedEvents;
    private boolean backpressureActive;
    private SimulationMode mode;
    private boolean isRunning;

    public StreamingMetrics() {
    }

    public StreamingMetrics(long timestamp, int producerRate, int consumerRate, int queueSize,
                            int bufferCapacity, long processedEvents, long droppedEvents,
                            boolean backpressureActive, SimulationMode mode, boolean isRunning) {
        this.timestamp = timestamp;
        this.producerRate = producerRate;
        this.consumerRate = consumerRate;
        this.queueSize = queueSize;
        this.bufferCapacity = bufferCapacity;
        this.processedEvents = processedEvents;
        this.droppedEvents = droppedEvents;
        this.backpressureActive = backpressureActive;
        this.mode = mode;
        this.isRunning = isRunning;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public int getProducerRate() {
        return producerRate;
    }

    public void setProducerRate(int producerRate) {
        this.producerRate = producerRate;
    }

    public int getConsumerRate() {
        return consumerRate;
    }

    public void setConsumerRate(int consumerRate) {
        this.consumerRate = consumerRate;
    }

    public int getQueueSize() {
        return queueSize;
    }

    public void setQueueSize(int queueSize) {
        this.queueSize = queueSize;
    }

    public int getBufferCapacity() {
        return bufferCapacity;
    }

    public void setBufferCapacity(int bufferCapacity) {
        this.bufferCapacity = bufferCapacity;
    }

    public long getProcessedEvents() {
        return processedEvents;
    }

    public void setProcessedEvents(long processedEvents) {
        this.processedEvents = processedEvents;
    }

    public long getDroppedEvents() {
        return droppedEvents;
    }

    public void setDroppedEvents(long droppedEvents) {
        this.droppedEvents = droppedEvents;
    }

    public boolean isBackpressureActive() {
        return backpressureActive;
    }

    public void setBackpressureActive(boolean backpressureActive) {
        this.backpressureActive = backpressureActive;
    }

    public SimulationMode getMode() {
        return mode;
    }

    public void setMode(SimulationMode mode) {
        this.mode = mode;
    }

    public boolean isRunning() {
        return isRunning;
    }

    public void setRunning(boolean running) {
        isRunning = running;
    }
}
