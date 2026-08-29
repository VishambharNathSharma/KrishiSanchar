package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.Entity.HistoryLog;
import com.visioner.krishisanchar.Repository.HistoryLogRepository;
import com.visioner.krishisanchar.Service.GeminiAiService;
import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*")
public class AiController {

    // Assuming you have a service that handles the Gemini API call
    private final GeminiAiService aiService;
    private final com.visioner.krishisanchar.model.mongo.HistoryLogRepository historyRepository;

    public AiController(GeminiAiService aiService, com.visioner.krishisanchar.model.mongo.HistoryLogRepository historyRepository) {
        this.aiService = aiService;
        this.historyRepository = historyRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithAi(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String farmerId = authentication.getName();
        String userMessage = request.get("message");

        // Call your Gemini AI integration
        String aiResponse = aiService.getChatResponse(userMessage);

        // Save the interaction to the History Log
        historyRepository.save(com.visioner.krishisanchar.model.mongo.HistoryLog.builder()
                .farmerId(farmerId)
                .activityType("AI Assistant")
                .inputParameters(userMessage.length() > 50 ? userMessage.substring(0, 47) + "..." : userMessage)
                .resultAction("Answered via Gemini AI")
                .createdAt(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(Map.of("reply", aiResponse));
    }
}