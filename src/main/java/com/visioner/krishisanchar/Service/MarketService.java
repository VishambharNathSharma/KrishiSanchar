package com.visioner.krishisanchar.Service;

import com.fasterxml.jackson.databind.DeserializationContext;
import com.visioner.krishisanchar.DTO.DataGovResponse;
import com.visioner.krishisanchar.DTO.MarketAnalyisResponse;
import com.visioner.krishisanchar.Exception.MarketDataUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketService {
    private final ChatClient chatClient;
    private final RestClient restClient;

    @Value("${mandi.api.url:}")
    private String apiUrl;

    @Value("${mandi.api.key:}")
    private String apiKey;

    public MarketService(ObjectProvider<ChatClient.Builder> chatClientBuilder, RestClient.Builder restClientBuilder) {
        ChatClient.Builder builder = chatClientBuilder.getIfAvailable();
        this.chatClient = builder == null ? null : builder.build();
        this.restClient = restClientBuilder.build();
    }

    public MarketAnalyisResponse getMarketAnalysis(String crop, String state) {
        String targetState = (state != null && !state.isBlank()) ? state : "Delhi";
        DataGovResponse apiResponse = fetchLiveMandiData(crop, targetState);

        if (apiResponse == null || apiResponse.records() == null || apiResponse.records().isEmpty()) {
            throw new MarketDataUnavailableException(crop, targetState);
        }

        DataGovResponse.MandiRecord latestRecord = apiResponse.records().get(0);
        double modalPrice = Double.parseDouble(latestRecord.modalPrice());
        double minPrice = Double.parseDouble(latestRecord.minPrice());
        double maxPrice = Double.parseDouble(latestRecord.maxPrice());

        List<MarketAnalyisResponse.PriceRecord> recentPrices = apiResponse.records().stream()
                .limit(3)
                .map(r -> new MarketAnalyisResponse.PriceRecord(r.market(), r.state(), Double.parseDouble(r.modalPrice()), r.arrivalDate()))
                .collect(Collectors.toList());

        String prompt = String.format("""
                You are an agricultural commodity market expert in India.
                Crop: %s
                Current Live Modal Mandi Price: ₹%.2f / quintal (Min: ₹%.2f, Max: ₹%.2f)
                Market: %s, %s
                Provide a clear, 2-to-3 sentence actionable recommendation for the farmer:
                - State whether to sell immediately or hold.
                - Keep the tone professional and concise.
                """, crop, modalPrice, minPrice, maxPrice, latestRecord.market(), targetState);

        String aiAdvice = chatClient == null
                ? "Market data is available, but AI advice is not configured."
                : chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        return new MarketAnalyisResponse(
                crop, modalPrice, minPrice, maxPrice, "REAL-TIME", targetState, aiAdvice, recentPrices
        );
    }


    private static final Logger log = LoggerFactory.getLogger(MarketService.class);
    @Autowired
    ObjectMapper objectMapper;
    private DataGovResponse fetchLiveMandiData(String crop, String state) {
        try {
            String uri = UriComponentsBuilder
                    .fromUriString(apiUrl)
                    .queryParam("api-key", apiKey)
                    .queryParam("format", "json")
                    .queryParam("filters[commodity]", capitalize(crop))
                    .queryParam("filters[state]", state)
                    .queryParam("limit", "10")
                    .encode()
                    .build()
                    .toUriString();

            log.warn("Calling mandi API: {}", uri);

            ResponseEntity<String> entity = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .toEntity(String.class);



            if (entity.getBody() == null || entity.getBody().isBlank()) {
                return null;
            }

            return objectMapper.readValue(entity.getBody(), DataGovResponse.class);

        } catch (Exception e) {
            log.error("Failed to fetch live API data for crop={}, state={}", crop, state, e);
            return null;
        }
    }
    private String capitalize(String crop) {
        if (crop == null || crop.isBlank()) return crop;
        String c = crop.trim().toLowerCase();
        return Character.toUpperCase(c.charAt(0)) + c.substring(1);
    }
}
