package com.visioner.krishisanchar.Service;


import com.visioner.krishisanchar.DTO.DailyForecast;
import com.visioner.krishisanchar.DTO.DashboardSummaryResponse;
import com.visioner.krishisanchar.DTO.WeatherSummary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class WeatherService {
    private final RestClient restClient;

    @Value("${weather.api.key:}")
    private String apiKey;

    @Value("${weather.api.url:}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherService(){
        this.restClient = RestClient.builder()
                .requestFactory(new SimpleClientHttpRequestFactory())
                .build();
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

    public List<DailyForecast> getFiveDayForecast(String city) {
        List<DailyForecast> forecastList = new ArrayList<>();

        // Use metric units to get Celsius
        String url = String.format("https://api.openweathermap.org/data/2.5/forecast?q=%s&units=metric&appid=%s", city, apiKey);

        try {
            // Fetch the JSON response directly into a traversable JsonNode
            JsonNode rootNode = restTemplate.getForObject(url, JsonNode.class);

            if (rootNode != null && rootNode.has("list")) {
                JsonNode listNode = rootNode.path("list");

                for (JsonNode node : listNode) {
                    String dateTime = node.path("dt_txt").asText(); // Format: "2026-08-31 12:00:00"

                    // The API returns data every 3 hours. Grab only the mid-day reading to represent the daily forecast.
                    if (dateTime.contains("12:00:00")) {
                        // 1. Format the Date (e.g., "Aug 31")
                        String rawDate = dateTime.split(" ")[0];
                        LocalDate date = LocalDate.parse(rawDate);
                        String formattedDate = date.format(DateTimeFormatter.ofPattern("MMM dd"));

                        // 2. Extract Temperature and round it
                        double tempDouble = node.path("main").path("temp").asDouble();
                        String temperature = Math.round(tempDouble) + "°C";

                        // 3. Extract Condition (e.g., "Clouds", "Rain")
                        String condition = node.path("weather").get(0).path("main").asText();

                        forecastList.add(new DailyForecast(formattedDate, temperature, condition));
                    }

                    // Stop once we have exactly 5 days of data
                    if (forecastList.size() == 5) {
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch weather: " + e.getMessage());
            // Fail gracefully so the frontend dashboard doesn't completely crash
            forecastList.clear();
            forecastList.add(new DailyForecast("Error", "--", "API Unavailable"));
        }

        return forecastList;
    }
}
