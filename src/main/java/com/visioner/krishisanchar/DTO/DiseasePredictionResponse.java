package com.visioner.krishisanchar.DTO;

public record DiseasePredictionResponse(
        String disease,
        Double confidence,
        String severity,
        String remedy
) {}
