package com.LTM.LTM.controller;

import com.LTM.LTM.model.SimulationCommand;
import com.LTM.LTM.model.StreamingMetrics;
import com.LTM.LTM.service.StreamingSimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SimulationController {

    private final StreamingSimulationService simulationService;

    public SimulationController(StreamingSimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<StreamingMetrics> getMetrics() {
        return ResponseEntity.ok(simulationService.getCurrentMetrics());
    }

    @PostMapping("/control")
    public ResponseEntity<StreamingMetrics> control(@RequestBody SimulationCommand command) {
        if (command != null && command.getAction() != null) {
            switch (command.getAction().toUpperCase()) {
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
                            command.getProducerRate(),
                            command.getConsumerRate(),
                            command.getMode(),
                            command.getBufferCapacity()
                    );
                    break;
            }
        }
        return ResponseEntity.ok(simulationService.getCurrentMetrics());
    }
}
