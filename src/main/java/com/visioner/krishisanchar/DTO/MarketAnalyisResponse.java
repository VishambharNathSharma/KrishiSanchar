package com.visioner.krishisanchar.DTO;

import java.util.List;

public record MarketAnalyisResponse(
        String crop,
        Double modalPrice,
        Double minPrice,
        Double maxPrice,
        String priceTrend,
        String marketLocation,
        String aiSellingAdvice,
        List<PriceRecord> recentMandiPrices
) {
    public record PriceRecord(String market,String state,Double price,String arrivalDate) {}
}
