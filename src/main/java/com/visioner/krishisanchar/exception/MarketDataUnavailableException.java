package com.visioner.krishisanchar.Exception;

public class MarketDataUnavailableException extends RuntimeException {
    private final String crop;
    private final String state;

    public MarketDataUnavailableException(String crop, String state) {
        super("No live market data available for " + crop + " in " + state + " today.");
        this.crop = crop;
        this.state = state;
    }

    public String getCrop() { return crop; }
    public String getState() { return state; }
}