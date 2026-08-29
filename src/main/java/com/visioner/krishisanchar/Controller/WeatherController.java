package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.DTO.DashboardSummaryResponse;
import com.visioner.krishisanchar.Service.WeatherService;
import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    private final WeatherService weatherService;
    private final HistoryLogRepository historyLogRepository;

    public WeatherController(WeatherService weatherService, HistoryLogRepository historyLogRepository) {
        this.weatherService = weatherService;
        this.historyLogRepository = historyLogRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse.WeatherSummary> getWeatherSummary(
            @RequestParam String city,
            Authentication authentication) {

        String farmerId = authentication.getName();
        DashboardSummaryResponse.WeatherSummary summary = weatherService.getLiveWeather(city);

        historyLogRepository.save(HistoryLog.builder()
                .farmerId(farmerId)
                .activityType("Weather Check")
                .inputParameters("City: " + city)
                .resultAction("Temp: " + summary.getTemperature() + ", " + summary.getCondition())
                .createdAt(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(summary);
    }
}