package com.visioner.krishisanchar.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visioner.krishisanchar.DTO.FertilizerAdviceResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

@Service
public class FertilizerAdviceService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public FertilizerAdviceService(
            ObjectProvider<ChatClient.Builder> chatClientBuilder,
            ObjectMapper objectMapper) {

        ChatClient.Builder builder = chatClientBuilder.getIfAvailable();

        this.chatClient = builder == null ? null : builder.build();
        this.objectMapper = objectMapper;
    }

    public FertilizerAdviceResponse generateAdvice(
            String crop,
            String soilType,
            String fertilizer) {

        if (chatClient == null) {
            return new FertilizerAdviceResponse(
                    "AI advice is not configured.",
                    "AI application guidance is not configured.",
                    "AI timing guidance is not configured.",
                    "AI precaution guidance is not configured."
            );
        }

        String prompt = String.format("""
                You are an agricultural expert helping Indian farmers.

                Crop: %s
                Soil Type: %s
                Recommended Fertilizer: %s

                Return ONLY valid JSON with exactly these fields:

                {
                  "explanation": "Give a short practical advice to the farmer about using this fertilizer.",
                  "application": "Explain how to apply the fertilizer.",
                  "bestTime": "Explain the best time or crop growth stage to apply it.",
                  "precautions": "Give important precautions while applying and storing it."
                }

                Rules:
                - Do not include a section explaining why the fertilizer was recommended.
                - Keep the advice practical and easy to understand.
                - Keep each field concise.
                - Do not invent highly specific dosage values unless reliable.
                - Do not include markdown code fences.
                """,
                crop,
                soilType,
                fertilizer
        );

        try {

            String result = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();

            if (result == null || result.isBlank()) {
                throw new RuntimeException("Empty AI response");
            }

            String json = result
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            JsonNode node = objectMapper.readTree(json);

            return new FertilizerAdviceResponse(
                    node.path("explanation")
                            .asText("No additional advice available."),

                    node.path("application")
                            .asText("No application guidance available."),

                    node.path("bestTime")
                            .asText("No timing guidance available."),

                    node.path("precautions")
                            .asText("No precaution guidance available.")
            );

        } catch (Exception e) {

            return new FertilizerAdviceResponse(
                    "AI advice is temporarily unavailable.",
                    "Application guidance is temporarily unavailable.",
                    "Timing guidance is temporarily unavailable.",
                    "Precaution guidance is temporarily unavailable."
            );
        }
    }
}