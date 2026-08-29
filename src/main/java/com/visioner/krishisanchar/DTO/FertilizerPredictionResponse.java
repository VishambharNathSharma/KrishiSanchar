package com.visioner.krishisanchar.DTO;

import java.util.List;

public record FertilizerPredictionResponse(
        String recommendedFertilizer,
        Double urea,
        Double dap,
        Double mop,
        List<String> schedule
) {}
