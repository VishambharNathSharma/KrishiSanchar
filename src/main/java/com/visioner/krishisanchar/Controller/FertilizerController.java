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

@RestController
@RequestMapping("api/v1/fertilizer")
@CrossOrigin(origins = "*")
public class FertilizerController {
    private final HistoryLogRepository historyLogRepository;


    public FertilizerController(HistoryLogRepository historyLogRepository) {
        this.historyLogRepository = historyLogRepository;
    }


}
