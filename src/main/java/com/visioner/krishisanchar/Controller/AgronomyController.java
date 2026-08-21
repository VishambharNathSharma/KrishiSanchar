package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.DTO.*;
import com.visioner.krishisanchar.Service.MlBridgeService;
import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/agronomy")
@CrossOrigin(origins = "http://localhost:3000")
public class AgronomyController {
    private final MlBridgeService mlService;
    private final HistoryLogRepository historyLogRepository;

    public AgronomyController(MlBridgeService mlService, HistoryLogRepository historyLogRepository){
       this.mlService = mlService;
       this.historyLogRepository = historyLogRepository;
    }

    @PostMapping("/crop")
    public ResponseEntity<CropPredictionResponse> getCrop(@RequestBody CropInput input, @RequestHeader("X-Farmer-Id") String farmerId){
        CropPredictionResponse response = mlService.predictCrop(input);
        logActivity(farmerId,"Crop Rec.", "Recommended" + response.recommendedCrop());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fertilizer")
    public ResponseEntity<FertilizerPredictionResponse> getFertilizer(@RequestBody FertilizerInputDto input, @RequestHeader("X-Farmer-Id") String farmerId){
        FertilizerPredictionResponse response = mlService.predictFertilizer(input);
        logActivity(farmerId,"Fertilizer Rec.", "Recommended" + response.recommendedFertilizer());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/yield")
    public ResponseEntity<YieldPredictionResponse> getYield(@RequestBody YieldInputDto input , @RequestHeader("X-Farmer-Id") String farmerId){
        YieldPredictionResponse response = mlService.predictYield(input);
        logActivity(farmerId,"Yield Rec.", "Estimated" + response.predictedYieldTonnes() + " t/ha");
        return ResponseEntity.ok(response);
    }

    @PostMapping(value="/disease" , consumes= MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiseasePredictionResponse> getDisease(@RequestParam("image") MultipartFile image,@RequestHeader("X-Farmer-Id") String farmerId) throws IOException {
        DiseasePredictionResponse response = mlService.predictDisease(image);
        logActivity(farmerId,"Disease Detection", response.disease() + " Detected");
        return ResponseEntity.ok(response);
    }


    private void logActivity(String farmerId, String type, String result){
        historyLogRepository.save(HistoryLog.builder()
                        .farmerId(farmerId)
                        .activityType(type)
                        .resultAction(result)
                        .createdAt(LocalDateTime.now())
                        .build());
    }
}
