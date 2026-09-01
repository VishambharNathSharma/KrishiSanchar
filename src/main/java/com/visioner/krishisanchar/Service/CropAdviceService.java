package com.visioner.krishisanchar.Service;

import com.visioner.krishisanchar.DTO.CropAdviceResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CropAdviceService {
    private final ChatClient chatClient;

    public CropAdviceService(ObjectProvider<ChatClient.Builder> chatClientBuilder) {
        ChatClient.Builder builder = chatClientBuilder.getIfAvailable();
        this.chatClient = builder == null ? null : builder.build();
    }

    public CropAdviceResponse generateAdvice(String crop, Double areaAcres, String location) {
        if (chatClient == null) {
            return new CropAdviceResponse("Not available", List.of("AI advice not configured."));
        }

        String prompt = String.format("""
                You are an agricultural advisor for Indian farmers.
                Crop: %s
                Farm area: %.2f acres
                Location: %s

                Respond ONLY in this exact format, nothing else:
                PROFIT: <a rough estimated profit range in ₹ for this area, e.g. "₹25,000 - ₹35,000">
                TIP1: <first growing tip, one sentence>
                TIP2: <second growing tip, one sentence>
                TIP3: <third growing tip, one sentence>
                """, crop, areaAcres != null ? areaAcres : 1.0, location != null ? location : "India");

        try {
            String content = chatClient.prompt().user(prompt).call().content();
            return parseResponse(content);
        } catch (Exception e) {
            return new CropAdviceResponse("Unavailable right now", List.of("AI tips unavailable: " + e.getMessage()));
        }
    }

    private CropAdviceResponse parseResponse(String content) {
        String profit = "Not available";
        List<String> tips = new java.util.ArrayList<>();

        for (String line : content.split("\n")) {
            line = line.trim();
            if (line.startsWith("PROFIT:")) {
                profit = line.substring("PROFIT:".length()).trim();
            } else if (line.startsWith("TIP1:") || line.startsWith("TIP2:") || line.startsWith("TIP3:")) {
                tips.add(line.substring(line.indexOf(':') + 1).trim());
            }
        }

        if (tips.isEmpty()) {
            tips.add("Consult your local agricultural extension office for region-specific guidance.");
        }

        return new CropAdviceResponse(profit, tips);
    }
}
