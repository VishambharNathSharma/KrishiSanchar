package com.visioner.krishisanchar.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record DataGovResponse(List<MandiRecord> records) {
    public record MandiRecord(
    String state,
    String market,
    String commodity,
    @JsonProperty("min_price") String minPrice,
    @JsonProperty("max_price") String maxPrice,
    @JsonProperty("modal_price") String modalPrice,
    @JsonProperty("arrival_date") String arrivalDate
    ){}
}
