package com.visioner.krishisanchar.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FertilizerRequest {
    @NotNull private String targetCrop;
    @NotNull private String soilType;
    @NotNull private Double nitrogen;
    @NotNull private Double phosphorus;
    @NotNull private Double potassium;

}
