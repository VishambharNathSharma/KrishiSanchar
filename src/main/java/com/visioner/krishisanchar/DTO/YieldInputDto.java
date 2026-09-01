package com.visioner.krishisanchar.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public record YieldInputDto(
        String crop,
        Double area,
        @JsonProperty("fertilizer_used")
        Double fertilizerUsed,
        @JsonProperty("soil_quality")
                String soilQuality,
        Double rainfall
) {}
