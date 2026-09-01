package com.visioner.krishisanchar.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FertilizerPredictionResponse(

        @JsonProperty("recommended_fertilizer")
        String recommendedFertilizer,

        String explanation,

        String application,

        String bestTime,

        String precautions

) {}
