package com.visioner.krishisanchar.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiAiService {

    // Pulls your API key from application.properties
    @Value("${GEMINI_API_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAiService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public String getChatResponse(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            return "The AI assistant is not configured. Set GEMINI_API_KEY and restart the application.";
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + apiKey;

        // Give the AI its persona and append the user's prompt
        String systemInstruction = "You are an expert agriculture AI assistant named KrishiSanchar. Answer this farmer's query concisely and helpfully in plain text. Query: ";

        // Structure the JSON payload exactly how Google's API expects it
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", systemInstruction + prompt)
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            // Parse the JSON response to extract just the text reply
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "I apologize, but I am currently unable to process your request. Please try again later.";
        }
    }
}
