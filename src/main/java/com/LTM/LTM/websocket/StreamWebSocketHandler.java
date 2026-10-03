package com.LTM.LTM.websocket;

import com.LTM.LTM.model.SimulationCommand;
import com.LTM.LTM.model.StreamingMetrics;
import com.LTM.LTM.service.StreamingSimulationService;
import tools.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import reactor.core.Disposable;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class StreamWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(StreamWebSocketHandler.class);

    private final StreamingSimulationService simulationService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final List<WebSocketSession> activeSessions = new CopyOnWriteArrayList<>();
    private Disposable metricsSubscription;

    public StreamWebSocketHandler(StreamingSimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostConstruct
    public void setupSubscription() {
        // Sample every 150ms to deliver smooth 60fps-like charts without overloading browser
        metricsSubscription = simulationService.getMetricsFlux()
                .sample(Duration.ofMillis(150))
                .subscribe(this::broadcastMetrics,
                           err -> log.error("Error in metrics stream: {}", err.getMessage()));
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        activeSessions.add(session);
        log.info("Client connected: {}", session.getId());
        sendMetricsToSession(session, simulationService.getCurrentMetrics());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            SimulationCommand cmd = objectMapper.readValue(message.getPayload(), SimulationCommand.class);
            if (cmd != null && cmd.getAction() != null) {
                switch (cmd.getAction().toUpperCase()) {
                    case "START":
                        simulationService.start();
                        break;
                    case "STOP":
                        simulationService.stop();
                        break;
                    case "RESET":
                        simulationService.reset();
                        break;
                    case "UPDATE_CONFIG":
                        simulationService.updateConfig(
                                cmd.getProducerRate(),
                                cmd.getConsumerRate(),
                                cmd.getMode(),
                                cmd.getBufferCapacity()
                        );
                        break;
                    default:
                        log.warn("Unknown command action: {}", cmd.getAction());
                }
                broadcastMetrics(simulationService.getCurrentMetrics());
            }
        } catch (Exception e) {
            log.error("Failed to parse client message: {}", message.getPayload(), e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        activeSessions.remove(session);
        log.info("Client disconnected: {} with status {}", session.getId(), status);
    }

    private void broadcastMetrics(StreamingMetrics metrics) {
        if (activeSessions.isEmpty()) {
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(metrics);
            TextMessage textMessage = new TextMessage(payload);

            for (WebSocketSession session : activeSessions) {
                if (session.isOpen()) {
                    synchronized (session) {
                        try {
                            session.sendMessage(textMessage);
                        } catch (IOException e) {
                            log.debug("Failed to send message to {}: {}", session.getId(), e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize metrics", e);
        }
    }

    private void sendMetricsToSession(WebSocketSession session, StreamingMetrics metrics) {
        try {
            String payload = objectMapper.writeValueAsString(metrics);
            synchronized (session) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(payload));
                }
            }
        } catch (IOException e) {
            log.error("Failed to send initial metrics to session {}", session.getId(), e);
        }
    }
}
