package com.visioner.krishisanchar.Controller;

import com.visioner.krishisanchar.model.mongo.HistoryLog;
import com.visioner.krishisanchar.model.mongo.HistoryLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("api/v1/history")
@CrossOrigin(origins = "*")
public class HistoryController {
    private final HistoryLogRepository historyLogRepository;

    public HistoryController(HistoryLogRepository historyLogRepository){
        this.historyLogRepository = historyLogRepository;
    }

    @GetMapping("/{farmerId}")
    public ResponseEntity<List<HistoryLog>> getFarmerHistory(@PathVariable String farmerId) {

        List<HistoryLog> logs = historyLogRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        return ResponseEntity.ok(logs);
    }
}
