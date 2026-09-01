package com.visioner.krishisanchar.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FertilizerInputDto(

        Double temperature,

        Double humidity,

        Double moisture,

        @JsonProperty("Soil_type")
        String soilType,

        @JsonProperty("Crop_type")
        String crop,

        Double nitrogen,

        Double phosphorus,

        Double potassium

) {
}