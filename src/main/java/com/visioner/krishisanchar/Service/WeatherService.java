package com.visioner.krishisanchar.Service;

import com.visioner.krishisanchar.DTO.DashboardSummaryResponse;
import com.visioner.krishisanchar.DTO.WeatherSummary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class WeatherService {
    private final RestClient restClient;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String apiUrl;

    public WeatherService(){
        this.restClient = RestClient.create();
    }

    public DashboardSummaryResponse.WeatherSummary getLiveWeather(String city) {
        try {
            // Make the live REST call to OpenWeatherMap
            Map<String, Object> response = restClient.get()
                    .uri(apiUrl + "?q={city}&appid={key}&units=metric", city, apiKey)
                    .retrieve()
                    .body(Map.class);

            // Extract the nested JSON objects
            Map<String, Object> mainData = (Map<String, Object>) response.get("main");
            Map<String, Object> windData = (Map<String, Object>) response.get("wind");
            List<Map<String, Object>> weatherArray = (List<Map<String, Object>>) response.get("weather");

            // Parse individual values safely
            double currentTemp = ((Number) mainData.get("temp")).doubleValue();
            int humidity = ((Number) mainData.get("humidity")).intValue();
            String condition = (String) weatherArray.get(0).get("main"); // e.g., "Clear", "Clouds", "Rain"
            double windSpeedMs = ((Number) windData.get("speed")).doubleValue();

            // Convert wind speed from meters/second to km/h
            double windKmH = windSpeedMs * 3.6;

            // Build and return the exact DTO your dashboard needs
            return DashboardSummaryResponse.WeatherSummary.builder()
                    .temperature(String.format("%.1f°C", currentTemp))
                    .condition(condition)
                    .humidity(humidity + "%")
                    .wind(String.format("%.1f km/h", windKmH))
                    .rain(condition.toLowerCase().contains("rain") ? "100%" : "0%")
                    .build();

        } catch (Exception e) {
            // Fallback object so your dashboard doesn't crash if the API is unreachable
            return DashboardSummaryResponse.WeatherSummary.builder()
                    .temperature("--°C")
                    .condition("Unavailable")
                    .humidity("--%")
                    .wind("-- km/h")
                    .rain("--%")
                    .build();
        }
    }
}
