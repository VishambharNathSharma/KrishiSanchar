package com.visioner.krishisanchar.DTO;

public record YieldPredictionResponse(
        Double predictedYieldTonnes,
        Double totalYield,
        String unit,
        Double modelAccuracy
) {}
