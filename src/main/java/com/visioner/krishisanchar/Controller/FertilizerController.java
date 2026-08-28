package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.DTO.FertilizerRequest;
import com.visioner.krishisanchar.DTO.FertilizerResponse;
import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;


import com.visioner.krishisanchar.DTO.FertilizerInputDto;
import com.visioner.krishisanchar.DTO.FertilizerPredictionResponse;
import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import com.visioner.krishisanchar.Service.MlBridgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/fertilizer")
@CrossOrigin(origins = "*")
public class FertilizerController {

    private final MlBridgeService mlService;
    private final HistoryLogRepository historyRepository;

    public FertilizerController(MlBridgeService mlService, HistoryLogRepository historyRepository) {
        this.mlService = mlService;
        this.historyRepository = historyRepository;
    }

    @PostMapping("/predict")
    public ResponseEntity<FertilizerPredictionResponse> getFertilizerRecommendation(
            @RequestBody FertilizerInputDto input,
            Authentication authentication) {

        // Securely extract farmerId from the validated JWT token
        String farmerId = authentication.getName();

        // Call the Python ML API via the bridge service
        FertilizerPredictionResponse response = mlService.predictFertilizer(input);

        // Log the activity to MongoDB for the user's dashboard history
        logActivity(farmerId, "Fertilizer Rec.", "Recommended: " + response.recommendedFertilizer());

        return ResponseEntity.ok(response);
    }

    private void logActivity(String farmerId, String type, String result) {
        historyRepository.save(HistoryLog.builder()
                .farmerId(farmerId)
                .activityType(type)
                .inputParameters("ML Prediction Request")
                .resultAction(result)
                .createdAt(LocalDateTime.now())
                .build());
    }
}
