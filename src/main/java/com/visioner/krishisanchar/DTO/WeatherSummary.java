package com.visioner.krishisanchar.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeatherSummary {
    private String temperature;
    private String condition;
    private String humidity;
    private String wind;
    private String rain;
}