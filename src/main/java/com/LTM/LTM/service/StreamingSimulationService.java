00package com.LTM.LTM.service;

import com.LTM.LTM.model.SimulationMode;
import com.LTM.LTM.model.StreamingMetrics;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class StreamingSimulationService {

    // Configurable parameters
    private volatile int producerRate = 1000;    // events/second
    private volatile int consumerRate = 200;     // events/second
    private volatile int bufferCapacity = 2000;  // max queue capacity
    private volatile SimulationMode mode = SimulationMode.NO_BACKPRESSURE;

    // Runtime state
    private final AtomicInteger queueSize = new AtomicInteger(0);
    private final AtomicLong processedEvents = new AtomicLong(0);
    private final AtomicLong droppedEvents = new AtomicLong(0);
    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private volatile boolean backpressureActive = false;

    // Reactive Sink for streaming metrics to subscribers
    private final Sinks.Many<StreamingMetrics> metricsSink =
            Sinks.many().multicast().onBackpressureBuffer();

    private ScheduledExecutorService scheduler;
    private static final int TICK_INTERVAL_MS = 100; // 10 ticks per second

    @PostConstruct
    public void init() {
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "simulation-engine");
            t.setDaemon(true);
            return t;
        });

        scheduler.scheduleAtFixedRate(this::tick, 0, TICK_INTERVAL_MS, TimeUnit.MILLISECONDS);
    }

    @PreDestroy
    public void cleanup() {
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdownNow();
        }
    }

    public Flux<StreamingMetrics> getMetricsFlux() {
        return metricsSink.asFlux();
    }

    private void tick() {
        if (!isRunning.get()) {
            // Still emit current metrics so UI shows static state
            metricsSink.tryEmitNext(getCurrentMetrics());
            return;
        }

        double tickFraction = TICK_INTERVAL_MS / 1000.0;

        // 1. Consumer processing step
        int targetConsumerEvents = (int) Math.round(consumerRate * tickFraction);
        if (consumerRate > 0 && targetConsumerEvents == 0) {
            targetConsumerEvents = 1;
        }

        int currentQueue = queueSize.get();
        int actualConsumed = Math.min(currentQueue, targetConsumerEvents);
        currentQueue -= actualConsumed;
        processedEvents.addAndGet(actualConsumed);

        // 2. Producer generation step based on Mode
        int desiredProducerEvents = (int) Math.round(producerRate * tickFraction);
        if (producerRate > 0 && desiredProducerEvents == 0) {
            desiredProducerEvents = 1;
        }

        switch (mode) {
            case NO_BACKPRESSURE:
                // Producer pushes with zero restriction
                currentQueue += desiredProducerEvents;
                backpressureActive = false;
                break;

            case LIMITED_BUFFER:
                // Fixed capacity buffer. If queue is full, drop incoming events!
                backpressureActive = false;
                int availableSpace = Math.max(0, bufferCapacity - currentQueue);
                if (desiredProducerEvents <= availableSpace) {
                    currentQueue += desiredProducerEvents;
                } else {
                    currentQueue = bufferCapacity;
                    int dropped = desiredProducerEvents - availableSpace;
                    droppedEvents.addAndGet(dropped);
                }
                break;

            case BACKPRESSURE:
                // Reactive Demand Feedback:
                // High Watermark: when queue reaches ~40% capacity (or 600 events)
                int safeThreshold = Math.min(600, (int) (bufferCapacity * 0.4));

                if (currentQueue >= safeThreshold) {
                    // Backpressure actively signals Producer to slow down to Consumer speed
                    backpressureActive = true;
                    // Producer produces exactly what consumer can handle to prevent queue runaway
                    int throttledProduction = Math.min(desiredProducerEvents, targetConsumerEvents);
                    currentQueue += throttledProduction;
                } else {
                    // Below safe threshold: Producer can stream normally
                    backpressureActive = false;
                    currentQueue += desiredProducerEvents;
                }
                // Under Backpressure, no events are dropped because upstream is controlled
                break;
        }

        queueSize.set(currentQueue);

        // Emit new metrics to WebSocket subscribers
        metricsSink.tryEmitNext(getCurrentMetrics());
    }

    public StreamingMetrics getCurrentMetrics() {
        return new StreamingMetrics(
                System.currentTimeMillis(),
                producerRate,
                consumerRate,
                queueSize.get(),
                bufferCapacity,
                processedEvents.get(),
                droppedEvents.get(),
                backpressureActive,
                mode,
                isRunning.get()
        );
    }

    public synchronized void start() {
        isRunning.set(true);
    }

    public synchronized void stop() {
        isRunning.set(false);
    }

    public synchronized void reset() {
        queueSize.set(0);
        processedEvents.set(0);
        droppedEvents.set(0);
        backpressureActive = false;
    }

    public synchronized void updateConfig(Integer newProducerRate, Integer newConsumerRate,
                                         SimulationMode newMode, Integer newBufferCapacity) {
        if (newProducerRate != null && newProducerRate >= 0) {
            this.producerRate = newProducerRate;
        }
        if (newConsumerRate != null && newConsumerRate >= 0) {
            this.consumerRate = newConsumerRate;
        }
        if (newMode != null) {
            this.mode = newMode;
            if (this.mode != SimulationMode.BACKPRESSURE) {
                this.backpressureActive = false;
            }
        }
        if (newBufferCapacity != null && newBufferCapacity > 0) {
            this.bufferCapacity = newBufferCapacity;
        }
    }
}
