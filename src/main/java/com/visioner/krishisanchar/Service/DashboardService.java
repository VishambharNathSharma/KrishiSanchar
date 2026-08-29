package com.visioner.krishisanchar.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visioner.krishisanchar.DTO.DashboardSummaryResponse;
import com.visioner.krishisanchar.Entity.FarmerProfile;
import com.visioner.krishisanchar.Repository.FarmerProfileRepository;
import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final HistoryLogRepository historyLogRepository;
    private final WeatherService weatherService;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.google.genai.api-key}")
    private String geminiApiKey;

    public DashboardService(
            FarmerProfileRepository farmerProfileRepository,
            HistoryLogRepository historyLogRepository,
            WeatherService weatherService) {

        this.farmerProfileRepository = farmerProfileRepository;
        this.historyLogRepository = historyLogRepository;
        this.weatherService = weatherService;

        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public DashboardSummaryResponse generateDashBoard(String farmerId) {

        // =========================================================
        // 1. GET FARMER PROFILE
        // =========================================================

        FarmerProfile profile = farmerProfileRepository
                .findByFarmerId(farmerId)
                .orElseThrow(() ->
                        new RuntimeException("Farmer profile not found in database"));


        // =========================================================
        // 2. GET LIVE WEATHER
        // =========================================================

        DashboardSummaryResponse.WeatherSummary liveWeather =
                weatherService.getLiveWeather(profile.getLocation());


        // =========================================================
        // 3. GET FARMER HISTORY
        // =========================================================

        List<HistoryLog> logs =
                historyLogRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);


        // =========================================================
        // 4. RECENT ACTIVITIES
        // =========================================================

        List<DashboardSummaryResponse.RecentActivityDto> recentActivity =
                logs.stream()
                        .limit(3)
                        .map(log -> DashboardSummaryResponse.RecentActivityDto.builder()
                                .activityType(log.getActivityType())
                                .details(log.getResultAction())
                                .date(
                                        log.getCreatedAt() != null
                                                ? log.getCreatedAt().toString()
                                                : null
                                )
                                .build())
                        .collect(Collectors.toList());


        // =========================================================
        // 5. DISEASE ALERT COUNT - LAST 7 DAYS
        // =========================================================

        LocalDateTime sevenDaysAgo =
                LocalDateTime.now().minusDays(7);

        long diseaseAlertCount = logs.stream()
                .filter(log ->
                        "Disease Detection".equalsIgnoreCase(
                                log.getActivityType()
                        )
                )
                .filter(log ->
                        log.getCreatedAt() != null &&
                                log.getCreatedAt().isAfter(sevenDaysAgo)
                )
                .count();


        // =========================================================
        // 6. ASK GEMINI FOR TODAY'S ADVICE
        // =========================================================

        String todaysAdvice;

        try {

            String prompt = buildGeminiPrompt(
                    profile,
                    liveWeather,
                    logs,
                    diseaseAlertCount
            );

            todaysAdvice = callGemini(prompt);

        } catch (Exception e) {

            // If Gemini fails, dashboard should still work.
            todaysAdvice = generateFallbackAdvice(liveWeather);
        }


        // =========================================================
        // 7. CROP HEALTH
        // =========================================================

        DashboardSummaryResponse.CropHealthOverview cropHealth =
                calculateCropHealth(diseaseAlertCount);


        // =========================================================
        // 8. FINAL DASHBOARD RESPONSE
        // =========================================================

        return DashboardSummaryResponse.builder()

                .weather(liveWeather)

                .soilStatus(
                        DashboardSummaryResponse.SoilSummary.builder()
                                .overallStatus("Pending soil analysis")
                                .phLevel(null)
                                .moisture(profile.getIrrigationSource())
                                .nutrientsStatus("Pending soil test")
                                .build()
                )

                .adviceAndAlerts(
                        DashboardSummaryResponse.AdviceSummary.builder()
                                .todaysAdvice(todaysAdvice)
                                .activeDiseaseAlerts(
                                        (int) diseaseAlertCount
                                )
                                .build()
                )

                .recentActivity(recentActivity)

                .cropHealth(cropHealth)

                .build();
    }


    // =============================================================
    // GEMINI PROMPT
    // =============================================================

    private String buildGeminiPrompt(
            FarmerProfile profile,
            DashboardSummaryResponse.WeatherSummary weather,
            List<HistoryLog> logs,
            long diseaseAlertCount) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are an agricultural assistant for KrishiSanchar.

                Your job is to provide practical farming advice to a farmer.

                IMPORTANT RULES:
                1. Use only the information provided.
                2. Do not invent weather values.
                3. Do not invent soil measurements.
                4. Do not invent crop diseases.
                5. Keep the advice simple and practical.
                6. Give only today's most useful advice.
                7. Respond in plain text.
                8. Keep the answer between 1 and 3 sentences.

                FARMER INFORMATION:
                """);

        prompt.append("\nLocation: ")
                .append(profile.getLocation());

        prompt.append("\nIrrigation source: ")
                .append(profile.getIrrigationSource());


        // ---------------------------------------------------------
        // WEATHER
        // ---------------------------------------------------------

        if (weather != null) {

            prompt.append("\n\nCURRENT WEATHER:");

            prompt.append("\nTemperature: ")
                    .append(weather.getTemperature());

            prompt.append("\nCondition: ")
                    .append(weather.getCondition());

            prompt.append("\nHumidity: ")
                    .append(weather.getHumidity());

            prompt.append("\nWind: ")
                    .append(weather.getWind());

            prompt.append("\nRain: ")
                    .append(weather.getRain());
        }


        // ---------------------------------------------------------
        // DISEASE INFORMATION
        // ---------------------------------------------------------

        prompt.append("\n\nDISEASE DETECTIONS IN LAST 7 DAYS: ")
                .append(diseaseAlertCount);


        // ---------------------------------------------------------
        // RECENT ACTIVITIES
        // ---------------------------------------------------------

        prompt.append("\n\nRECENT FARMER ACTIVITIES:");

        logs.stream()
                .limit(5)
                .forEach(log -> {

                    prompt.append("\nActivity: ")
                            .append(log.getActivityType());

                    prompt.append(" | Result: ")
                            .append(log.getResultAction());

                    prompt.append(" | Date: ")
                            .append(log.getCreatedAt());
                });


        prompt.append("""

                
                Now provide today's farming advice.

                Do not use markdown.
                Do not add headings.
                """);

        return prompt.toString();
    }


    // =============================================================
    // CALL GEMINI API
    // =============================================================

    private String callGemini(String prompt) throws Exception {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/"
                        + "models/gemini-3.7-flash:generateContent";


        // ---------------------------------------------------------
        // REQUEST BODY
        // ---------------------------------------------------------

        String requestBody = objectMapper.createObjectNode()
                .putArray("contents")
                .addObject()
                .putArray("parts")
                .addObject()
                .put("text", prompt)
                .toString();


        // ---------------------------------------------------------
        // HEADERS
        // ---------------------------------------------------------

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.set(
                "x-goog-api-key",
                geminiApiKey
        );


        // ---------------------------------------------------------
        // HTTP REQUEST
        // ---------------------------------------------------------

        HttpEntity<String> request =
                new HttpEntity<>(requestBody, headers);


        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        request,
                        String.class
                );


        // ---------------------------------------------------------
        // CHECK RESPONSE
        // ---------------------------------------------------------

        if (!response.getStatusCode().is2xxSuccessful()) {

            throw new RuntimeException(
                    "Gemini API returned: "
                            + response.getStatusCode()
            );
        }


        // ---------------------------------------------------------
        // PARSE GEMINI RESPONSE
        // ---------------------------------------------------------

        JsonNode root =
                objectMapper.readTree(response.getBody());

        JsonNode textNode =
                root.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text");


        if (textNode.isMissingNode() ||
                textNode.asText().isBlank()) {

            throw new RuntimeException(
                    "Gemini returned an empty response"
            );
        }


        return textNode.asText().trim();
    }


    // =============================================================
    // CROP HEALTH
    // =============================================================

    private DashboardSummaryResponse.CropHealthOverview
    calculateCropHealth(long diseaseAlertCount) {

        if (diseaseAlertCount == 0) {

            return DashboardSummaryResponse.CropHealthOverview.builder()
                    .healthyPercentage(100)
                    .atRiskPercentage(0)
                    .diseasedPercentage(0)
                    .build();
        }


        if (diseaseAlertCount <= 2) {

            return DashboardSummaryResponse.CropHealthOverview.builder()
                    .healthyPercentage(70)
                    .atRiskPercentage(20)
                    .diseasedPercentage(10)
                    .build();
        }


        return DashboardSummaryResponse.CropHealthOverview.builder()
                .healthyPercentage(50)
                .atRiskPercentage(30)
                .diseasedPercentage(20)
                .build();
    }


    // =============================================================
    // FALLBACK IF GEMINI IS DOWN
    // =============================================================

    private String generateFallbackAdvice(
            DashboardSummaryResponse.WeatherSummary weather) {

        if (weather == null) {

            return "Check your soil moisture and crop condition before irrigation or treatment.";
        }

        String rain = weather.getRain();

        if (rain != null &&
                rain.toLowerCase().contains("rain")) {

            return "Rain is expected, so avoid unnecessary irrigation and postpone spraying pesticides or fertilizers if possible.";
        }

        return "Weather conditions appear suitable for routine farm activities. Check soil moisture before irrigation.";
    }
}