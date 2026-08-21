package com.visioner.krishisanchar.DTO;

public record CropPredictionResponse(
        String recommendedCrop,
        Double confidence
) {}
