package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.DTO.MarketAnalyisResponse;
import com.visioner.krishisanchar.Service.MarketService;
import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("api/v1/market")
@CrossOrigin(origins = "*")
public class MarketController {
    private final MarketService marketService;
    private final HistoryLogRepository historyLogRepository;

    public MarketController(MarketService marketService,HistoryLogRepository historyLogRepository){
        this.marketService = marketService;
        this.historyLogRepository = historyLogRepository;
    }

    @GetMapping("/prices")
    public ResponseEntity<MarketAnalyisResponse> getMandiPrices(
            @RequestParam String crop,
            @RequestParam(required = false, defaultValue = "Delhi") String state,
            @RequestHeader(value = "X-Farmer-Id", defaultValue = "KS-98745-DEL") String farmerId){
        MarketAnalyisResponse response = marketService.getMarketAnalysis(crop, state);

        historyLogRepository.save(HistoryLog.builder().
                farmerId(farmerId).activityType("Market Analysis").inputParameters("Crop: " + crop + ", State: " + state).resultAction(String.format("Price: ₹%.2f/qtl (%s trend)",response.modalPrice(),response.priceTrend())).createdAt(LocalDateTime.now()).build());

        return ResponseEntity.ok(response);
    }
}
