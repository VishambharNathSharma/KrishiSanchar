package com.visioner.krishisanchar.DTO;

public record FertilizerInputDto(
   String crop,
   String soilType,
   Double nitrogen,
   Double phosphorus,
   Double potassium
) {}
