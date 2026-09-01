package com.visioner.krishisanchar.DTO;

public class DailyForecast {
    private String date;
    private String temperature;
    private String condition;

    public DailyForecast(String date, String temperature, String condition) {
        this.date = date;
        this.temperature = temperature;
        this.condition = condition;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTemperature() { return temperature; }
    public void setTemperature(String temperature) { this.temperature = temperature; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
}