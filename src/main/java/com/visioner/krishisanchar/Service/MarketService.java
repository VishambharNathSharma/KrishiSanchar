package com.visioner.krishisanchar.Service;

import com.visioner.krishisanchar.DTO.DataGovResponse;
import com.visioner.krishisanchar.DTO.MarketAnalyisResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketService {
    private final ChatClient chatClient;
    private final RestClient restClient;

    @Value("${mandi.api.url}")
    private String apiUrl;

    @Value("${mandi.api.key}")
    private String apiKey;

    public MarketService(ChatClient.Builder chatClientBuilder, RestClient.Builder restClientBuilder) {
        this.chatClient = chatClientBuilder.build();
        this.restClient = restClientBuilder.build();
    }

    public MarketAnalyisResponse getMarketAnalysis(String crop, String state) {
        String targetState = (state != null && !state.isBlank()) ? state : "Delhi";
        DataGovResponse apiResponse = fetchLiveMandiData(crop,targetState);
        if(apiResponse == null || apiResponse.records() == null || apiResponse.records().isEmpty()){
            throw new RuntimeException("No live market data available for" + crop + " in " + targetState + " today.");
        }
        DataGovResponse.MandiRecord latestRecord = apiResponse.records().get(0);
        double modalPrice = Double.parseDouble(latestRecord.modalPrice());
        double minPrice = Double.parseDouble(latestRecord.minPrice());
        double maxPrice = Double.parseDouble(latestRecord.maxPrice());

        List<MarketAnalyisResponse.PriceRecord> recentPrices = apiResponse.records().stream()
                .limit(3)
                .map(r -> new MarketAnalyisResponse.PriceRecord(r.market(),r.state(),Double.parseDouble(r.modalPrice()),r.arrivalDate()))
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

        String aiAdvice = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        return new MarketAnalyisResponse(
               crop, modalPrice, minPrice, maxPrice, "REAL-TIME", targetState, aiAdvice, recentPrices
        );

    }
    private DataGovResponse fetchLiveMandiData(String crop, String state){
        try {
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("api.data.gov.in")
                            .path("/resource/9ef84268-d588-465a-a308-a864a43d0070")
                            .queryParam("api-key", apiKey)
                            .queryParam("format", "json")
                            .queryParam("filters[commodity]", crop.toUpperCase())
                            .queryParam("filters[state]", state)
                            .queryParam("limit", "5")
                            .build())
                    .retrieve()
                    .body(DataGovResponse.class);
        } catch (Exception e){
            System.err.println("Failed to fetch live API data: " + e.getMessage());
            return null;
        }
    }
}
