package com.LTM.LTM.model;

public class SimulationCommand {
    private String action; // START, STOP, RESET, UPDATE_CONFIG
    private Integer producerRate;
    private Integer consumerRate;
    private SimulationMode mode;
    private Integer bufferCapacity;

    public SimulationCommand() {
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Integer getProducerRate() {
        return producerRate;
    }

    public void setProducerRate(Integer producerRate) {
        this.producerRate = producerRate;
    }

    public Integer getConsumerRate() {
        return consumerRate;
    }

    public void setConsumerRate(Integer consumerRate) {
        this.consumerRate = consumerRate;
    }

    public SimulationMode getMode() {
        return mode;
    }

    public void setMode(SimulationMode mode) {
        this.mode = mode;
    }

    public Integer getBufferCapacity() {
        return bufferCapacity;
    }

    public void setBufferCapacity(Integer bufferCapacity) {
        this.bufferCapacity = bufferCapacity;
    }
}
