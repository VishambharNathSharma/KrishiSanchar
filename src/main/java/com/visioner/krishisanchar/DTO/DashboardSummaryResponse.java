package com.visioner.krishisanchar.DTO;



import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardSummaryResponse {

    private WeatherSummary weather;
    private SoilSummary soilStatus;
    private AdviceSummary adviceAndAlerts;
    private List<RecentActivityDto> recentActivity;
    private CropHealthOverview cropHealth;

    // --- Nested DTO Classes for clean grouping ---

    @Data
    @Builder
    public static class WeatherSummary {
        private String temperature;
        private String condition;
        private String humidity;
        private String wind;
        private String rain;
    }

    @Data
    @Builder
    public static class SoilSummary {
        private String overallStatus;
        private Double phLevel; // Double allows for null values when sensors are pending
        private String moisture;
        private String nutrientsStatus;
    }

    @Data
    @Builder
    public static class AdviceSummary {
        private String todaysAdvice;
        private Integer activeDiseaseAlerts;
    }

    @Data
    @Builder
    public static class RecentActivityDto {
        private String activityType;
        private String details;
        private String date;
    }

    @Data
    @Builder
    public static class CropHealthOverview {
        private int healthyPercentage;
        private int atRiskPercentage;
        private int diseasedPercentage;
    }
}
