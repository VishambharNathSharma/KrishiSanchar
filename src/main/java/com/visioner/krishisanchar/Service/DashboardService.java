package com.visioner.krishisanchar.Service;

import com.visioner.krishisanchar.DTO.DashboardSummaryResponse;
import com.visioner.krishisanchar.Entity.FarmerProfile;
import com.visioner.krishisanchar.Repository.FarmerProfileRepository;
import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {
   private final FarmerProfileRepository farmerProfileRepository;
   private final HistoryLogRepository historyLogRepository;
   private final WeatherService weatherService;

    public DashboardService(FarmerProfileRepository farmerProfileRepository, HistoryLogRepository historyLogRepository, WeatherService weatherService) {
        this.farmerProfileRepository = farmerProfileRepository;
        this.historyLogRepository = historyLogRepository;
        this.weatherService = weatherService;
    }
    public DashboardSummaryResponse generateDashBoard(String farmerId){
        FarmerProfile profile = farmerProfileRepository.findByFarmerId(farmerId).orElseThrow(()->new RuntimeException("Farmer profile not found in database"));
        DashboardSummaryResponse.WeatherSummary liveWeather = weatherService.getLiveWeather(profile.getLocation());

        List<HistoryLog> log = historyLogRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        List<DashboardSummaryResponse.RecentActivityDto> dynamicActivity = log.stream()
                .limit(3)
                .map(logs-> DashboardSummaryResponse.RecentActivityDto.builder()
                        .activityType(logs.getActivityType())
                        .details(logs.getResultAction()) // Using the actual calculated result
                        .date(logs.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        long diseaseAlertCount = log.stream().filter(logs -> logs.getActivityType().equals("Disease Detection") &&
               logs.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(7))).count();

        return DashboardSummaryResponse.builder()
                .weather(liveWeather)
                .soilStatus(DashboardSummaryResponse.SoilSummary.builder()
                        .overallStatus("Evaluate via AI")
                        .phLevel(null) // Replace with dynamic soil test data
                        .moisture(profile.getIrrigationSource())
                        .nutrientsStatus("Pending Test")
                        .build())
                .adviceAndAlerts(DashboardSummaryResponse.AdviceSummary.builder()
                        .todaysAdvice(generateDynamicAdvice(liveWeather))
                        .activeDiseaseAlerts((int) diseaseAlertCount)
                        .build())
                .recentActivity(dynamicActivity)
                .cropHealth(DashboardSummaryResponse.CropHealthOverview.builder()
                        .healthyPercentage(diseaseAlertCount > 0 ? 80 : 100) // Simple dynamic logic
                        .atRiskPercentage(diseaseAlertCount > 0 ? 20 : 0)
                        .diseasedPercentage(0)
                        .build())
                .build();

    }

    private String generateDynamicAdvice(DashboardSummaryResponse.WeatherSummary weather) {
        if (weather != null && weather.getRain().contains("Rain")) {
            return "Heavy rain expected. Avoid spraying pesticides or fertilizers today.";
        }
        return "Weather is clear. Good time for scheduled irrigation.";
    }

}
