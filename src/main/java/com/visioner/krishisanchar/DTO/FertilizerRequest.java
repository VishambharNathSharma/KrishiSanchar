package com.visioner.krishisanchar.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FertilizerRequest {
    @NotNull private String targetCrop;
    @JsonProperty("soil_type")
    @NotNull private String soilType;
    @NotNull private Double nitrogen;
    @NotNull private Double phosphorus;
    @NotNull private Double potassium;

}
